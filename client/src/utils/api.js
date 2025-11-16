import axios from 'axios'

// Base API URL for the backend. Adjust if your server runs on different host/port.
const BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Set token for future requests and persist to localStorage
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('authToken', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('authToken')
  }
}

// Initialize axios instance with token from storage (if present)
export function initAuthFromStorage() {
  const token = localStorage.getItem('authToken')
  if (token) setAuthToken(token)
}

// call this at module import to ensure header is set when app starts
initAuthFromStorage()

export default api
