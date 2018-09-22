/*
Requirements:
- The check-in application lists seats in the plane that passengers can choose
- Different seats should have different fees (free, window, aisle, more leg-room, etc.)
- A passenger can skip choosing a seat and check-in for free
- A passenger can pick a seat and check-in for a fixed price
- A passenger can only check-in to one seat (unless they cancel the check-in) The seat is reserved for 3 minutes for the passenger until they pay
- This is the minimum feature set. You can always add more features if you think they are relevant.
 */
import '@babel/polyfill';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';

import { PlaneController } from './plane/PlaneController';
import { getModels } from './models';
import { CheckinController } from './checkin/CheckinController';

function asyncControllerHandler(handler) {
    return function (request, response, next) {
        handler(request, response)
            .then(data => response.json(data))
            .catch(error => next(error));
    }
}

const bootstrap = async () => new Promise(async (resolve) => {
    const connectionString = process.env.MONGO_DB || 'mongodb://localhost/challenge-sep-22';
    const connection = await mongoose.connect(connectionString);
    const models = getModels(connection);

    const controllers = {
        plane: new PlaneController(models.Plane, models.Seat),
        checkIn: new CheckinController(models.Seat),
    };

    const app = express();
    app.use(bodyParser.json());
    app.post('/plane', asyncControllerHandler(controllers.plane.create)); // TODO: For testing purposes only.
    app.get('/plane/:planeId/seats', asyncControllerHandler(controllers.plane.seats));
    app.post('/plane/:planeId/check-in/:seatId?', asyncControllerHandler(controllers.checkIn.checkin));
    app.delete('/plane/:planeId/check-in/:seatId', asyncControllerHandler(controllers.checkIn.cancel));
    app.post('/plane/:planeId/pay/:seatId', asyncControllerHandler(controllers.checkIn.pay));
    app.use(errorHandler);

    const port = process.env.PORT || 8002;
    const config = { connection, app, port, models, controllers };
    app.listen(port, resolve(config));
});

bootstrap()
    .then(config => {
        console.log(`Server running at ${config.port}`);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    })

function errorHandler(err, request, response, next) {
    const message = err.message || err.toString();
    const code = err.status || 500;
    response.json(code, {
        status: 'error',
        message: message,
        code: code
    });
};
