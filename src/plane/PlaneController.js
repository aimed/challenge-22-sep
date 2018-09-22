export class PlaneController {
    constructor(planeModel) {
        this.planeModel = planeModel;
    }

    async getSeats(request, response) {
        // const planeId = request.param.planeId;
        return {
            status: 'success',
            seats: [{
                "_id": "s15A",
                "name": "15A",
                "type": "free",
                "fee": 0,
                "available": true
            }, {
                "_id": "s15G",
                "name": "15G",
                "type": "window",
                "fee": 15,
                "available": true
            }]
        };
    }
}