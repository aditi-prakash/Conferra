# Conferra

Conferra is a full-stack, real-time video conferencing application designed to provide seamless communication through high-quality video, audio, and text chat. It allows users to create virtual rooms, join meetings instantly, and communicate with ease.

This repository is split into two main sections:
- **[Frontend](./FRONTEND/README.md)**: The user interface built with React and Vite.
- **[Backend](./BACKEND/README.md)**: The signaling and API server built with Node.js and Express.

## Key Features

- **Real-Time Video & Audio**: Powered by WebRTC for low-latency peer-to-peer communication.
- **Screen Sharing**: Effortlessly share your screen with other participants in the room.
- **In-Meeting Chat**: Real-time text messaging alongside video using WebSockets.
- **Modern User Interface**: A clean, responsive, and intuitive UI built with Material UI (MUI).
- **User Authentication**: Secure user login and profile management.
- **Meeting History & Scheduling**: Track past meetings and schedule upcoming ones.

## Technology Stack

The project utilizes the **MERN** stack along with modern real-time communication protocols.

### Frontend
- **Framework**: React.js (Bootstrapped with Vite)
- **Styling**: Vanilla CSS Modules & Material UI (MUI)
- **Routing**: React Router DOM
- **Real-time Communication**: `socket.io-client`, WebRTC (Native Browser APIs)
- **HTTP Client**: Axios

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ORM)
- **Real-time Communication**: Socket.io
- **Security**: bcrypt (for password hashing), CORS

## Getting Started

To run the full application locally, you will need to start both the backend server and the frontend development server.

### 1. Start the Backend
Navigate to the `BACKEND` directory, install dependencies, and start the server:
```bash
cd BACKEND
npm install
npm run dev
```
*(Make sure you have your `.env` variables configured for MongoDB and the port).*

### 2. Start the Frontend
In a new terminal, navigate to the `FRONTEND` directory, install dependencies, and start Vite:
```bash
cd FRONTEND
npm install
npm run dev
```
*(Make sure your `.env` is configured to point to the backend URL).*

Once both servers are running, you can open `http://localhost:5173` in your browser to start using Conferra!

## Author
Developed by Aditi Prakash.
