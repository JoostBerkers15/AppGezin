import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';
import { healthCheck, HealthResult } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [backendReason, setBackendReason] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (backendAvailable === false) {
      setError('Backend niet bereikbaar. Controleer netwerk of probeer opnieuw.');
      return;
    }

    if (!username || !password) {
      setError('Vul alle velden in');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Onjuiste gebruikersnaam of wachtwoord');
    }
  };

  const checkBackend = async () => {
    setCheckingBackend(true);
    setError('');
    setBackendReason(null);
    const result: HealthResult = await healthCheck();
    setBackendAvailable(result.ok);
    if (!result.ok) {
      const reason = result.reason || 'Backend niet bereikbaar.';
      setBackendReason(reason);
      setError(reason);
    }
    setCheckingBackend(false);
  };

  useEffect(() => {
    checkBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={48} className="login-icon" />
          <h1>Gezin App</h1>
          <p>Log in om toegang te krijgen tot je gezinsplanner</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Gebruikersnaam</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Voer je gebruikersnaam in"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Wachtwoord</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Voer je wachtwoord in"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {backendAvailable === false && (
            <div className="error-message">
              <strong>Backend niet bereikbaar.</strong>
              <div style={{ marginTop: 6 }}>{backendReason}</div>
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={checkBackend} className="retry-button">
                  Probeer opnieuw
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="login-button" disabled={backendAvailable === false || checkingBackend}>
            <LogIn size={20} />
            Inloggen
          </button>
        </form>

        <div className="login-footer">
          <p>Standaard inloggegevens staan in de .env file</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
