import { testKit } from "./testKit";
import { PlaneController } from "../src/plane/PlaneController";

describe('PlaneController', () => {
    const { container, setup, teardown } = testKit();

    beforeAll(setup);
    afterAll(teardown);

    it('should create a plane with seats', async () => {
        const { Plane, Seat } = container.models;
        const controller = new PlaneController(Plane, Seat);
        const response = await controller.create();
        expect(response.plane).toBeTruthy();
        expect(response.seats).toBeTruthy();
        expect(response.seats.length).toBeGreaterThan(0);
    });

    it('should returns seats for a valid planeId', async () => {
        const { Plane, Seat } = container.models;
        const controller = new PlaneController(Plane, Seat);
        const created = await controller.create();
        const planeId = created.plane._id;
        const response = await controller.seats({ params: { planeId } });
        expect(response).toBeTruthy();
        expect(response.seats).toBeTruthy();
        expect(response.seats.length).toBeGreaterThan(0);
    });
});