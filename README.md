#  MilesAmigos

A modern carpooling platform that connects drivers and passengers for shared rides with real-time route tracking and location-based matching.

**Developed by Team Fantastic Four**

---

##  Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **React Router** - Navigation
- **Axios** - API requests

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### External APIs

- **OSRM** - Route optimization
- **Nominatim** - Geocoding & location search
- **OpenStreetMap** - Map tiles

---

##  Installation

### Prerequisites

- Node.js **v20.19+** or **v22.12+**
- MongoDB (local or Atlas)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/Shivambhandary75/miles_amigos.git
cd miles_amigos
```

### Step 2: Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/milesAmigos
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:

```bash
npm start
```

Backend will run on **http://localhost:5000**

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend will run on **http://localhost:5173**

---

##  Features

-  User authentication (signup/login)
-  Offer rides with custom routes
-  Find available rides
-  Real-time route visualization on maps
-  Location autocomplete
-  User profiles with ratings
-  Dashboard with ride stats & earnings
-  Ride history tracking
-  Safety features

---

## Usage

1. **Sign Up** - Create a new account
2. **Login** - Access your dashboard
3. **Offer a Ride** - Enter pickup/destination, set price & seats
4. **Find a Ride** - Search for rides matching your route
5. **View on Map** - See routes with start/end markers
6. **Track History** - Monitor your rides and earnings

---
