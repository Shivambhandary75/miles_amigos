import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import MapIntegrationTest from "./components/MapIntegrationTest";
import { ProfileProvider } from "./context/ProfileContext";
import { AppProvider } from "./context/AppContext";
import PageTransition from "./components/PageTransition";

function App() {
  const location = useLocation();

  return (
    <ProfileProvider>
      <AppProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/test/maps" element={<PageTransition><MapIntegrationTest /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </AppProvider>
    </ProfileProvider>
  );
}

export default App;
