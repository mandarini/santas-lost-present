import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Join from './pages/Join';
import PlayerGame from './pages/PlayerGame';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Instructions from './pages/Instructions';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/game" element={<PlayerGame />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminDashboard />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
