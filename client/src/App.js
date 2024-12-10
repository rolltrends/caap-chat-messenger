import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ChatDetailPage from './pages/ChatDetailPage';
import CustomerChat from './pages/CustomerChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/chat/:chatId" element={<ChatDetailPage />} />
        <Route path="/" element={<CustomerChat />} />
      </Routes>
    </Router>
  );
}

export default App;
