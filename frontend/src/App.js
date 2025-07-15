import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage   from "./pages/LandingPage";
import QuestionsPage from "./pages/QuestionsPage";
import NutritionPage from "./pages/NutritionPage";
import FitnessPage   from "./pages/FitnessPage";
import SettingsPage  from "./pages/SettingsPage";
import Navbar        from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Onboarding questionnaire */}
          <Route path="/questions" element={<QuestionsPage />} />

          {/* Main app screens */}
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/fitness"   element={<FitnessPage />} />
          <Route path="/settings"  element={<SettingsPage />} />

          {/* Fallback: redirect unknown URLs to landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;