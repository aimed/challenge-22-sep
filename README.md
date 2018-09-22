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
The flow is based on the requirements.
To book a seat we first need to know all available seats for the given plane.
```
GET /plane/:planeId/seats
RESPONSE:
{
    "status": "success",
    "seats": [{
        "_id": "s15A",
        "name": "15A",
        "seatType": "free",
        "fee": 0,
        "available": true
    },{
        "_id": "s15G",
        "name": "15G",
        "seatType": "window",
        "fee": 15,
        "available": true
    },...]
}
```

There are two possible check in flows. The FREE and the PAID flow.
The FREE flow allows the user to check in - a random seat will then be assigned or to choose a free seat.
The PAID flow allows the user to reserve a specific non-free seat. The seat is then reserved for three minutes.
Within the PAID flow the user must make a payment using a payment method, after wich a seet is assigned.

```
// CHECKIN FREE
POST /check-in/
REQUEST: 
{
    "passengerId": "p1"
}
RESPONSE:
{
    "seat": {
        "_id": "s15A",
        "name": "15A",
        "seatType": "free"
    },
    "checkIn": {
        "status": "checkedIn"
    }
}

// CHECKIN PAID
POST /check-in/:seatId
REQUEST: 
{
    "passengerId": "p1"
}
RESPONSE:
{
    "seat": {
        "_id": "s15G",
        "name": "15G",
        "seatType": "window"
    },
    "checkIn": {
        "status": "reserved",
        "reservedUntil": 15000000,
        "fee": 15
    }
}
OR IF FREE SEAT
{
    "seat": {
        "_id": "s15A",
        "name": "15A",
        "seatType": "free"
    },
    "checkIn": {
        "status": "checkedIn"
    }
}

// PAY
POST /check-in/:seatId/pay/
REQUEST: 
{
    "passengerId": "p1",
    "method": "creditCard",
    "creditCard": {
        "number": "123-123-123",
        "owner": "John Doe",
        "validUntil": "15/12/2000",
        "CCV": 419
    }
}
RESPONSE:
{
    "seat": {
        "_id": "s15A",
        "name": "15A",
        "seatType": "window"
    },
    "checkIn": {
        "status": "checkedIn"
    }
}

// Cancel
DELETE /check-in/:seatId/pay/
{
    "passengerId": "p1"
}
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
- Babel