import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/Messages';
// import ChatDetailPage from './pages/ChatDetailPage';
import CustomerChat from './pages/CustomerChat-latest';
import Messages from './pages/Messages';
import SMS from './pages/SMS';
import Reports from './pages/Reports';
import AdminLogin from './components/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from '../src/components/ProtectedRoute';
import ResponsiveAppBar from './components/AppBar';
// import { AppBar } from '@mui/material';
function App() {
  return (
    <Router>
      <Routes>
      <Route index element={<AdminLogin />} />
        <Route  element={<ResponsiveAppBar />}>
       
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/sms" element={<ProtectedRoute><SMS /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />  
                  
        </Route>
        <Route path="/customer" element={<CustomerChat />} />
      </Routes>
    </Router>
  );
}

export default App;
