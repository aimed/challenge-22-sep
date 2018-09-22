import { SeatAvailability } from "../src/seat/SeatAvailability";
import { createPassengerId } from "./createPassengerId";

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
        },
        {
            planeId: plane._id,
            seatType: 'window',
            fee: 15,
            label: '15G',
            availability: SeatAvailability.unavailable,
            assignedTo: createPassengerId()
        }
    ]);

    const [ freeSeat, expensiveSeat, takenSeat ] = seats;
    return { plane, seats, freeSeat, expensiveSeat, takenSeat };
}
