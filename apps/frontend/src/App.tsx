import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HabitDashboard from './pages/HabitDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import Login from './pages/Login';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/habitat" element={<HabitDashboard />} />
                <Route path="/finance" element={<FinanceDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
