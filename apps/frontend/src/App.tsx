import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home'; // Removed unused import
import HabitDashboard from './pages/HabitDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import Login from './pages/Login';
import HealthDashboard from './pages/HealthDashboard';
import BloodAnalysis from './pages/BloodAnalysis';
import './App.css';

const Root = () => {
    const hasSession = !!localStorage.getItem('sb-access-token');
    return hasSession ? <HabitDashboard /> : <Login />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Root />} />
                <Route path="/login" element={<Root />} /> {/* Backwards compatibility or direct link */}
                {/* <Route path="/habitat" element={<HabitDashboard />} /> Legacy, now at root */}
                <Route path="/finance" element={<FinanceDashboard />} />
                <Route path="/health" element={<HealthDashboard />} />
                <Route path="/blood-analysis" element={<BloodAnalysis />} />
            </Routes>
        </Router>
    );
}


export default App;
