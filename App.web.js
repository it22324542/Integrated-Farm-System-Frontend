import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './src/web/web.css';

import WebDashboard from './src/web/WebDashboard';
import CageProfilesList from './src/web/CoopProfilesList';
import CageProfileDetail from './src/web/CoopProfileDetail';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCageId, setSelectedCageId] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'profile-detail') {
      setSelectedCageId(null);
    }
  };

  const handleSelectCage = (cageId) => {
    setSelectedCageId(cageId);
    setCurrentPage('profile-detail');
  };

  return (
    <>
      {currentPage === 'dashboard' && <WebDashboard onNavigate={handleNavigate} />}
      {currentPage === 'profiles' && (
        <CageProfilesList onNavigate={handleNavigate} onSelectCage={handleSelectCage} />
      )}
      {currentPage === 'profile-detail' && selectedCageId && (
        <CageProfileDetail cageId={selectedCageId} onNavigate={handleNavigate} />
      )}
    </>
  );
}

