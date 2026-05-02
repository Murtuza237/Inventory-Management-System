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

# 🧠 System Architecture

## 🔷 Phase 1: Initial Prototype (Firebase)

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

## 🔥 Phase 2: Current System (MERN + Mobile)

### 📊 Architecture

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


# 🛠️ Setup & Installation

## Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Expo CLI (for mobile)

## 1. Clone the Repository
git clone https://github.com/Murtuza237/[your-repo-name].git
cd smart-inventory-system

## 2. Backend Setup
cd backend
npm install

# Create .env file
cp .env.example .env
# Add your MongoDB URI and JWT secret in .env

npm run dev
# Server runs on http://localhost:5000

## 3. Web App Setup
cd web
npm install
npm start
# Runs on http://localhost:3000

## 4. Mobile App Setup
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app

## 5. IoT Device
- Flash the ESP32 firmware from /iot folder
- Update WiFi credentials and backend API URL in config.h
- Device will auto-connect and start sending sensor data

---

# ✅ Features

| Feature | Status |
|---|---|
| Real-time weight monitoring via IoT sensors | ✅ |
| MERN full-stack web dashboard | ✅ |
| Low-stock alerts | ✅ |
| Automated billing system | ✅ |
| Mobile app (React Native + Expo) | ✅ |
| Role-based access (Admin / Stock Manager) | ✅ |
| Live inventory updates via Socket.io | ✅ |
| Demand forecasting (ML) | 🔜 Coming soon |
| Power BI analytics dashboard | 🔜 Coming soon |
| NL-to-query interface | 🔜 Coming soon |
# 📌 Vision

To transform a basic IoT prototype into a scalable, intelligent, multi-platform inventory ecosystem.

---

# 👨‍💻 Author

**Murtuza Ali Freeganjwala**
B.Tech CSE | IoT + Full Stack Developer
