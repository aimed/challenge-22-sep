/*
Requirements:
- The check-in application lists seats in the plane that passengers can choose
- Different seats should have different fees (free, window, aisle, more leg-room, etc.
- A passenger can skip choosing a seat and check-in for free
- A passenger can pick a seat and check-in for a fixed price
- A passenger can only check-in to one seat (unless they cancel the check-in) The seat is reserved for 3 minutes for the passenger until they pay
- This is the minimum feature set. You can always add more features if you think they are relevant.
 */
import '@babel/polyfill';
import mongoose, { mongo } from 'mongoose';
import express from 'express';
import { PlaneController } from './plane/PlaneController';
import { PlaneSchema } from './plane/PlaneSchema';
import { SeatSchema } from './seat/SeatSchema';

function asyncControllerHandler(handler) {
    return function (request, response, next) {
        handler(request, response)
        .then(data => response.json(data))
        .catch(error => next(error));
    }
}

const bootstrap = async () => new Promise(async (resolve) => {
    const connectionString = process.env.MONGO_DB || 'mongodb://localhost';
    const connection = await mongoose.connect(connectionString);
    
    const models = {
        Plane: mongoose.model('Plane', PlaneSchema),
        Seat: mongoose.model('Seat', SeatSchema),
    };

    const controllers = {
        plane: new PlaneController(models.Plane, models.Seat),
    };

    const app = express();
    app.get('/plane/:planeId/seats', asyncControllerHandler(controllers.plane.seats));
    app.get('/plane/create', asyncControllerHandler(controllers.plane.create));

    const port = process.env.PORT || 8002;
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