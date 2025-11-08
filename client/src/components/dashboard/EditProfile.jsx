import { useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'

export default function EditProfile() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [originalProfile, setOriginalProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    bio: 'Love exploring new places and meeting new people!',
    avatar: profileIcon,
    rating: 4.8,
  })

  const [profile, setProfile] = useState(originalProfile)

  const [verifications, setVerifications] = useState({
    email: true,
    phone: false,
    id: true,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfile(prev => ({
          ...prev,
          avatar: event.target?.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    setIsEditMode(false)
  }

  const handleSaveClick = () => {
    setShowSaveDialog(true)
  }

  const confirmSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setOriginalProfile(profile)
      setIsSaving(false)
      setShowSaveDialog(false)
      setIsEditMode(false)
      console.log('Profile saved:', profile)
    }, 1000)
  }

  const handleVerify = (type) => {
    setVerifications(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <section>
      <ConfirmationDialog
        isOpen={showSaveDialog}
        title="Save Changes"
        message="Are you sure you want to save all changes to your profile? This action cannot be undone."
        confirmText="Save"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isSaving}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveDialog(false)}
      />

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">
            {isEditMode ? 'Edit your personal information' : 'View your profile information'}
          </p>
        </div>
        {!isEditMode && (
          <button
            onClick={handleEditClick}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition hover:shadow-lg"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <img src={profile.avatar} alt="Profile" className="w-28 h-28 object-cover rounded-full" />
          </div>
          {isEditMode && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-input"
              />
              <label
                htmlFor="avatar-input"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold transition hover:shadow-lg cursor-pointer"
              >
                Change Avatar
              </label>
            </>
          )}
          <div className="text-gray-400 text-sm mt-4 flex items-center gap-2 justify-center">
            <img src={ratingIcon} alt="Rating" className="w-5 h-5" />
            <span>{profile.rating} Rating</span>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-white text-lg">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    placeholder="Your Email ID"
                  />
                ) : (
                  <p className="text-white text-lg">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
                {isEditMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    placeholder="Your Phone Number"
                  />
                ) : (
                  <p className="text-white text-lg">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
                {isEditMode ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                ) : (
                  <p className="text-white text-lg">{profile.bio}</p>
                )}
              </div>

              {isEditMode && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveClick}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-lg p-8 rounded-2xl border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-6">Verification Status</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Address' },
                { key: 'phone', label: 'Phone Number' },
                { key: 'id', label: 'ID Verification' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{item.label}</p>
                    <p className="text-sm text-gray-400">
                      {verifications[item.key] ? '✓ Verified' : 'Not verified'}
                    </p>
                  </div>
                  {isEditMode && (
                    <button
                      onClick={() => handleVerify(item.key)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        verifications[item.key]
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {verifications[item.key] ? 'Verified' : 'Verify'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Allow ride history visible to drivers' },
                { label: 'Share rating with other drivers' },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <label className="text-white font-medium cursor-pointer">{pref.label}</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5" disabled={!isEditMode} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
