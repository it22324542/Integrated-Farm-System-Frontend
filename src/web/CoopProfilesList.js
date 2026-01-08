import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CageProfilesList({ onNavigate, onSelectCage }) {
  const apiBaseUrl = 'http://localhost:5000/api';
  const [cageIds, setCageIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCageIds();
  }, []);

  const fetchCageIds = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${apiBaseUrl}/cages`);
      if (response.data.success) {
        setCageIds(response.data.cageIds);
      } else {
        setError('Failed to fetch Cage IDs');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch Cage IDs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px', minWidth: '100vw' }}>
      <div className="ifs-container py-4">
        <div className="ifs-hero rounded-4 p-4 mb-4 ifs-animate-in">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1">Cage Profiles</h1>
              <div className="text-muted">
                View and manage all poultry cage profiles
              </div>
            </div>

            <div className="text-md-end">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => onNavigate && onNavigate('dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger ifs-animate-in" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading cage profiles...</p>
          </div>
        ) : cageIds.length === 0 ? (
          <div className="card ifs-card rounded-4 ifs-animate-in">
            <div className="card-body text-center py-5">
              <h3 className="h5 mb-3">No Cage Profiles Found</h3>
              <p className="text-muted mb-4">
                Start by making a prediction with a Cage ID on the dashboard.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate && onNavigate('dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {cageIds.map((cageId) => (
              <div key={cageId} className="col-12 col-md-6 col-lg-4">
                <div className="card ifs-card rounded-4 ifs-animate-in h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <svg
                          width="24"
                          height="24"
                          fill="currentColor"
                          className="text-primary"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                        </svg>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-0">{cageId}</h5>
                        <small className="text-muted">Cage Profile</small>
                      </div>
                    </div>
                    
                    <p className="text-muted mb-4 flex-grow-1">
                      Click to view prediction history and environmental data for this cage.
                    </p>
                    
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={() => onSelectCage && onSelectCage(cageId)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
