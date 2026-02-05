import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HabitDashboard from './pages/HabitDashboard';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/habitat" element={<HabitDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
