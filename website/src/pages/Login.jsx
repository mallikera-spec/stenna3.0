import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signInWithGoogle } from '../services/authService';
import '../styles/App.css';
import '../styles/CatalogLayout.css';
import ZaraMenu from '../components/ZaraMenu';

const Login = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signIn(email, password);
            navigate('/catalog');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page fade-in-up">
            <ZaraMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                user={null} // Not logged in yet
                signOut={() => { }}
            />

            <div className="desktop-layout-container">
                {/* COLUMN 1: NAVIGATION TRIGGER */}
                <div className="col-filter-trigger desktop-only">
                    <div style={{ marginBottom: '2rem' }}>
                        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(true)} style={{ padding: '0', marginBottom: '2rem' }}>
                            <div className="zara-hamburger">
                                <div className="bar"></div>
                                <div className="bar"></div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* COLUMN 2: MAIN SCROLLABLE CONTENT */}
                <div className="col-main-content">
                    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
                        <div className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                            {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: 'white',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google logo" />
                                Sign in with Google
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="filter-btn active"
                                    style={{ padding: '0.75rem', fontSize: '1rem' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <div className="col-tools-panel desktop-only">
                    {/* Search Section */}
                    <div className="zara-search-wrapper">
                        <input
                            type="text"
                            placeholder="SEARCH"
                            className="zara-search-input"
                            onClick={() => navigate('/catalog')}
                            readOnly
                        />
                    </div>

                    {/* Navigation/User Section */}
                    <div className="sidebar-tools-group">
                        <Link to="/ai-recommendations" className="sidebar-tool-link">
                            AI RECOMMENDATIONS
                        </Link>
                        <Link to="/try-it-on" className="sidebar-tool-link">
                            TRY IT ON
                        </Link>
                        <Link to="/profile/enquiries" className="sidebar-tool-link">
                            MY QUERIES
                        </Link>
                        <Link to="/profile" className="sidebar-tool-link">
                            ACCOUNT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
