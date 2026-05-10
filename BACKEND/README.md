# Conferra Backend

This is the backend server for the Conferra video conferencing application. It handles RESTful API requests, database operations, and manages the real-time WebSocket connections required for WebRTC signaling and live chat.

## Architecture & Logic

The backend acts as the central hub for the application:
1. **REST API**: Serves authentication endpoints (login, signup) and user data management using Express.js.
2. **Database**: Interfaces with MongoDB using Mongoose to persist user profiles, meeting history, and schedules.
3. **Real-time Signaling (Socket.io)**: 
   - Manages "Rooms" where multiple users can connect simultaneously.
   - Handles the exchange of WebRTC signaling data (SDP Offers, Answers, and ICE candidates) to establish direct peer-to-peer video streams between clients.
   - Broadcasts real-time chat messages to all users within a specific room.

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated web framework for building the API routes.
- **Socket.io**: Enables real-time, bidirectional, and event-based communication for signaling and chat.
- **MongoDB & Mongoose**: NoSQL database and Object Data Modeling (ODM) library for storing user data.
- **Bcrypt**: Library used to securely hash and verify user passwords.
- **Dotenv**: Environment variable management.
- **CORS**: Middleware to enable cross-origin requests from the React frontend.

## Available Scripts

In the backend directory, you can run:

### `npm run dev`
Runs the server in development mode using `nodemon`. The server will automatically restart if you make edits to the source files.

### `npm start`
Runs the server in production mode using Node directly.

### `npm run prod`
Starts the server using PM2 (Process Manager) for production environments, ensuring it stays alive and restarts on failure.

## Setup

1. Create a `.env` file in the root of the `BACKEND` directory.
2. Add your MongoDB connection string and desired port:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   ```
3. Run `npm install` to install all dependencies.
4. Run `npm run dev` to start the server.
