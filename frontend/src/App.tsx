import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReporterDashboard from './pages/ReporterDashboard';
import AgentQueue from './pages/AgentQueue';
import AdminDashboard from './pages/AdminDashboard';
import { Leaf } from 'lucide-react';

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/" />;

  return <>{children}</>;
};

const Header = () => {
  const token = localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <header className="bg-eco-dark text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Leaf className="text-eco-green" />
        <span className="font-bold text-xl tracking-tight">EcoLoop</span>
      </div>
      {token && (
        <button onClick={handleLogout} className="text-sm font-medium hover:text-eco-light transition-colors">
          Log Out
        </button>
      )}
    </header>
  );
};

const RoleBasedRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (role === 'reporter') return <Navigate to="/reporter" />;
  if (role === 'agent') return <Navigate to="/agent" />;
  if (role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reporter" element={<PrivateRoute role="reporter"><ReporterDashboard /></PrivateRoute>} />
            <Route path="/agent" element={<PrivateRoute role="agent"><AgentQueue /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/" element={<RoleBasedRedirect />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
