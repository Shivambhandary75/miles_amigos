import { useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import { useProfile } from '../../context/ProfileContext'
import ratingIcon from '../../assets/icons8-rating-50.png'

export default function EditProfile() {
  const { profile, verifications, hasOwnCar, uploadedFiles, updateProfile, updateVerification, setCarOwnershipStatus, updateUploadedFiles } = useProfile()
  
  const [isEditMode, setIsEditMode] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [currentVerificationType, setCurrentVerificationType] = useState(null)
  const [localProfile, setLocalProfile] = useState(profile)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLocalProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLocalProfile(prev => ({
          ...prev,
          avatar: event.target?.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditClick = () => {
    setLocalProfile(profile)
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setLocalProfile(profile)
    setIsEditMode(false)
  }

  const handleSaveClick = () => {
    setShowSaveDialog(true)
  }

  const confirmSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateProfile(localProfile)
      if (result && result.success) {
        setIsEditMode(false)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
      setShowSaveDialog(false)
    }
  }

  const handleVerify = (type) => {
    setCurrentVerificationType(type)
    setShowVerificationModal(true)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileName = file.name
      updateUploadedFiles(currentVerificationType, fileName)
    }
  }

  const handleCompleteVerification = () => {
    // Email and phone don't require file uploads
    const requiresFileUpload = ['id', 'carLicense', 'carRegistration', 'carInsurance'].includes(currentVerificationType)
    
    if (requiresFileUpload && !uploadedFiles[currentVerificationType]) {
      alert('Please upload a file first')
      return
    }
    
    updateVerification(currentVerificationType, true)
    const verifyType = currentVerificationType.charAt(0).toUpperCase() + currentVerificationType.slice(1)
    alert(`${verifyType} ${requiresFileUpload ? 'document' : 'address'} verified successfully!`)
    setShowVerificationModal(false)
    setCurrentVerificationType(null)
  }

  const getVerificationLabel = (type) => {
    const labels = {
      email: 'Email Address',
      phone: 'Phone Number',
      id: 'ID Verification',
      carLicense: 'Driving License',
      carRegistration: 'Car Registration',
      carInsurance: 'Car Insurance',
    }
    return labels[type] || type
  }

  const getVerificationDescription = (type) => {
    const descriptions = {
      email: 'We will send a verification code to your email address',
      phone: 'We will send a verification code to your phone number',
      id: 'Upload a valid government ID (Aadhaar, Passport, or Driving License)',
      carLicense: 'Upload a copy of your driving license',
      carRegistration: 'Upload your vehicle registration certificate (RC)',
      carInsurance: 'Upload your vehicle insurance policy document',
    }
    return descriptions[type] || 'Please complete the required verification'
  }

  // Use localProfile in edit mode, otherwise use context profile
  const displayProfile = isEditMode ? localProfile : profile

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
            <img src={displayProfile.avatar} alt="Profile" className="w-28 h-28 object-cover rounded-full" />
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
            <span>{displayProfile.rating} Rating</span>
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
                    value={displayProfile.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-white text-lg">{displayProfile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={displayProfile.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    placeholder="Your Email ID"
                  />
                ) : (
                  <p className="text-white text-lg">{displayProfile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
                {isEditMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={displayProfile.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    placeholder="Your Phone Number"
                  />
                ) : (
                  <p className="text-white text-lg">{displayProfile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
                {isEditMode ? (
                  <textarea
                    name="bio"
                    value={displayProfile.bio}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                ) : (
                  <p className="text-white text-lg">{displayProfile.bio}</p>
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

          {/* Own Car Section */}
          {isEditMode && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-lg p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Do you own a car?</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOwnCar}
                  onChange={(e) => setCarOwnershipStatus(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-white font-medium">Yes, I own a car and want to verify it</span>
              </label>

              {hasOwnCar && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Driving License</p>
                      <p className="text-sm text-gray-400">Upload your driving license copy</p>
                    </div>
                    <button
                      onClick={() => handleVerify('carLicense')}
                      className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      {uploadedFiles.carLicense ? '✓ Uploaded' : 'Upload'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Car Registration (RC)</p>
                      <p className="text-sm text-gray-400">Upload your vehicle registration certificate</p>
                    </div>
                    <button
                      onClick={() => handleVerify('carRegistration')}
                      className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      {uploadedFiles.carRegistration ? '✓ Uploaded' : 'Upload'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Car Insurance</p>
                      <p className="text-sm text-gray-400">Upload your vehicle insurance policy</p>
                    </div>
                    <button
                      onClick={() => handleVerify('carInsurance')}
                      className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      {uploadedFiles.carInsurance ? '✓ Uploaded' : 'Upload'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-blue-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getVerificationLabel(currentVerificationType)} Verification
              </h2>
              <button
                onClick={() => {
                  setShowVerificationModal(false)
                  setCurrentVerificationType(null)
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              {getVerificationDescription(currentVerificationType)}
            </p>

            {['id', 'carLicense', 'carRegistration', 'carInsurance'].includes(currentVerificationType) ? (
              // File upload for document verifications
              <div className="space-y-4 mb-6">
                <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="verification-file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="verification-file" className="cursor-pointer">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-white font-semibold mb-1">Choose File</p>
                    <p className="text-sm text-gray-400">
                      {uploadedFiles[currentVerificationType]
                        ? `✓ File selected`
                        : 'Click to browse or drag and drop'}
                    </p>
                  </label>
                </div>

                {currentVerificationType?.includes('car') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      ℹ️ Required for car owners. Make sure documents are clear and legible.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Code input for email/phone verifications
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition placeholder-gray-500 text-center text-2xl tracking-widest"
                  maxLength="6"
                />
                <p className="text-center text-gray-400 text-sm mt-3">Check your {currentVerificationType} for the code</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVerificationModal(false)
                  setCurrentVerificationType(null)
                }}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteVerification}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={['id', 'carLicense', 'carRegistration', 'carInsurance'].includes(currentVerificationType) && !uploadedFiles[currentVerificationType]}
              >
                {['id', 'carLicense', 'carRegistration', 'carInsurance'].includes(currentVerificationType) ? 'Verify & Upload' : 'Verify Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
