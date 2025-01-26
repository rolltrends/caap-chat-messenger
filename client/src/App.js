import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard-latest';
// import ChatDetailPage from './pages/ChatDetailPage';
import CustomerChat from './pages/CustomerChat-latest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerChat />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
