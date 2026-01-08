import React, { useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';

const numberOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const severityToBootstrap = (severity) => {
  if (severity === 'danger') return 'danger';
  if (severity === 'warning') return 'warning';
  if (severity === 'success') return 'success';
  return 'secondary';
};

export default function WebDashboard({ onNavigate }) {
  // HARDCODED to bypass any Expo Constants caching issues
  const apiBaseUrl = 'http://localhost:5000/api';

  const http = useMemo(
    () =>
      axios.create({
        baseURL: apiBaseUrl,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' },
      }),
    [apiBaseUrl]
  );

  const [health, setHealth] = useState({ status: 'unknown', message: 'Not checked yet' });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [form, setForm] = useState({
    cageId: '',
    temperature: '28',
    humidity: '85',
    ammonia: '15',
    light_intensity: '32',
    noise: '55',
    amount_of_chicken: '0.5',
    amount_of_feeding: '-1.0',
    aqi: '0.02',
    wqi: '0.95',
    humidex: '0.15',
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [result, setResult] = useState(null);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    setApiError('');
    try {
      const r = await http.get('/health');
      setHealth({ status: r.data?.status || 'unknown', message: r.data?.message || 'OK' });
    } catch (err) {
      setHealth({ status: 'down', message: 'Backend not reachable' });
      setApiError(
        `Cannot reach backend at ${apiBaseUrl}. Start the backend first (http://localhost:5000).`
      );
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  const onPredict = async (e) => {
    e.preventDefault();
    setIsPredicting(true);
    setApiError('');
    setResult(null);

    if (!form.cageId || !form.cageId.trim()) {
      setApiError('Cage ID is required');
      setIsPredicting(false);
      return;
    }

    const payload = {
      cageId: form.cageId.trim(),
      temperature: numberOrNull(form.temperature),
      humidity: numberOrNull(form.humidity),
      ammonia: numberOrNull(form.ammonia),
      light_intensity: numberOrNull(form.light_intensity),
      noise: numberOrNull(form.noise),
      amount_of_chicken: numberOrNull(form.amount_of_chicken),
      amount_of_feeding: numberOrNull(form.amount_of_feeding),
      aqi: numberOrNull(form.aqi),
      wqi: numberOrNull(form.wqi),
      humidex: numberOrNull(form.humidex),
    };

    const required = ['temperature', 'humidity', 'ammonia', 'light_intensity', 'noise'];
    for (const k of required) {
      if (payload[k] === null) {
        setApiError(`Missing/invalid value: ${k}`);
        setIsPredicting(false);
        return;
      }
    }

    try {
      const r = await http.post('/predict', payload);
      if (!r.data?.success) throw new Error(r.data?.error || 'Prediction failed');
      setResult(r.data);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Request failed';
      setApiError(msg);
    } finally {
      setIsPredicting(false);
    }
  };

  const overall = result?.environmental_analysis?.overall;
  const overallSeverity = overall?.severity || 'secondary';
  const overallBadge = severityToBootstrap(overallSeverity);
  const mongoSaved = result?.mongodb_saved;
  const mongoMessage = result?.mongodb_message;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px',minWidth: '100vw' }}>
      <div className="ifs-container py-4">
        <div className="ifs-hero rounded-4 p-4 mb-4 ifs-animate-in">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1">Integrated Farm System</h1>
              <div className="text-muted">
               {/* Desktop dashboard (Bootstrap + animations) for predictions and environmental recommendations. */}
              </div>
              <div className="mt-2">
                <span className="badge text-bg-secondary me-2">API</span>
                <span className="ifs-mono">{apiBaseUrl}</span>
              </div>
            </div>

            <div className="text-md-end">
              <div className="mb-2">
                <span
                  className={`badge text-bg-${health.status === 'healthy' ? 'success' : health.status === 'down' ? 'danger' : 'secondary'}`}
                >
                  {health.status}
                </span>
                <span className="ms-2 text-muted">{health.message}</span>
              </div>
              <div className="d-flex gap-2 justify-content-md-end">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={checkHealth}
                  disabled={isCheckingHealth}
                >
                  {isCheckingHealth ? 'Checking…' : 'Re-check Health'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => onNavigate && onNavigate('profiles')}
                >
                  Cage Profiles
                </button>
              </div>
            </div>
          </div>
        </div>

        {apiError ? (
          <div className="alert alert-danger ifs-animate-in" role="alert">
            {apiError}
          </div>
        ) : null}

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card ifs-card rounded-4 ifs-animate-in" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h2 className="h5 mb-0">Inputs</h2>
                  <span className="badge text-bg-primary">Both models</span>
                </div>
                <p className="text-muted mb-3">
                  Fill the farm environment values and indices. Then press Predict.
                </p>

                <form onSubmit={onPredict}>
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="fw-semibold mb-2">Cage Information</div>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Cage ID <span className="text-danger">*</span></label>
                      <input 
                        className="form-control" 
                        value={form.cageId} 
                        onChange={update('cageId')}
                        placeholder="Enter Cage ID"
                        required
                      />
                      <div className="form-text">Unique identifier for your poultry cage</div>
                    </div>

                    <div className="col-12 mt-3">
                      <hr className="my-2" />
                      <div className="fw-semibold">Environment (required)</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Temperature</label>
                      <input className="form-control" value={form.temperature} onChange={update('temperature')} />
                      <div className="form-text">°C</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Humidity</label>
                      <input className="form-control" value={form.humidity} onChange={update('humidity')} />
                      <div className="form-text">%</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Ammonia</label>
                      <input className="form-control" value={form.ammonia} onChange={update('ammonia')} />
                      <div className="form-text">ppm</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Light Intensity</label>
                      <input
                        className="form-control"
                        value={form.light_intensity}
                        onChange={update('light_intensity')}
                      />
                      <div className="form-text">lux</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Noise</label>
                      <input className="form-control" value={form.noise} onChange={update('noise')} />
                      <div className="form-text">dB</div>
                    </div>

                    <div className="col-12">
                      <hr className="my-2" />
                      <div className="fw-semibold">Dataset A features</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Amount of chicken</label>
                      <input
                        className="form-control"
                        value={form.amount_of_chicken}
                        onChange={update('amount_of_chicken')}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Amount of feeding</label>
                      <input
                        className="form-control"
                        value={form.amount_of_feeding}
                        onChange={update('amount_of_feeding')}
                      />
                    </div>

                    <div className="col-12">
                      <hr className="my-2" />
                      <div className="fw-semibold">Dataset B indices</div>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">AQI</label>
                      <input className="form-control" value={form.aqi} onChange={update('aqi')} />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">WQI</label>
                      <input className="form-control" value={form.wqi} onChange={update('wqi')} />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Humidex</label>
                      <input className="form-control" value={form.humidex} onChange={update('humidex')} />
                    </div>

                    <div className="col-12 d-grid mt-2">
                      <button className="btn btn-success btn-lg" type="submit" disabled={isPredicting}>
                        {isPredicting ? (
                          <span className="d-inline-flex align-items-center gap-2">
                            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                            Predicting…
                          </span>
                        ) : (
                          'Predict + Recommendations'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card ifs-card rounded-4 ifs-animate-in" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h2 className="h5 mb-0">Results</h2>
                  {overall ? (
                    <span
                      className={`badge text-bg-${overallBadge} ${overallSeverity === 'danger' ? 'ifs-pulse-danger' : ''}`}
                    >
                      {overall.status} ({overall.score}%)
                    </span>
                  ) : (
                    <span className="badge text-bg-secondary">Waiting</span>
                  )}
                </div>

                {!result ? (
                  <div className="text-muted">Run a prediction to see output.</div>
                ) : (
                  <div className="ifs-animate-in">
                    <div className="row g-3">
                      {typeof mongoSaved === 'boolean' ? (
                        <div className="col-12">
                          <div
                            className={`alert alert-${mongoSaved ? 'success' : 'warning'} mb-0`}
                            role="alert"
                          >
                            <div className="fw-semibold">
                              {mongoSaved ? 'Saved to MongoDB' : 'Not saved to MongoDB'}
                            </div>
                            <div className="small">{mongoMessage || ''}</div>
                          </div>
                        </div>
                      ) : null}

                      <div className="col-12">
                        <div className="p-3 rounded-3 border bg-white">
                          <div className="fw-semibold mb-1">Model predictions</div>
                          <div className="small text-muted mb-2">Ensemble = quantity from A + category from B</div>

                          <div className="row g-2">
                            <div className="col-12 col-md-6">
                              <div className="border rounded-3 p-2">
                                <div className="text-muted small">Dataset A (Regression)</div>
                                <div className="h5 mb-0">
                                  {result.predictions?.model_a?.predicted_quantity}
                                </div>
                                <div className="text-muted small">
                                  Confidence: {result.predictions?.model_a?.confidence}%
                                </div>
                              </div>
                            </div>

                            <div className="col-12 col-md-6">
                              <div className="border rounded-3 p-2">
                                <div className="text-muted small">Dataset B (Classification)</div>
                                <div className="h5 mb-0">
                                  {result.predictions?.model_b?.predicted_category}
                                </div>
                                <div className="text-muted small">
                                  Confidence: {result.predictions?.model_b?.confidence}%
                                </div>
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="border rounded-3 p-2">
                                <div className="text-muted small">Ensemble</div>
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                  <span className="badge text-bg-primary">
                                    Quantity: {result.predictions?.ensemble?.quantity}
                                  </span>
                                  <span className="badge text-bg-info">
                                    Category: {result.predictions?.ensemble?.category}
                                  </span>
                                  <span className="badge text-bg-dark">
                                    Confidence: {result.predictions?.ensemble?.confidence}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className={`alert alert-${overallBadge} mb-0`} role="alert">
                          <div className="fw-semibold">Overall environment</div>
                          <div>{overall?.message}</div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="p-3 rounded-3 border bg-white">
                          <div className="fw-semibold mb-2">Priority actions</div>
                          {result.environmental_analysis?.priorityActions?.length ? (
                            <ul className="mb-0">
                              {result.environmental_analysis.priorityActions.map((a, idx) => (
                                <li key={`${a.factor}-${idx}`}>
                                  <span
                                    className={`badge text-bg-${a.priority === 'HIGH' ? 'danger' : 'warning'} me-2`}
                                  >
                                    {a.priority}
                                  </span>
                                  <span className="text-capitalize">{String(a.factor).replace('_', ' ')}</span>: {a.action}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-muted">No actions needed.</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="p-3 rounded-3 border bg-white">
                          <div className="fw-semibold mb-2">Factor details</div>
                          <div className="row g-2">
                            {Object.values(result.environmental_analysis?.factors || {}).map((f) => (
                              <div className="col-12" key={f.factor}>
                                <div className={`border rounded-3 p-2 border-${severityToBootstrap(f.severity)}`}>
                                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                                    <div>
                                      <div className="fw-semibold text-capitalize">
                                        {String(f.factor).replace('_', ' ')}
                                      </div>
                                      <div className="text-muted small">{f.message}</div>
                                    </div>
                                    <div className="text-end">
                                      <span className={`badge text-bg-${severityToBootstrap(f.severity)}`}>{f.status}</span>
                                      <div className="small text-muted mt-1">
                                        {f.value}{f.unit} (optimal {f.optimalRange})
                                      </div>
                                    </div>
                                  </div>

                                  {f.adjustment ? (
                                    <div className="mt-2">
                                      <span className="badge text-bg-secondary me-2">Exact adjustment</span>
                                      <span className="ifs-mono">
                                        {f.adjustment.direction} by {f.adjustment.value}{f.unit}
                                      </span>
                                    </div>
                                  ) : null}

                                  <div className="mt-2 small">{f.recommendation}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="text-muted small">
                          Timestamp: <span className="ifs-mono">{result.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted small mt-4">
          Tip: Start backend first from Integrated-Farm-System-Backend with <span className="ifs-mono">npm start</span>.
        </div>
      </div>
    </div>
  );
}
