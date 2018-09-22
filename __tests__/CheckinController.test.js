import { testKit } from "./testKit";
import { CheckinController } from "../src/checkin/CheckinController";
import { createTestSeats } from "./createTestSeats";
import { createPassengerId } from "./createPassengerId";
import { CheckinReservationStatus } from "../src/checkin/CheckinReservationStatus";
import { SeatAvailability } from "../src/seat/SeatAvailability";

describe('CheckinController', () => {
    const { container, setup, teardown } = testKit();

    beforeAll(setup);
    afterAll(teardown);
    const getCheckinController = () => new CheckinController(container.models.Seat);
    
    // it('should update test', async () => {
    //     const controller = getCheckinController();
    //     const model = controller.seatModel;
    //     const { seats } = await createTestSeats(container.models);
    //     const seat = seats[0];
    //     expect(seat.availability === SeatAvailability.available);

    //     await model.findByIdAndUpdate(seat._id, { availability: SeatAvailability.reserved });

    //     const newSeat = await model.findById(seat._id);
    //     expect(newSeat.availability).toBe(SeatAvailability.reserved);
    // });

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
});