# ♟️ Real-Time Multiplayer Chess Game

A real-time, drag-and-drop multiplayer chess game built using **Node.js**, **Socket.IO**, and **Chess.js**. Players are assigned roles (White, Black, or Spectator) and can compete live with automatic board updates and turn validation.

## 🚀 Features

- Real-time two-player gameplay with spectators
- Drag-and-drop piece movement
- Automatic board flip for Black
- Move validation and illegal move blocking using `chess.js`
- Clean UI with responsive chessboard styling

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS (Tailwind-like styling), Vanilla JS
- **Backend**: Node.js, Express
- **WebSocket**: Socket.IO
- **Game Logic**: chess.js

## 📦 Installation

```bash
git clone https://github.com/your-username/realtime-chess.git
cd realtime-chess
npm install
node server.js


Visit http://localhost:2000 in two different browser tabs/windows to test multiplayer.
