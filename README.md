# challenge-22-sep
Implement a checkin system.

## Requirements
Requirements:
- The check-in application lists seats in the plane that passengers can choose
- Different seats should have different fees (free, window, aisle, more leg-room, etc.
- A passenger can skip choosing a seat and check-in for free
- A passenger can pick a seat and check-in for a fixed price
- A passenger can only check-in to one seat (unless they cancel the check-in) The seat is reserved for 3 minutes for the passenger until they pay
- This is the minimum feature set. You can always add more features if you think they are relevant.

## Booking flow

### Summary
```
POST /plane # Create a test plane with seats
GET /plane/:planeId/seats # Query seats for the given plane
POST /plane/:planeId/check-in/:seatId?  # Check in to a seat. No seatId will result in a random seat. If the seat was not free, a payment has to be made
POST /plane/:planeId/pay/:seatId # Pay for the given seat reservation.
DELETE /plane/:planeId/check-in/:seatId # Chancel the reservation
```

### Creating a test plane with seats
```
POST /plane
```
Request: 
```json
{}
```
Response: 
```json
{
    "success": "true",
    "plane": {
        "_id": "5ba645825d4ddfbe1a927ae4",
        "__v": 0
    },
    "seats": [
        {
            "_id": "5ba645825d4ddfbe1a927ae5",
            "planeId": "5ba645825d4ddfbe1a927ae4",
            "seatType": "free",
            "fee": 0,
            "label": "15A",
            "availability": "available",
        },
        {
            "_id": "5ba645825d4ddfbe1a927ae6",
            "planeId": "5ba645825d4ddfbe1a927ae4",
            "seatType": "window",
            "fee": 15,
            "label": "15F",
            "availability": "available",
        }
    ]
}
```

### Perform a check in on a free seat

If not ```seatId``` is given a random seat will be selected.

```POST /plane/:planeId/check-in/:seatId?```

Request: 
```json
{ "passengerId": "test" }
```

Response (free):
```json
{
    "passengerId": "test",
    "seat": {
        "_id": "5ba645825d4ddfbe1a927ae5",
        "label": "15A",
        "seatType": "free",
        "available": false
    },
    "reservation": {
        "status": "checkedIn"
    }
}
```

Response (paid):
```json
{
    "passengerId": "test",
    "seat": {
        "_id": "5ba645825d4ddfbe1a927ae6",
        "label": "15F",
        "seatType": "window",
        "available": false
    },
    "reservation": {
        "status": "reserved",
        "reservedUntil": 1537623867708,
        "fee": 15
    }
}
```

### Paying for reservations
```POST /plane/:planeId/pay/:seatId```

Request:
```json
{ 
    "passengerId": "test",
    "paymentMethod": "creditCard",
    "creditCard": {} 
}
```

Response:
```json
{
    "passengerId": "test",
    "seat": {
        "_id": "5ba645825d4ddfbe1a927ae6",
        "label": "15F",
        "seatType": "window",
        "available": false
    },
    "reservation": {
        "status": "checkedIn"
    }
}
```

### Cancelling a reservation for a paid seat
``` DELETE /plane/:planeId/check-in/:seatId```

Request: 
```json
{ "passengerId": "test" }
```

Response:
```json
{ "status": "success" }
```

## Configuration
```
MONGO_DB=
PORT=
```

## Running
```
yarn install
yarn start
```

## Testing
```
yarn test
```

## External code used
- babel for transpiling
- bodyParser for express