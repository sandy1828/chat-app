
# React Native Chat App

A real-time 1:1 chat application built with **React Native** frontend and **Node.js + Socket.IO** backend, using **MongoDB** as database. Supports online/offline status, typing indicators, message replies, and read/delivered status.

---

## **Features**

- User authentication with JWT
- Real-time messaging using Socket.IO
- Typing indicators
- Online/offline status with last seen
- Message reply functionality
- Read, delivered, sent message status (✓, ✓✓)
- Swipe-to-reply gestures
- Keyboard handling and message scroll

---

## **Tech Stack**

**Frontend:** React Native (Expo)  
**Backend:** Node.js + Express + Socket.IO  
**Database:** MongoDB Atlas  

---

## **Backend Setup**

1. Clone the repo:
```bash
git clone https://github.com/sandy1828/chat-app.git
cd chat-app/backend
````

2. Install dependencies:

```bash
npm install
```

3. replace  ur mongodb


MONGO_URI=your_mongodb_connection_string



4. Run the backend locally:

```bash
node server.js
```



## **Frontend Setup (React Native / Expo)**

1. Navigate to frontend:

```bash
cd ../chat-app
```

2. Install dependencies:

```bash
npm install
```

3. Configure API and Socket:

```js
// api.js
const API_URL = "https://your-backend-url.com/api"; change with ur wifi ip address

// socket.js
const SOCKET_URL = "https://your-backend-url.com"; change with ur wifi ip address
```

4. Run in development:

```bash
npx expo start
```

5. Run on Android/iOS:

```bash
expo run:android
expo run:ios
```

6. Build for production:

```bash
npx expo build:android
npx expo build:ios
```

---

## **Usage**

1. Register a new user
2. Login
3. Tap a user to start chat
4. Send messages, reply, and see online/offline status
5. Messages show ✓ (sent), ✓✓ (delivered), ✓✓ (read)

---

## **Socket.IO Events**

**Client → Server**

* `join` → Join a conversation room
* `message:send` → Send a new message
* `typing:start` / `typing:stop` → Typing indicators
* `messages:read` → Mark messages as read

**Server → Client**

* `message:new` → New message received
* `message:status` → Update message status
* `typing:start` / `typing:stop` → Typing indicator
* `user:status` → Online/offline status

---

## **MongoDB Models**

**User**

```js
{
  username: String,
  email: String,
  password: String,
  online: Boolean,
}
```

**Message**

```js
{
  senderId: ObjectId,
  recipientId: ObjectId,
  content: String,
  status: String, // sent / delivered / read
  replyTo: ObjectId,
  replyContent: String
}
```

---



"# chat-app" 
