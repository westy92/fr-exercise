# Fetch Rewards Coding Exercise - Backend Software Engineering

## Installation and Configuration
1. Download and install [Node.js](https://nodejs.org/en/) (LTS recommended).
1. Clone this repository locally. (`git clone git@github.com:westy92/fr-exercise.git`)
1. Navigate to this repository and run `npm i` to install dependencies.
1. Run `npm run build` to transpile the TypeScript source code into JavaScript.
1. Run `node dist/index.js` to start the web service. The default `port` is `3000`, but that can be changed by instead running `PORT=8080 node dist/index.js` with a port of your choosing.

## Running Unit Tests
1. Run `npm run test` to run the unit test suite.

---

## Endpoint Documentation

### Add a Transaction

Adds a transaction for a specific payer and date.

**Endpoint: `POST /points/transaction`**

**Body:**

(All fields are required)
- `payer` - the name of the payer
- `points` - the points value
- `timestamp` - the timestamp the transaction occurred

Example Request Body:
```json
{
    "payer": "DANNON",
    "points": 1000,
    "timestamp": "2020-11-02T14:00:00Z"
}
```

Example Response Body:

(none)

**Notes:**
- `points` cannot be 0.
- A user's total `points` cannot go negative.

**Possible Responses:**
| Status Code | Error Message |
| ----------- | ----------- |
| `201` (Created) | (none) |
| `400` (Bad Request) | Points cannot be zero. |
| `400` (Bad Request) | User points cannot go negative. |

---

### Spend Points

Spend a user's points. The user's oldest points are deducted first.

**Endpoint: `POST /points/spend`**

**Body:**

(All fields are required)
- `points` - the points value

Example Request Body:
```json
{
    "points": 5000
}
```

The corresponding points that are deducted from each payer are returned.

Example Response Body:
```json
[
    {
        "payer": "DANNON",
        "points": -100
    },
    {
        "payer": "UNILEVER",
        "points": -200
    },
    {
        "payer": "MILLER COORS",
        "points": -4700
    },
]
```

**Notes:**
- `points` to spend must be greater than 0.
- A user's total `points` cannot go negative.

**Possible Responses:**
| Status Code | Error Message |
| ----------- | ----------- |
| `200` (Ok) | (none) |
| `400` (Bad Request) | Points must be positive. |
| `400` (Bad Request) | Not enough points available. |

---

### Get the User's Points Balances

Gets the user's points balances, separated by payer.

**Endpoint: `GET /points/balances`**

**Body:**
Example Response Body:
```json
{
    "DANNON": 1000,
    "UNILEVER": 0,
    "MILLER COORS": 5300
}
```

**Possible Responses:**
| Status Code | Error Message |
| ----------- | ----------- |
| `200` (Ok) | (none) |

---

### Clear All User Data

Since the database and cache are in-memory, this endpoint provides an easy way to clear them for testing purposes. This endpoint should be removed once an actual database and cache are added. This endpoint should not be exposed in production.

**Endpoint: `DELETE /points/clear`**

**Body:**
There is no request or response body.

**Possible Responses:**
| Status Code | Error Message |
| ----------- | ----------- |
| `200` (Ok) | (none) |

---

## Suggested Improvements
- Add additional unit tests to test more complex scenarios and increase code coverage.
- Set up a continuous integration environment like GitHub Actions.
- Add input validation. Ensure points are integers, fields aren't missing, etc.
- Use an actual database and cache instead of application memory. Possible options are PostgreSQL and Redis, respectively.
- Add logging throughout the application. ([winston](https://www.npmjs.com/package/winston) is a popular choice.)
- Add user authentication and keep track of points on a per-user basis.
- Add rate limiting.
- Containerize this app with a Dockerfile, using `node:18-alpine`.
