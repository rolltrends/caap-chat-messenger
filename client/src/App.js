import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import CustomerChat from './pages/CustomerChat';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerChat />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
