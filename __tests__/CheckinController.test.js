import { testKit } from "./utils/testKit";
import { CheckinController } from "../src/checkin/CheckinController";
import { createTestSeats } from "./utils/createTestSeats";
import { createPassengerId } from "./utils/createPassengerId";
import { CheckinReservationStatus } from "../src/checkin/CheckinReservationStatus";
import { SeatAvailability } from "../src/seat/SeatAvailability";

describe('CheckinController', () => {
    const { container, setup, teardown } = testKit();

    beforeAll(setup);
    afterAll(teardown);
    const getCheckinController = () => new CheckinController(container.models.Seat);

    it('should perform a checkin with no seatId', async () => {
        const controller = getCheckinController();
        const { plane } = await createTestSeats(container.models);
        const passengerId = createPassengerId();
        const planeId = plane._id;

        const request = {
            body: { passengerId },
            params: { planeId }
        };
        const response = await controller.checkin(request);
        expect(response).toBeTruthy();
        expect(response.passengerId).toBe(passengerId);
        expect(response.seat).toBeTruthy();
        expect(response.reservation).toBeTruthy();
        expect(response.reservation.status).toBe(CheckinReservationStatus.checkedIn);

        const seat = await controller.seatModel.findById(response.seat._id);
        expect(seat).toBeTruthy();
        expect(seat.assignedTo).toBeTruthy();
        expect(seat.assignedTo).toBe(passengerId);
        expect(seat.availability).toBe(SeatAvailability.unavailable);
    });

    it('should perform a checkin with a free seatId and check into that seat', async () => {
        const controller = getCheckinController();
        const { plane, freeSeat } = await createTestSeats(container.models);
        const seatId = freeSeat._id;
        const passengerId = createPassengerId();
        const planeId = plane._id;

        const request = {
            body: { passengerId },
            params: { planeId, seatId }
        };
        const response = await controller.checkin(request);
        expect(response).toBeTruthy();
        expect(response.passengerId).toBe(passengerId);
        expect(response.seat).toBeTruthy();
        expect(response.seat._id.toString()).toBe(seatId.toString());
        expect(response.reservation).toBeTruthy();
        expect(response.reservation.status).toBe(CheckinReservationStatus.checkedIn);

        const seat = await controller.seatModel.findById(response.seat._id);
        expect(seat).toBeTruthy();
        expect(seat.assignedTo).toBeTruthy();
        expect(seat.assignedTo).toBe(passengerId);
        expect(seat.availability).toBe(SeatAvailability.unavailable);
    });

    it('should register a seat that is not free', async () => {
        const controller = getCheckinController();
        const { plane, expensiveSeat } = await createTestSeats(container.models);
        const seatId = expensiveSeat._id;
        const planeId = plane._id;
        const passengerId = createPassengerId();

        const request = {
            body: { passengerId },
            params: { planeId, seatId }
        };
        const response = await controller.checkin(request);
        expect(response).toBeTruthy();
        expect(response.passengerId).toBe(passengerId);
        expect(response.seat).toBeTruthy();
        expect(response.seat._id.toString()).toBe(seatId.toString());
        expect(response.reservation).toBeTruthy();
        expect(response.reservation.status).toBe(CheckinReservationStatus.reserved);
        expect(response.reservation.fee).toBe(expensiveSeat.fee);
        expect(response.reservation.reservedUntil).toBeGreaterThan(Date.now());

        const seat = await controller.seatModel.findById(response.seat._id);
        expect(seat).toBeTruthy();
        expect(seat.assignedTo).toBeTruthy();
        expect(seat.assignedTo).toBe(passengerId);
        expect(seat.availability).toBe(SeatAvailability.reserved);
        expect(seat.reservedUntil).toBe(response.reservation.reservedUntil);
    });

    it('should cancel a reserved seat', async () => {
        const controller = getCheckinController();
        const passengerId = createPassengerId();
        const { freeSeat } = await createTestSeats(container.models);
        const seatReserved = await controller.seatModel.findByIdAndUpdate(freeSeat._id, { assignedTo: passengerId, availability: SeatAvailability.reserved }, { new: true });
        expect(seatReserved).toBeTruthy();
        expect(seatReserved.assignedTo).toBe(passengerId);
        expect(seatReserved.availability).toBe(SeatAvailability.reserved);
        
        const request = {
            body: { passengerId },
            params: { seatId: seatReserved._id }
        };
        const response = await controller.cancel(request);
        expect(response).toBeTruthy();
        
        const seatUpdated = await controller.seatModel.findById(seatReserved._id);
        expect(seatUpdated.assignedTo).toBeFalsy();
        expect(seatUpdated.availability).toBe(SeatAvailability.available);
    });

    it('should not be able to reserve or checkin multiple seats for one user', async () => {
        const controller = getCheckinController();
        const passengerId = createPassengerId();
        const { freeSeat, expensiveSeat, planeId } = await createTestSeats(container.models);
        const expensiveSeatCheckinRequest = {
            params: { planeId, seatId: expensiveSeat._id },
            body: { passengerId }
        };
        const reserveResponse = await controller.checkin(expensiveSeatCheckinRequest);
        expect(reserveResponse).toBeTruthy();

        const freeSeatCheckinRequest = {
            params: { planeId, seatId: freeSeat._id },
            body: { passengerId }
        };
        expect(controller.checkin(freeSeatCheckinRequest)).rejects.toBeTruthy();
    });


    it('should check in after a successfull payment', async () => {
        const controller = getCheckinController();
        const passengerId = createPassengerId();
        const { expensiveSeat, planeId } = await createTestSeats(container.models);
        const checkinRequest = {
            params: { planeId, seatId: expensiveSeat._id },
            body: { passengerId }
        };
        await controller.checkin(checkinRequest);
        const payRequest = {
            params: { planeId, seatId: expensiveSeat._id },
            body: { passengerId, paymentMethod: 'creditCard', creditCard: {} }
        };
        const paymentResponse = await controller.pay(payRequest);
        expect(paymentResponse).toBeTruthy();
        expect(paymentResponse.seat._id.toString()).toBe(expensiveSeat._id.toString());
        expect(paymentResponse.passengerId).toBe(passengerId);
        expect(paymentResponse.reservation.status).toBe(CheckinReservationStatus.checkedIn);
    });
});