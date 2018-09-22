import { Schema } from "mongoose";

export const PlaneSchema = new Schema({
    seats: [
        {
            seatType: String,
            label: String,
            fee: Number,
            reserved: {
                until: Number,
                byPassenger: Schema.Types.ObjectId
            },
            booked: {
                byPassenger: Schema.Types.ObjectId
            }
        }
    ]
});

PlaneSchema.virtual('available').get(function () {
    if (this.booked) {
        return false;
    }

    if (this.reserved && this.reserved.until >= Date.now()) {
        return false;
    }

    return true;
});