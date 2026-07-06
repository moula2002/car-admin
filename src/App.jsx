import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Drivers from './pages/Drivers';
import Cars from './pages/Cars';
import Bookings from './pages/Bookings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="cars" element={<Cars />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </Router>
  );
}

export default App;
