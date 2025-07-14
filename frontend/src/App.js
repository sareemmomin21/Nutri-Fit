import "./App.css";
import NutritionPage from "./pages/NutritionPage";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Link to="/nutrition">Nutrition</Link>

        <Routes>
          <Route path="/nutrition" element={<NutritionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
