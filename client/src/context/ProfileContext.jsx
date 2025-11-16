import { createContext, useState, useContext, useEffect } from 'react'
import api from '../utils/api'
import profileIcon from '../assets/icons8-profile-50.png'

const ProfileContext = createContext()

export function ProfileProvider({ children }) {
  // Load profile from localStorage on initial render
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      return JSON.parse(savedProfile)
    }
    return {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 98765 43210',
      bio: 'Love exploring new places and meeting new people!',
      avatar: profileIcon,
      rating: 4.8,
    }
  })

  // Fetch profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile')
        if (response.data.success) {
          const userData = response.data.user
          setProfile({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            bio: userData.bio || '',
            avatar: userData.avatar || profileIcon,
            rating: userData.Rating || 0,
          })
          if (userData.verifications) {
            setVerifications(userData.verifications)
          }
          if (userData.hasOwnCar !== undefined) {
            setHasOwnCar(userData.hasOwnCar)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    
    const token = localStorage.getItem('authToken')
    if (token) {
      fetchProfile()
    }
  }, [])

  const [verifications, setVerifications] = useState(() => {
    const savedVerifications = localStorage.getItem('userVerifications')
    if (savedVerifications) {
      return JSON.parse(savedVerifications)
    }
    return {
      email: true,
      phone: false,
      id: true,
    }
  })

  const [hasOwnCar, setHasOwnCar] = useState(() => {
    const savedCarStatus = localStorage.getItem('userCarOwnership')
    return savedCarStatus ? JSON.parse(savedCarStatus) : false
  })

  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const savedFiles = localStorage.getItem('userUploadedFiles')
    if (savedFiles) {
      return JSON.parse(savedFiles)
    }
    return {
      email: null,
      phone: null,
      id: null,
      carLicense: null,
      carRegistration: null,
      carInsurance: null,
    }
  })

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }, [profile])

  // Save verifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userVerifications', JSON.stringify(verifications))
  }, [verifications])

  // Save car ownership to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userCarOwnership', JSON.stringify(hasOwnCar))
  }, [hasOwnCar])

  // Save uploaded files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userUploadedFiles', JSON.stringify(uploadedFiles))
  }, [uploadedFiles])

  // Update profile data
  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/users/profile', {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        bio: updates.bio,
        avatar: updates.avatar,
        verifications: verifications,
        hasOwnCar: hasOwnCar
      })
      
      if (response.data.success) {
        setProfile(prev => ({ ...prev, ...updates }))
        return { success: true }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
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
