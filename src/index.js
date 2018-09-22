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
import mongoose from 'mongoose';
import express from 'express';

const bootstrap = async () => new Promise(async (resolve) => {
    const connectionString = process.env.MONGO_DB || 'mongodb://localhost';
    const connection = await mongoose.connect(connectionString);
    
    const app = express();
    const port = process.env.PORT || 8002;
    const config = { connection, app, port };
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