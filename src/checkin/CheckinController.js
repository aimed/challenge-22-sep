import { Model } from "mongoose";
import { SeatAvailability } from "../seat/SeatAvailability";
import { CheckinReservationStatus } from "./CheckinReservationStatus";
import { CreditCardPaymentService } from "../payments/CreditCardPaymentService";

export class CheckinController {
    /**
     * Creates an instance of CheckinController.
     * @param {Model} seatModel
     * @param {CreditCardPaymentService} creditCardPaymentService
     * @memberof CheckinController
     */
    constructor(seatModel, creditCardPaymentService) {
        this.seatModel = seatModel;
        this.paymentServices = {
            creditCard: creditCardPaymentService || new CreditCardPaymentService()
        };
    }

    /**
     * Gets the checkin for the passenger if applicable.
     *
     * @memberof CheckinController
     */
    checkinsForPassenger = (planeId, passengerId) => {
        return this.seatModel.findOne({
            planeId: planeId,
            assignedTo: passengerId,
            availability: { $not: { $eq: SeatAvailability.available } }
        });
    }

    /**
     * Checks in the passenger.
     *
     * @memberof CheckinController
     */
    checkin = async (request, response) => {
        const passengerId = request.body.passengerId;
        if (!passengerId) {
            throw new Error('Requires: passengerId');
        }

        const planeId = request.params.planeId;
        if (!planeId) {
            throw new Error('Required: planeId');
        }

        const existingCheckins = await this.checkinsForPassenger(planeId, passengerId);
        if (existingCheckins) {
            throw new Error(`Passenger with id ${passengerId} has already checked into plane ${planeId}`);
        }

        const seatId = request.params.seatId;
        const seat = await (seatId ? this.getSeat(seatId) : this.getRandomAvailableSeat(planeId));
        if (!seat.available) {
            throw new Error('Unavaiable seat ' + seat._id);
        }

        // Only show public properties
        const publicSeat = {
            _id: seat.id,
            label: seat.label,
            seatType: seat.seatType,
            available: false,
        };

        const fee = seat.fee;
        const isFreeCheckin = !seatId || fee === 0;
        const availability = isFreeCheckin ? SeatAvailability.unavailable : SeatAvailability.reserved;
        const reservedUntil = Date.now() + (3 * 60 * 1000);
        await this.seatModel.findByIdAndUpdate(seat._id, {
            assignedTo: passengerId,
            reservedUntil,
            availability
        });

        if (isFreeCheckin) {
            return {
                passengerId,
                seat: publicSeat,
                reservation: {
                    status: CheckinReservationStatus.checkedIn
                }
            };
        }

        return {
            passengerId,
            seat: publicSeat,
            reservation: {
                status: CheckinReservationStatus.reserved,
                reservedUntil,
                fee,
            }
        };
    }

    /**
     * Cancel the reservation for a seat.
     *
     * @memberof CheckinController
     */
    cancel = async (request, response) => {
        const passengerId = request.body.passengerId;
        if (!passengerId) {
            throw new Error('Requires: passengerId');
        }

        const seatId = request.params.seatId;
        const result = await this.seatModel.updateOne(
            { _id: seatId, assignedTo: passengerId, availability: SeatAvailability.reserved },
            { availability: SeatAvailability.available, assignedTo: null },
            { new: true });

        if (!result) {
            throw new Error(`The seat with id ${seatId} has not been reserved for passenger ${passengerId}`);
        }

        return {
            status: 'success'
        };
    }

    /**
     * Pay for the checkin.
     *
     * @memberof CheckinController
     */
    pay = async (request, response) => {
        const passengerId = request.body.passengerId;
        if (!passengerId) {
            throw new Error('Requires: passengerId');
        }

        const paymentMethod = request.body.paymentMethod;
        if (!paymentMethod || paymentMethod !== 'creditCard') {
            throw new Error('Invalid payment method. Expected creditCard but received ' + paymentMethod);
        }

        const paymentDetails = request.body[paymentMethod];
        if (!paymentDetails) {
            throw new Error(`Invalid data for payment method ${paymentMethod}`);
        }

        const paymentService = this.paymentServices.creditCard;

        const seatId = request.params.seatId;
        const seat = await this.seatModel.findOne({
            _id: seatId,
            assignedTo: passengerId,
            availability: { $not: { $eq: SeatAvailability.unavailable } }
        });

        if (!seat) {
            throw new Error(`The seat ${seatId} has already been taken`);
        }

        const paymentWasSuccessfull = await paymentService.pay(paymentDetails);
        if (!paymentWasSuccessfull) {
            throw new Error('The payment could not be processed')
        }

        await this.seatModel.findByIdAndUpdate(
            seat._id,
            { availability: SeatAvailability.unavailable });

        // Only show public properties
        const seatResponse = {
            _id: seat._id,
            label: seat.label,
            seatType: seat.seatType,
            available: false,
        };

        return {
            passengerId,
            seat: seatResponse,
            reservation: { status: CheckinReservationStatus.checkedIn }
        };
    }

    /**
     * Get a seat with the given id ensuring that it exists.
     *
     * @memberof CheckinController
     */
    getSeat = async (seatId) => {
        const seat = this.seatModel.findById(seatId);

        if (!seat) {
            throw new Error('Unknown seatId ' + seatId);
        }

        return seat;
    }

    /**
     * Get a random available seat for the given plane.
     *
     * @memberof CheckinController
     */
    getRandomAvailableSeat = async (planeId) => {
        const randomSeat = await this.seatModel.findOne({
            planeId: planeId,
            $or: [
                { availability: SeatAvailability.available },
                { availability: SeatAvailability.reserved, reservedUntil: { $lt: Date.now() } }
            ]
        });

        if (!randomSeat) {
            throw new Error('No empty seats available for plane ' + planeId);
        }

        return randomSeat;
    }
}