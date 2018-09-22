import { Schema } from "mongoose";
import { SeatAvailability } from "./SeatAvailability";

export const SeatSchema = new Schema({
    planeId: Schema.Types.ObjectId,
    seatType: String,
    label: String,
    fee: Number,
    reservedUntil: Number,
    availability: String,
    assigedTo: String // A unique passenger identifier, such as email
});

SeatSchema
.virtual('available')
.get(function () {
    if (this.availability !== SeatAvailability.available) {
        return false;
    }
    return true;
});
