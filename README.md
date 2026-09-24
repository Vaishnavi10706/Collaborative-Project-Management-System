# Collaborative Project Management System
## Project Overview

A full-stack Collaborative Project Management System that enables teams to manage projects, assign tasks, and collaborate in real-time.

Built with React (Vite) + Node.js + MongoDB + Socket.io, this system ensures efficient workflow management with live updates and secure authentication.

## Problem Statement

Traditional team collaboration suffers from:

- Lack of real-time updates

- Poor task visibility

- Inefficient communication

This project solves these issues by providing a real-time, centralized collaboration platform.

## Key Features

1. Authentication & Security

- JWT-based authentication

- Secure API routes using middleware

2. Project Management

- Create & manage projects

- Add multiple team members

3. Task Management

- Assign tasks to users

- Track task status (Pending / In Progress / Completed)

4. Real-Time Collaboration

- Live updates using Socket.io

- Instant synchronization across users

5. Activity Tracking

- Activity logs for project actions

- Track user actions for transparency

## Tech Stack

### Frontend

- React.js (Vite)

- Javascript

- HTML, CSS, JavaScript

### Backend

- Node.js

- Express.js

- Socket.io

### Database

- MongoDB (Mongoose)

### Other Tools

- JWT Authentication

- Git & GitHub

- Vercel (Frontend Deployment)

## Project Structure
```
Collaborative-Project-Management-System/
│
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── vercel.json
│
├── server/                     # Backend (Node + Express + Socket.io)
│   ├── middleware/             # JWT Auth Middleware
│   ├── models/                 # Mongoose Models
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Activity.js
│   ├── routes/                 # API Routes
│   ├── server.js               # Entry point
│   └── .env
│
└── README.md
```

## Backend Architecture

Middleware

JWT authentication for protected routes

Models

User → stores user data

Project → project details

Task → task assignment & status

Activity → logs all actions

Routes

Auth routes

Project routes

Task routes

Activity log routes

## Installation & Setup

1️. Clone Repository
```
git clone https://github.com/Vaishnavi10706/Collaborative-Project-Management-System.git

cd Collaborative-Project-Management-System
```

2️. Setup Backend
```
cd server
npm install
npm start
```

3️. Setup Frontend
```
cd client
npm install
npm run dev
```

## Environment Variables

### Backend (server/.env)
```
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```
### Frontend (client/.env)
```
VITE_SOCKET_URL=http://localhost:5000
```
## How It Works

- User signs up / logs in (JWT authentication)

- Creates or joins a project

- Assigns tasks to team members

- Updates are broadcast in real-time via Socket.io

- Activities are logged for tracking

## Deployment

Frontend → Vercel (configured via vercel.json)

Backend → Can be deployed on Railway

## Future Improvements

- Real-time notifications system

- Mobile responsive UI

- Analytics dashboard for project insights

- Role-based access control (Admin / Member)

- AI-based task recommendations

## Key Learnings

- Built a scalable real-time full-stack system

- Implemented JWT authentication & secure APIs

- Integrated Socket.io for live collaboration

- Designed modular backend architecture (MVC pattern)

- Deployed frontend using Vercel

## Contact

Vaishnavi

GitHub: https://github.com/Vaishnavi10706

## Support

If you like this project, give it a ⭐ on GitHub!
