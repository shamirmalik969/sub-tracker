# SubTrack - Subscription Analyzer

A MERN stack application for tracking recurring subscriptions and simulating cost projections.

## Setup

### Backend
```bash
cd backend
npm install
```

Create `.env` file with:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run:
```bash
npm start
```

### Frontend
```bash
cd frontend
npm install
```

Create `.env.local` file with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Run:
```bash
npm start
```

## Features

- User authentication (signup/login)
- Add and manage subscriptions
- View subscription projections (3, 6, 12 months)
- What-If cancellation simulator
- Category-wise spending breakdown
