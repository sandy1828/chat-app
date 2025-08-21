# Chat MVP (React Native + Node + Socket.IO)

## Features
- JWT auth (register/login)
- User list with last message preview
- Real-time 1:1 chat via Socket.IO
- Message persistence in MongoDB
- Typing indicators, online/offline status, delivered/read ticks

## Repo layout
- /server - Node/Express + Socket.IO + MongoDB
- /mobile - React Native (Expo) client

## Requirements
- Node.js (16+)
- MongoDB (local or Atlas)
- Expo CLI (for mobile) or React Native toolchain

## Setup server
1. cd server
2. cp .env.example .env and edit values
3. npm install
4. npm run dev
   - Server listens on PORT (default 5000)

## Setup mobile (Expo)
1. cd mobile
2. npm install
3. expo start
4. Use Expo Go or emulator to open the app. If using real device, change API base url to your machine IP.

## Env variables (server/.env)
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-mvp
JWT_SECRET=your-secret
CLIENT_ORIGIN=http://localhost:19002

## Sample users
You can register via the mobile app. Or insert sample users in MongoDB:
[
  { "name":"Alice", "email":"alice@example.com", "password":"(hashed)" },
  { "name":"Bob", "email":"bob@example.com", "password":"(hashed)" }
]

## Demo recording suggestions
- Record 3 parts <= 5 minutes total:
  1. Login/Register (30s)
  2. Home -> open chat, show typing indicator (1 min)
  3. Message send/delivery/read ticks, show messages persisted by restarting server or refreshing another device (2-3 min)
- Use screen recorder (Android: built-in or OBS, iOS: QuickTime or iPhone screen recording + AirDrop)
