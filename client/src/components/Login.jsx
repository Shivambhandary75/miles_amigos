import { useState } from "react";
import axios from "axios";
export default function Login({ switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async(e) => {
    e.preventDefault();
    try {
       const response=await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`,{
        email:email,
        password:password,
       })
       console.log(response.data)

    } catch (error) {
      console.log(error)
    }
    alert(`Logging in with\nEmail: ${email}\nPassword: ${password}`);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-white"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-white">
        Don’t have an account?{" "}
        <button
          onClick={switchToSignup}
          className="text-green-950 font-semibold hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
