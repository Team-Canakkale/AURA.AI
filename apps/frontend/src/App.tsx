import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import HabitDashboard from './pages/HabitDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import Login from './pages/Login';
import HealthDashboard from './pages/HealthDashboard';
import BloodAnalysis from './pages/BloodAnalysis';
import Profile from './pages/Profile';
import UpdatePassword from './pages/UpdatePassword';
import './App.css';
import CustomCursor from './components/ui/CustomCursor';

// Simple protection: Check for token in sessionStorage
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = !!sessionStorage.getItem('sb-access-token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirect if already authenticated (for Login page)
const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = !!sessionStorage.getItem('sb-access-token');
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
    return (
        <Router>
            <CustomCursor />
            <Routes>
                <Route path="/login" element={
                    <RedirectIfAuthenticated>
                        <Login />
                    </RedirectIfAuthenticated>
                } />
                <Route path="/update-password" element={<UpdatePassword />} />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
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
