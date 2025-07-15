import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NutritionPage from "./pages/NutritionPage";
import LandingPage from "./pages/LandingPage";
import FitnessPage from "./pages/FitnessPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
