import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HealthDashboard from './pages/HealthDashboard';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/health" element={<HealthDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
