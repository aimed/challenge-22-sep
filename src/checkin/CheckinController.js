import { Model } from "mongoose";
import { SeatAvailability } from "../seat/SeatAvailability";
import { CheckinReservationStatus } from "./CheckinReservationStatus";

export class CheckinController {
    /**
     * Creates an instance of CheckinController.
     * @param {Model} seatModel
     * @memberof CheckinController
     */
    constructor(seatModel) {
        this.seatModel = seatModel;
    }

    checkinsForPassenger = (planeId, passengerId) => {
        return this.seatModel.findOne({ planeId: planeId, assignedTo: passengerId });
    }

    checkin = async (request, response) => {
        // TODO: Check that no seat is assigned to that user.
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

        const seatResponse = {
            _id: seat.id,
            label: seat.label,
            seatType: seat.seatType,
            available: false,
        };

        // TODO: Update when checking?
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
                seat: seatResponse,
                reservation: { status: CheckinReservationStatus.checkedIn }
            };
        }

        return {
            passengerId,
            seat: seatResponse,
            reservation: { status: CheckinReservationStatus.reserved, reservedUntil: reservedUntil, fee: fee }
        };
    }

    cancel = async (request, response) => {
        const passengerId = request.body.passengerId;
        if (!passengerId) {
            throw new Error('Requires: passengerId');
        }

        const seatId = request.params.seatId;
        const result = await this.seatModel.updateOne({ assignedTo: passengerId, availability: SeatAvailability.reserved }, { availability: SeatAvailability.available, assignedTo: null });
        console.log(result);

        return {
            status: 'success'
        };
    }

    getSeat = async (seatId) => {
        const seat = this.seatModel.findById(seatId);

        if (!seat) {
            throw new Error('Unknown seatId ' + seatId);
        }

        return seat;
    }

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