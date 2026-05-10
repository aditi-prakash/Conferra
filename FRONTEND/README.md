# Conferra Frontend

This is the frontend client for the Conferra video conferencing application. It provides the user interface for authenticating, joining meeting rooms, sharing video/audio, sharing screens, and participating in real-time text chats.

## Architecture & Logic

The frontend is a Single Page Application (SPA) that heavily utilizes native browser capabilities alongside modern React features:
1. **WebRTC**: Native browser API used to establish direct peer-to-peer media streams (video and audio) between users. The frontend captures local media using `navigator.mediaDevices.getUserMedia` and shares the screen using `navigator.mediaDevices.getDisplayMedia`.
2. **Signaling (Socket.io-client)**: Connects to the backend server to exchange WebRTC connection data (SDP and ICE candidates) so that peers can discover and connect to each other. It also listens for and emits real-time chat messages.
3. **State Management**: Uses React Hooks (`useState`, `useEffect`, `useContext`, `useRef`) to manage the complex states of video streams, chat histories, and socket connections.

## Tech Stack

- **React 19**: A JavaScript library for building user interfaces.
- **Vite**: Next-generation frontend tooling providing an extremely fast development server and optimized production builds.
- **Material UI (MUI)**: A comprehensive suite of UI tools providing robust, accessible, and highly customizable React components (Buttons, TextFields, Icons, etc.).
- **React Router DOM**: Handles client-side routing for navigating between the lobby, authentication, scheduling, and meeting pages.
- **Socket.io-client**: The client-side library for managing WebSocket connections to the backend server.
- **Axios**: Promise-based HTTP client used to make REST API requests to the backend.
- **Vanilla CSS Modules**: Scoped CSS for styling individual components without class name collisions.

## Available Scripts

In the frontend directory, you can run:

### `npm run dev`
Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in your browser. The page will instantly reload when you make changes.

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`
Bootstraps a local static web server that serves the files from the `dist` folder, allowing you to preview the production build locally before deploying.

## Setup

1. Create a `.env` file in the root of the `FRONTEND` directory.
2. Define the URL of your backend server:
   ```env
   VITE_BACKEND_BASE_URL=http://localhost:3000
   ```
3. Run `npm install` to install all dependencies.
4. Run `npm run dev` to start the development server.