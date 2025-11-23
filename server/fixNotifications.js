require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function fixNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/miles_amigos', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Find all users and fix their notifications
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // If notifications exists but is malformed, reset it
      if (user.notifications && Array.isArray(user.notifications)) {
        // Filter out bad notifications and keep only valid ones
        const validNotifications = user.notifications.filter(notif => 
          notif && typeof notif === 'object' && notif.icon && notif.title && notif.desc
        );
        
        if (validNotifications.length < user.notifications.length) {
          console.log(`User ${user._id}: Cleaning ${user.notifications.length} notifications -> ${validNotifications.length}`);
          await mongoose.connection.collection('users').updateOne(
            { _id: user._id },
            { $set: { notifications: validNotifications } }
          );
        }
      } else if (!user.notifications) {
        // Initialize notifications array if it doesn't exist
        await mongoose.connection.collection('users').updateOne(
          { _id: user._id },
          { $set: { notifications: [] } }
        );
      }
    }

    console.log('Notifications fixed!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing notifications:', err);
    process.exit(1);
  }
}

fixNotifications();
