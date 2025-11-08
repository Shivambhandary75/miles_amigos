import { useState } from 'react'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: profileIcon,
    rating: 0.0,
  })

  const [verifications, setVerifications] = useState({
    email: true,
    phone: false,
    id: true,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleVerify = (type) => {
    setVerifications(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2"> Edit Profile</h1>
        <p className="text-gray-400">Update your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gradient-to-br rounded-full flex items-center justify-center mb-6 shadow-lg ">
            <img src={profile.avatar} alt="Profile" className="w-24 h-24 object-contain" />
          </div>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold transition hover:shadow-lg">
            Change Avatar
          </button>
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
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none  transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none"
                  placeholder="Your Email ID"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none"
                  placeholder="Your Phone Number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition resize-none"
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-lg p-8 rounded-2xl border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-6">Verification Status</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Address',  },
                { key: 'phone', label: 'Phone Number', },
                { key: 'id', label: 'ID Verification',  },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{item.label}</p>
                      <p className="text-sm text-gray-400">
                        {verifications[item.key] ? ' Verified' : 'Not verified'}
                      </p>
                    </div>
                  </div>
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
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6"> Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Allow ride history visible to drivers', value: true },
                { label: 'Share rating with other drivers', value: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <label className="text-white">{pref.label}</label>
                  <button className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    pref.value ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      pref.value ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button className="w-full bg-gradient-to-r  from-green-500 to-green-600 text-white font-bold py-4 rounded-lg transition ">
             Save Changes
          </button>
        </div>
      </div>
    </section>
  )
}
