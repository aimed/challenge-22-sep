import { SeatAvailability } from "../src/seat/SeatAvailability";

export async function createTestSeats(models) {
    const { Plane, Seat } = models;
    const plane = await Plane.create({});
    const seats = await Seat.create([
        {
            planeId: plane._id,
            seatType: 'free',
            fee: 0,
            label: '15A',
            availability: SeatAvailability.available
        },
        {
            planeId: plane._id,
            seatType: 'window',
            fee: 15,
            label: '15F',
            availability: SeatAvailability.available
        }
    ]);

    return { plane, seats };
}
