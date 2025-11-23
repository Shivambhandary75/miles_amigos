import { useState } from "react";
import api, { setAuthToken } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'

export default function Signup({ switchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate()
  const { setProfileFromAuth } = useProfile()

  const handleSignup = async(e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const body = { name: username, email, password }
      const res = await api.post('/users/register', body)
      if (res?.data?.success) {
        const { token, user } = res.data
        // persist token and set default auth header
        setAuthToken(token)

        // update profile context from backend user
        setProfileFromAuth({ username: user.name, email: user.email })

        // navigate to dashboard
        navigate('/dashboard')
      } else {
        alert(res?.data?.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Signup error', err)
      const msg = err?.response?.data?.message || err.message || 'Sign up failed'
      alert(msg)
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-black">Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 mb-4"
          required
        />
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-gray-400 rounded bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-gray-400 rounded bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition  cursor-pointer"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-black">
        Already have an account?{" "}
        <button
          onClick={switchToLogin}
          className="text-purple-950 font-semibold hover:underline cursor-pointer"
        >
          Login
        </button>
      </p>
    </div>
  );
}
