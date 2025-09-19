import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AccountDetail from './pages/AccountDetail';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account/:id" element={<AccountDetail />} />
          <Route path="/admin/:token" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;