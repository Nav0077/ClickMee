import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LeaderboardFull from './pages/LeaderboardFull';
import AuthPage from './pages/AuthPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/leaderboard" element={<LeaderboardFull />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
            </Routes>
        </Router>
    )
}

export default App
