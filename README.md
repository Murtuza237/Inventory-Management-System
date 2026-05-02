# 📦 Smart Inventory Management System

### IoT + MERN + Mobile Ecosystem

---

## 🚀 Overview

The **Smart Inventory Management System** is a real-time, IoT-enabled solution designed for small and wholesale retail businesses (e.g., grocery, dry fruits).

It automates inventory tracking using **load cells + RFID**, and evolves into a **scalable multi-platform system** powered by the **MERN stack and mobile applications**.

---

## 🎯 Problem Statement

Traditional inventory systems rely on manual stock tracking, leading to:

* Human errors
* Stock mismanagement
* Delays in updates
* Lack of real-time visibility

This project solves these issues using **IoT automation + real-time data systems**.

---

# 🧠 System Evolution

## 🔷 Phase 1: Current System (Implemented)

### 📊 Architecture

```
IoT Devices (ESP32 + Load Cell + RFID)
                ↓
     Firebase Realtime Database
                ↓
     Desktop App (Electron + React)
```

### ⚙️ Tech Stack

* IoT: ESP32 + HX711 + RFID
* Backend: Firebase Realtime Database
* Auth: Firebase Authentication
* Frontend: React + Electron

### ✅ Features

* Real-time inventory tracking
* RFID-based product identification
* Role-based access (Admin / Stock Manager)
* Billing system
* Live UI updates

### ⚠️ Limitations

* Tight coupling with Firebase
* Limited backend logic
* No mobile support
* Not scalable for multi-client systems

---

## 🔥 Phase 2: Upgraded System (MERN + Mobile)

### 📊 Target Architecture

```
IoT Devices (ESP32)
        ↓
Node.js Backend (Express API)
        ↓
MongoDB Database
        ↓
 ├── Web App (React)
 ├── Desktop App (Electron)
 └── Mobile App (React Native)
```

---

## 🔄 Data Flow

1. ESP32 sends weight + RFID data to backend API
2. Backend processes and stores data in MongoDB
3. Backend emits real-time updates using Socket.io
4. Clients (Web, Desktop, Mobile) receive updates
5. UI reflects live inventory changes

---

# ⚙️ Tech Stack (Final System)

| Layer       | Technology          |
| ----------- | ------------------- |
| IoT         | ESP32 + HTTP / MQTT |
| Backend     | Node.js + Express   |
| Database    | MongoDB             |
| Real-time   | Socket.io           |
| Web/Desktop | React + Electron    |
| Mobile      | React Native        |

---

# 🧩 Backend Architecture

```
Routes → Controllers → Services → Models → MongoDB
                         ↓
                   Socket.io Events
```

---

# 📁 Project Structure

## Root Structure

```
smart-inventory-system/
│
├── backend/
├── mobile/
├── desktop/
├── web/
├── iot/
│
├── docs/
├── README.md
└── .env.example
```

## Backend Structure

```
backend/
│
├── src/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── sockets/
│   └── app.js
│
├── server.js
└── package.json
```

## Mobile Structure

```
mobile/
│
├── src/
│   ├── api/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── context/
│   ├── services/
│   └── App.js
│
└── package.json
```

---

# 📱 Mobile App Features

* Real-time inventory monitoring
* Low stock alerts
* Billing / sales entry
* Dashboard analytics
* Secure authentication

---

# 🧠 Key Improvements

| Feature         | Current System | Upgraded System    |
| --------------- | -------------- | ------------------ |
| Backend Control | Limited        | Full               |
| Scalability     | Medium         | High               |
| Real-time       | Firebase       | Socket.io          |
| Mobile Support  | ❌              | ✅                  |
| Architecture    | Basic          | Distributed System |

---

# 🚀 Future Enhancements

* AI/ML for demand prediction
* Digital Twin simulation
* Advanced analytics dashboard
* Cloud deployment (AWS/Azure)
* Smart alerts & notifications

---

# 🛠️ Setup (Planned)

## Backend

```
cd backend
npm install
npm run dev
```

## Mobile

```
cd mobile
npm install
npx expo start
```

## Desktop

```
cd desktop
npm install
npm run electron
```

---

# 📌 Vision

To transform a basic IoT prototype into a scalable, intelligent, multi-platform inventory ecosystem.

---

# 👨‍💻 Author

**Murtuza Ali Freeganjwala**
B.Tech CSE | IoT + Full Stack Developer
