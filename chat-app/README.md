# Chat MVP (React Native + Node.js + Socket.IO)

## Features
- JWT authentication (register/login)
- User list with last message preview
- Real-time 1:1 chat via Socket.IO
- Message persistence in MongoDB
- Typing indicators, online/offline status, delivered/read ticks

## Repository Structure
```

/server   -> Node.js + Express + Socket.IO + MongoDB backend
/mobile   -> React Native (Expo) client

````

## Requirements
- Node.js (16+)
- MongoDB (local or Atlas)
- Expo CLI (for mobile) or React Native toolchain

## Setup Backend (Server)
1. Navigate to the server folder:
```bash
cd server
````

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node server.js
```

> The server listens on the configured port (default `5000`).

## Setup Frontend (Mobile)

1. Navigate to the mobile folder:

```bash
cd chat-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the Expo project:

```bash
npx expo start
```

> Use Expo Go on your device or an emulator.
> If using a real device, ensure the API base URL points to your machine IP.

## Sample Users

You can register via the mobile app or insert sample users in MongoDB:

```json
[
  { "name": "Alice", "email": "alice@example.com", "password": "(hashed)" },
  { "name": "Bob", "email": "bob@example.com", "password": "(hashed)" }
]
```

## Demo Recording Suggestions

* Record 3 parts (≤ 5 minutes total):

  1. Login/Register (30s)
  2. Home -> open chat, show typing indicator (1 min)
  3. Message send/delivery/read ticks; show message persistence by restarting server or refreshing another device (2–3 min)
* Tools: Android built-in recorder, iOS QuickTime, OBS, or iPhone screen recording

```

I can also give you the **Git commands** to push this exact folder structure to GitHub next so everything is correctly uploaded. Do you want me to do that?
```
