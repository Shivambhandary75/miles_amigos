# Context API Documentation

This document explains how to use the Context API for global state management in the Miles Amigos app.

## Available Contexts

### 1. ProfileContext

Manages user profile and verification data.

**Import:**

```jsx
import { useProfile } from "../../context/ProfileContext";
```

**Usage:**

```jsx
export default function MyComponent() {
  const { profile, updateProfile, verifications, updateVerification } =
    useProfile();

  return (
    <div>
      <p>{profile.name}</p>
      <button onClick={() => updateProfile({ name: "New Name" })}>
        Update Name
      </button>
    </div>
  );
}
```

**Available Methods:**

- `profile` - Current user profile object (name, email, phone, bio, avatar, rating)
- `updateProfile(updates)` - Update profile data
- `verifications` - Verification status object (email, phone, id)
- `updateVerification(type, status)` - Mark a verification as complete
- `hasOwnCar` - Boolean for car ownership
- `setCarOwnershipStatus(status)` - Update car ownership status
- `uploadedFiles` - Track uploaded documents
- `updateUploadedFiles(type, status)` - Mark a file as uploaded

### 2. AppContext

Manages app-wide data like bookings, messages, friends, and communities.

**Import:**

```jsx
import { useApp } from "../../context/AppContext";
```

**Usage:**

```jsx
export default function BookingComponent() {
  const { bookings, addBooking, updateBookingStatus } = useApp();

  return (
    <div>
      {bookings.map((booking) => (
        <div key={booking.id}>
          {booking.from} → {booking.to}
        </div>
      ))}
    </div>
  );
}
```

**Available Methods:**

**Bookings:**

- `bookings` - Array of all bookings
- `addBooking(booking)` - Add new booking
- `updateBookingStatus(bookingId, status)` - Update booking status (confirmed, completed, cancelled)

**Live Rides:**

- `liveRides` - Array of active/live rides
- `setLiveRides(rides)` - Update live rides list

**Messages:**

- `messages` - Object containing personalChats and communityChatList
- `addMessage(chatType, chatId, message)` - Send a message

**Friends:**

- `friends` - Array of user's friends
- `addFriend(friend)` - Add a friend
- `removeFriend(friendId)` - Remove a friend

**Communities:**

- `communities` - Array of all available communities
- `joinedCommunities` - Array of joined community IDs
- `joinCommunity(communityId)` - Join a community
- `leaveCommunity(communityId)` - Leave a community

## Example: Using Contexts Together

```jsx
import { useProfile } from "../../context/ProfileContext";
import { useApp } from "../../context/AppContext";

export default function Dashboard() {
  const { profile } = useProfile();
  const { bookings, friends } = useApp();

  return (
    <div>
      <h1>Welcome {profile.name}!</h1>
      <p>Your bookings: {bookings.length}</p>
      <p>Your friends: {friends.length}</p>
    </div>
  );
}
```

## Migration Guide

When converting a component from local state to context:

### Before:

```jsx
const [profile, setProfile] = useState({...})
const [verifications, setVerifications] = useState({...})
```

### After:

```jsx
const { profile, updateProfile, verifications, updateVerification } =
  useProfile();
```

Then replace `setProfile(...)` with `updateProfile(...)` and `setVerifications(...)` with `updateVerification(...)`.

## Adding New Context Data

To add new global state:

1. Create a new context file in `/src/context/`
2. Create a Provider component
3. Export a custom hook (e.g., `useYourContext`)
4. Add the provider to `App.jsx`
5. Use the hook in components

## Notes

- Contexts are initialized in `App.jsx`
- All context data persists only during the session (use localStorage/backend for persistence)
- For API calls, add them inside the context functions
- Keep context focused on specific features (ProfileContext for profile, AppContext for general app data)
