import { testKit } from "./testKit";
import { CheckinController } from "../src/checkin/CheckinController";
import { createTestSeats } from "./createTestSeats";
import { createPassengerId } from "./createPassengerId";
import { CheckinReservationStatus } from "../src/checkin/CheckinReservationStatus";

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
    });
});