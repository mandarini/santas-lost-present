import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Join from './pages/Join';
import PlayerGame from './pages/PlayerGame';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/game" element={<PlayerGame />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
