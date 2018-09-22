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
        const { plane, seats } = await createTestSeats(container.models);
        const seatId = seats[0]._id;
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
});