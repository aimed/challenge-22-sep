export class PlaneController {
    constructor(planeModel) {
        this.planeModel = planeModel;
    }

    create = async (request, response) => {
        const plane = await this.planeModel.create({
            seats: [
                {
                    seatType: 'free',
                    fee: 0,
                    label: '15A',
                    reserved: null,
                    booked: null
                }
            ]
        });

        return {
            success: 'true',
            plane: plane
        };
    }

    seats = async (request, response) => {
        const planeId = request.params.planeId;
        const plane = await this.planeModel.findById(planeId);

        if (!plane) {
            throw new Error('Unknown planeId ' + planeId);
        }

        return {
            status: 'success',
            seats: plane.seats.map(seat => ({
                _id: seat._id,
                seatType: seat.seatType,
                label: seat.label,
                fee: seat.fee,
                available: seat.available,
            }))
        };
    }
}