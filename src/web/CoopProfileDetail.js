import React, { useEffect, useState } from 'react';
import axios from 'axios';

const severityToBootstrap = (severity) => {
  if (severity === 'danger') return 'danger';
  if (severity === 'warning') return 'warning';
  if (severity === 'success') return 'success';
  return 'secondary';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function CageProfileDetail({ cageId, onNavigate }) {
  const apiBaseUrl = 'http://localhost:5000/api';
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [uniqueDates, setUniqueDates] = useState([]);

  useEffect(() => {
    if (cageId) {
      fetchPredictions();
    }
  }, [cageId]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${apiBaseUrl}/cages/${cageId}`);
      if (response.data.success) {
        setPredictions(response.data.predictions);
        
        // Extract unique dates
        const dates = [...new Set(
          response.data.predictions.map(p => 
            new Date(p.date).toISOString().split('T')[0]
          )
        )].sort().reverse();
        setUniqueDates(dates);
      } else {
        setError('Failed to fetch predictions');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (date) => {
    setSelectedDate(date);
  };

  const filteredPredictions = selectedDate
    ? predictions.filter(p => 
        new Date(p.date).toISOString().split('T')[0] === selectedDate
      )
    : predictions;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px', minWidth: '100vw' }}>
      <div className="ifs-container py-4">
        <div className="ifs-hero rounded-4 p-4 mb-4 ifs-animate-in">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1">Cage Profile: {cageId}</h1>
              <div className="text-muted">
                Prediction history and environmental data
              </div>
              <div className="mt-2">
                <span className="badge text-bg-primary me-2">
                  {filteredPredictions.length} {filteredPredictions.length === 1 ? 'Record' : 'Records'}
                </span>
                {selectedDate && (
                  <span className="badge text-bg-info">
                    Filtered by: {formatDateOnly(selectedDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-md-end">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => onNavigate && onNavigate('profiles')}
              >
                Back to Profiles
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger ifs-animate-in" role="alert">
            {error}
          </div>
        )}

        {/* Date Filter */}
        {uniqueDates.length > 1 && (
          <div className="card ifs-card rounded-4 mb-4 ifs-animate-in">
            <div className="card-body">
              <h5 className="h6 mb-3">Filter by Date</h5>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${!selectedDate ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => filterByDate('')}
                >
                  All Dates
                </button>
                {uniqueDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    className={`btn btn-sm ${selectedDate === date ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => filterByDate(date)}
                  >
                    {formatDateOnly(date)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading prediction history...</p>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="card ifs-card rounded-4 ifs-animate-in">
            <div className="card-body text-center py-5">
              <h3 className="h5 mb-3">No Predictions Found</h3>
              <p className="text-muted">
                {selectedDate 
                  ? 'No predictions for the selected date. Try choosing a different date.'
                  : 'No prediction history available for this Cage ID yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredPredictions.map((prediction, index) => {
              const overall = prediction.environmental_analysis?.overall;
              const overallBadge = severityToBootstrap(overall?.severity || 'secondary');
              
              return (
                <div key={prediction._id || index} className="col-12">
                  <div className="card ifs-card rounded-4 ifs-animate-in">
                    <div className="card-body">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title mb-1">
                            {formatDate(prediction.date)}
                          </h5>
                          <small className="text-muted">Prediction #{filteredPredictions.length - index}</small>
                        </div>
                        <span className={`badge text-bg-${overallBadge}`}>
                          {overall?.severity?.toUpperCase() || 'N/A'}
                        </span>
                      </div>

                      {/* Overall Assessment */}
                      {overall && (
                        <div className={`alert alert-${overallBadge} mb-3`}>
                          <strong>{overall.severity === 'danger' ? '⚠️ CRITICAL' : overall.severity === 'warning' ? '⚠ WARNING' : '✓ OPTIMAL'}:</strong> {overall.message}
                        </div>
                      )}

                      <div className="row g-3">
                        {/* Environmental Inputs */}
                        <div className="col-12 col-lg-6">
                          <h6 className="mb-2">Environmental Factors</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td className="text-muted">Temperature</td>
                                  <td className="fw-semibold">{prediction.input?.temperature}°C</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Humidity</td>
                                  <td className="fw-semibold">{prediction.input?.humidity}%</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Ammonia</td>
                                  <td className="fw-semibold">{prediction.input?.ammonia} ppm</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Light Intensity</td>
                                  <td className="fw-semibold">{prediction.input?.light_intensity} lux</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Noise</td>
                                  <td className="fw-semibold">{prediction.input?.noise} dB</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Predictions */}
                        <div className="col-12 col-lg-6">
                          <h6 className="mb-2">Model Predictions</h6>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Dataset A (Quantity)</span>
                              <span className="badge text-bg-info">
                                {prediction.predictions?.model_a?.quantity?.toFixed(2) || 'N/A'}
                              </span>
                            </div>
                            <small className="text-muted">
                              Confidence: {prediction.predictions?.model_a?.confidence || 'N/A'}
                            </small>
                          </div>
                          
                          <div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Dataset B (Category)</span>
                              <span className="badge text-bg-success">
                                {prediction.predictions?.model_b?.category || 'N/A'}
                              </span>
                            </div>
                            <small className="text-muted">
                              Confidence: {prediction.predictions?.model_b?.confidence || 'N/A'}
                            </small>
                          </div>

                          {prediction.predictions?.ensemble && (
                            <div className="mt-3 p-2 bg-light rounded">
                              <strong>Ensemble:</strong> {prediction.predictions.ensemble.quantity?.toFixed(2) || 'N/A'} ({prediction.predictions.ensemble.category})
                            </div>
                          )}
                        </div>

                        {/* Priority Actions */}
                        {prediction.environmental_analysis?.priorityActions && 
                         prediction.environmental_analysis.priorityActions.length > 0 && (
                          <div className="col-12">
                            <h6 className="mb-2">Priority Actions</h6>
                            <ul className="list-unstyled mb-0">
                              {prediction.environmental_analysis.priorityActions.map((action, i) => (
                                <li key={i} className="mb-2">
                                  <span className={`badge text-bg-${action.priority === 'HIGH' ? 'danger' : 'warning'} me-2`}>
                                    {action.priority}
                                  </span>
                                  <strong>{action.factor}:</strong> {action.action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
