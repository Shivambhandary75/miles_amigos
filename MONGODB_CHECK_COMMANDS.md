# 🔍 MongoDB Commands to Check if Rides are Stored

## ✅ MongoDB is Running
MongoDB process found (mongod.exe running)

## 📊 Commands to Check Rides in Database

### Option 1: Using MongoDB Shell (Recommended)

**Step 1: Open MongoDB Shell**
```bash
mongosh
```

**Step 2: Switch to your database**
```javascript
use miles_amigos
// or whatever your database name is
```

**Step 3: Check if rides collection exists**
```javascript
show collections
```

**Step 4: Count total rides**
```javascript
db.rides.countDocuments()
```

**Step 5: List all rides**
```javascript
db.rides.find()
```

**Step 6: Pretty print rides**
```javascript
db.rides.find().pretty()
```

**Step 7: Check specific ride**
```javascript
db.rides.findOne({ _id: ObjectId("6922a4ef4a940d1851254707") })
```

**Step 8: Show recent rides (last 5)**
```javascript
db.rides.find().sort({ createdAt: -1 }).limit(5).pretty()
```

**Step 9: Check rides with future departure times**
```javascript
db.rides.find({ 
  departureTime: { $gte: new Date() }
}).pretty()
```

**Step 10: Exit MongoDB Shell**
```javascript
exit
```

---

### Option 2: Using MongoDB Compass (GUI - Easier)

**Step 1: Download & Install MongoDB Compass**
- Download from: https://www.mongodb.com/products/tools/compass
- Or if already installed, open it

**Step 2: Connect to MongoDB**
- Connection string: `mongodb://localhost:27017`
- Click "Connect"

**Step 3: Select Database**
- Look for `miles_amigos` (or your DB name)
- Click on it

**Step 4: View Rides Collection**
- Click on `rides` collection
- You'll see all rides in a table format
- Can search, filter, and view details

**Step 5: Check Specific Ride**
- Use the filter:
  ```json
  { "_id": ObjectId("6922a4ef4a940d1851254707") }
  ```

---

## 🔎 What to Look For

### Ride Document Should Have:
```javascript
{
  "_id": ObjectId("..."),
  "driver": ObjectId("..."),
  "startLocation": {
    "name": "Gokarna, Kumata taluk, Uttara Kannada, Karnataka, 581326, India",
    "lat": 14.5439629,
    "lng": 74.3184418
  },
  "endLocation": {
    "name": "Kumta, Kumata taluk, Uttara Kannada, Karnataka, 581343, India",
    "lat": 14.4271622,
    "lng": 74.4117058
  },
  "routePolyline": [
    [74.3184418, 14.5439629],
    [74.31..., 14.54...],
    ...553 points...
  ],
  "departureTime": ISODate("1111-11-11T11:11:00.000Z"),
  "availableSeats": 1,
  "price": 1223,
  "status": "scheduled",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## 🚨 Troubleshooting

### Problem: No rides in database

**Check 1: Is MongoDB running?**
```bash
Get-Process mongod
```
Should show mongod process running

**Check 2: Database connection in server**
- Check `.env` file has correct MongoDB URI
- Default: `mongodb://localhost:27017/miles_amigos`

**Check 3: Server logs when creating ride**
- Should see: `✅ [CREATE RIDE] Ride successfully created`
- If you see error, share the error message

**Check 4: Check all databases**
```bash
mongosh
show dbs
```

**Check 5: Check server connection log**
- Server startup should show: `MongoDB connected`
- If not, MongoDB URI is wrong

---

## 📋 Complete MongoDB Shell Session Example

```bash
# 1. Start MongoDB shell
mongosh

# 2. List all databases
show dbs

# 3. Use your database
use miles_amigos

# 4. List all collections
show collections

# 5. Count rides
db.rides.countDocuments()
> 5  (for example)

# 6. Find your recent ride
db.rides.findOne({ _id: ObjectId("6922a4ef4a940d1851254707") })

# Output should show the ride document with all fields

# 7. Check rides with future dates
db.rides.find({ 
  departureTime: { $gte: new Date() }
}).pretty()

# 8. Exit
exit
```

---

## 🔄 Check Server Logs Too

**Make sure server is logging ride creation:**

1. **Start server** with logging:
   ```bash
   cd C:\Users\prajw\Documents\miles_amigos\server
   npm start
   ```

2. **Watch terminal for logs** when you create a ride

3. **Look for these logs**:
   ```
   ========================================
   🚗 [CREATE RIDE] Received ride creation request
   ========================================
   Driver ID: ...
   Start Location: Gokarna [74.3184418, 14.5439629]
   End Location: Kumta [74.4117058, 14.4271622]
   Departure Time: 1111-11-11T11:11
   Available Seats: 1
   Price: ₹1223
   Route Polyline Points: 553
   ✅ [CREATE RIDE] All required fields present
   💾 [CREATE RIDE] Creating ride document in database...
   ✅ [CREATE RIDE] Ride document created:
     Ride ID: 6922a4ef4a940d1851254707
   ```

4. **If you see error** instead, share it

---

## 📊 Database Structure Check

**Check that collections exist:**

```javascript
// In mongosh
use miles_amigos
show collections

// Should show:
// rides
// users
// any other collections
```

---

## 🧪 Quick Test Commands

Run these one at a time in MongoDB Shell:

```javascript
// 1. Count all rides
db.rides.countDocuments()

// 2. Count rides with future departure
db.rides.countDocuments({ departureTime: { $gte: new Date() } })

// 3. Count rides with available seats
db.rides.countDocuments({ availableSeats: { $gt: 0 } })

// 4. Count rides not cancelled
db.rides.countDocuments({ status: { $ne: 'cancelled' } })

// 5. Get latest ride
db.rides.findOne({}, { sort: { createdAt: -1 } })

// 6. Search for Gokarna rides
db.rides.find({ 
  "startLocation.name": { $regex: "Gokarna", $options: "i" }
}).pretty()
```

---

## ✅ If Rides ARE in Database

Then search issue is elsewhere. Need to debug:
1. Search coordinates matching
2. Route polyline data
3. Database query in search function

**Next Step**: Run search and check server logs for what rides are being found

---

## ❌ If Rides are NOT in Database

Then issue is in ride creation:
1. Check server logs when creating ride
2. Check error message if any
3. Verify .env file MongoDB connection
4. Check if POST to /api/rides is actually hitting server

**Next Step**: Share server logs when creating a ride

---

## 🚀 Complete Diagnostic Flow

1. **Check MongoDB is running** ✅ (Already confirmed above)
2. **Open MongoDB Shell**:
   ```bash
   mongosh
   ```
3. **Check database**:
   ```javascript
   use miles_amigos
   show collections
   db.rides.countDocuments()
   ```
4. **If 0 rides**: Issue is in creation → Check server logs
5. **If > 0 rides**: Issue is in search → Check search logs

---

## 📞 Share Results

Run these commands and share the output:

```bash
mongosh
use miles_amigos
db.rides.countDocuments()
db.rides.find().pretty()
exit
```

Then we can debug from there!
