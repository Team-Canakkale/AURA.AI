import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import HabitDashboard from './pages/HabitDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import Login from './pages/Login';
import HealthDashboard from './pages/HealthDashboard';
import BloodAnalysis from './pages/BloodAnalysis';
import './App.css';

// Simple protection: Check for token in localStorage
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = !!localStorage.getItem('sb-access-token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

import CustomCursor from './components/ui/CustomCursor';

function App() {
    return (
        <Router>
            <CustomCursor />
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/habitat" element={
                    <ProtectedRoute>
                        <HabitDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/finance" element={
                    <ProtectedRoute>
                        <FinanceDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/health" element={
                    <ProtectedRoute>
                        <HealthDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/blood-analysis" element={
                    <ProtectedRoute>
                        <BloodAnalysis />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}


export default App;
