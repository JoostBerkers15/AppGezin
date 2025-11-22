import React, { useEffect, useState } from 'react';
import { supabaseHealthCheck, getSupabaseTables } from '../services/supabaseApi';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';


const Login: React.FC = () => {
  const [supabaseOnline, setSupabaseOnline] = useState<boolean | null>(null);
  const [supabaseTables, setSupabaseTables] = useState<string[]>([]);
    useEffect(() => {
      const check = async () => {
        const ok = await supabaseHealthCheck();
        setSupabaseOnline(ok);
        if (ok) {
          console.log('✅ Verbinding met Supabase is OK');
          const tables = await getSupabaseTables();
          setSupabaseTables(tables);
        } else {
          console.error('❌ Geen verbinding met Supabase!');
        }
      };
      check();
    }, []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    if (!username || !password) {
      setError('Vul alle velden in');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Onjuiste gebruikersnaam of wachtwoord');
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={48} className="login-icon" />
          <h1>Gezin App</h1>
          <p>Log in om toegang te krijgen tot je gezinsplanner</p>
        </div>

        {supabaseOnline === false && (
          <div className="error-message">Geen verbinding met Supabase!</div>
        )}
        {supabaseOnline === true && (
          <>
            <div className="success-message">Verbonden met Supabase</div>
            <div style={{ margin: '10px 0', fontSize: 14 }}>
              <strong>Tabellen in Supabase:</strong>
              <ul>
                {supabaseTables.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </>
        )}
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

          <button type="submit" className="login-button">
            <LogIn size={20} />
            Inloggen
          </button>
        </form>

        {/* login-footer verwijderd, tekst over standaard inloggegevens weggehaald */}
      </div>
    </div>
  );
};

export default Login;
