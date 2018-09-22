import { PlaneSchema } from "./plane/PlaneSchema";
import { SeatSchema } from "./seat/SeatSchema";
import { Connection } from "mongoose";

/**
 * Creates models
 *
 * @export
 * @param {Connection} connection
 */
export function getModels(connection) {
    return {
        Plane: connection.model('Plane', PlaneSchema),
        Seat: connection.model('Seat', SeatSchema),
    }
}
