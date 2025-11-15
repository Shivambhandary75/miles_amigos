import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import MapIntegrationTest from "./components/MapIntegrationTest";
import { ProfileProvider } from "./context/ProfileContext";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <ProfileProvider>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test/maps" element={<MapIntegrationTest />} />
        </Routes>
      </AppProvider>
    </ProfileProvider>
  );
}

export default App;
