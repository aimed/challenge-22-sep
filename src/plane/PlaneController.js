import { Model } from "mongoose";

export class PlaneController {
    /**
     * Creates an instance of PlaneController.
     * @param {Model} planeModel
     * @param {Model} seatModel
     * @memberof PlaneController
     */
    constructor(planeModel, seatModel) {
        this.planeModel = planeModel;
        this.seatModel = seatModel;
    }

    create = async (request, response) => {
        const plane = await this.planeModel.create({});
        const seats = await this.seatModel.create([
            {
                planeId: plane._id,
                seatType: 'free',
                fee: 0,
                label: '15A',
                reserved: null,
                booked: null
            },
            {
                planeId: plane._id,
                seatType: 'window',
                fee: 15,
                label: '15F',
                reserved: null,
                booked: null
            }
        ])

        return {
            success: 'true',
            plane: plane,
            seats: seats
        };
    }

    seats = async (request, response) => {
        const planeId = request.params.planeId;
        const seats = await this.seatModel.find({ planeId: planeId });
        return {
            status: 'success',
            seats: seats.map(seat => ({
                _id: seat._id,
                seatType: seat.seatType,
                label: seat.label,
                fee: seat.fee,
                available: seat.available,
            }))
        };
    }
}