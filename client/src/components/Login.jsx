import { useState } from "react";
import api, { setAuthToken } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'

export default function Login({ switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()
  const { setProfileFromAuth } = useProfile()

  const handleLogin = async(e) => {
    e.preventDefault();
    try {
      const body = { email, password }
      const res = await api.post('/users/login', body)
      if (res?.data?.success) {
        const { token, user } = res.data
        setAuthToken(token)
        setProfileFromAuth({ username: user.name || user.email.split('@')[0], email: user.email })
        navigate('/dashboard')
      } else {
        alert(res?.data?.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error', err)
      const msg = err?.response?.data?.message || err.message || 'Login failed'
      alert(msg)
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-black">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-gray-400 rounded bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border border-gray-400 rounded bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition cursor-pointer"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-black">
        Don't have an account?{" "}
        <button
          onClick={switchToSignup}
          className="text-purple-950 font-semibold hover:underline cursor-pointer"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
