import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import MapIntegrationTest from "./components/MapIntegrationTest";
import { ProfileProvider } from "./context/ProfileContext";
import { AppProvider } from "./context/AppContext";
import PageTransition from "./components/PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  return (
    <ProfileProvider>
      <AppProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition><Dashboard /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/test/maps"
              element={
                <ProtectedRoute>
                  <PageTransition><MapIntegrationTest /></PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </AppProvider>
    </ProfileProvider>
  );
}

export default App;
