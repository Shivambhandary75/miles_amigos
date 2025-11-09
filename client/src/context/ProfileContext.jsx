import { createContext, useState, useContext } from 'react'
import profileIcon from '../assets/icons8-profile-50.png'

const ProfileContext = createContext()

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    bio: 'Love exploring new places and meeting new people!',
    avatar: profileIcon,
    rating: 4.8,
  })

  const [verifications, setVerifications] = useState({
    email: true,
    phone: false,
    id: true,
  })

  const [hasOwnCar, setHasOwnCar] = useState(false)

  const [uploadedFiles, setUploadedFiles] = useState({
    email: null,
    phone: null,
    id: null,
    carLicense: null,
    carRegistration: null,
    carInsurance: null,
  })

  // Update profile data
  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  // Update verification status
  const updateVerification = (type, status) => {
    setVerifications(prev => ({ ...prev, [type]: status }))
  }

  // Set car ownership
  const setCarOwnershipStatus = (status) => {
    setHasOwnCar(status)
  }

  // Update uploaded files status
  const updateUploadedFiles = (type, status) => {
    setUploadedFiles(prev => ({ ...prev, [type]: status }))
  }

  // Set profile from auth (signup/login)
  const setProfileFromAuth = (authData) => {
    setProfile(prev => ({
      ...prev,
      name: authData.username || prev.name,
      email: authData.email || prev.email,
    }))
  }

  // Get profile info
  const getProfile = () => profile

  // Get verification status
  const getVerifications = () => verifications

  // Get car ownership status
  const getCarOwnershipStatus = () => hasOwnCar

  // Get uploaded files status
  const getUploadedFiles = () => uploadedFiles

  const value = {
    profile,
    verifications,
    hasOwnCar,
    uploadedFiles,
    updateProfile,
    updateVerification,
    setCarOwnershipStatus,
    updateUploadedFiles,
    setProfileFromAuth,
    getProfile,
    getVerifications,
    getCarOwnershipStatus,
    getUploadedFiles,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
