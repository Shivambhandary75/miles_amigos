import { useNavigate } from "react-router-dom";
import landingPic from "../assets/LandingPage.jpg";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${landingPic})` }}
    >
        <div className="absolute inset-0 bg-green-700/60"></div>
      {/* Stronger layered overlays for dramatic gradient */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-green-700/40 to-transparent"></div>
  {/* Green wash to tint the background image without obscuring content */}
  <div className="absolute inset-0 bg-green-600/50 mix-blend-multiply pointer-events-none"></div>
  <div className="absolute inset-0 bg-gradient-to-tr from-green-800/30 via-black/20 to-green-600/30 mix-blend-overlay"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Welcome to MilesAmigos !!!
        </h1>
        <p className="text-lg text-white/90 mb-6 max-w-2xl">
          Seamlessly share rides, find carpool buddies, and contribute to a greener tomorrow!
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="px-6 py-3 bg-white text-green-950 font-semibold rounded-lg hover:bg-purple-100 transition shadow-lg cursor-pointer"
        >
          Get Started
        </button>
      </div>

      {/* Copyright / Tagline */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 text-center text-white/90">
        <p className="text-sm">© {new Date().getFullYear()} Made by <span className="font-semibold">fantastic-four</span></p>
      </div>
    </div>
  );
}
