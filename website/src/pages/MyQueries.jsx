import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';
import '../styles/CatalogLayout.css';
import { fetchUserQueries } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ZaraMenu from '../components/ZaraMenu';

const MyQueries = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQueries = async () => {
            if (!user) return;
            try {
                const data = await fetchUserQueries(user.id);
                setQueries(data);
            } catch (error) {
                console.error("Error fetching queries:", error);
            } finally {
                setLoading(false);
            }
        };
        loadQueries();
    }, [user]);

    if (loading) return <div className="loading">Loading your inquiries...</div>;

    return (
        <div className="queries-page fade-in-up">
            <ZaraMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                user={user}
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
                    <header className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>My Inquiries</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Track your inquiries and follow up with dealers.</p>
                    </header>

                    <div className="card overflow-x-auto" style={{ border: 'none' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Details</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queries.map(q => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '1.5rem 1rem', fontSize: '0.85rem' }}>
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                {q.wallpaper?.name || 'Wallpaper Enquiry'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                                {q.message}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontWeight: '600'
                                            }}>
                                                {q.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {queries.length === 0 && (
                            <div style={{ padding: '5rem', textAlign: 'center', color: '#888' }}>
                                No inquiries found.
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <div className="col-tools-panel desktop-only">
                    <div className="zara-search-wrapper">
                        <input
                            type="text"
                            placeholder="SEARCH"
                            className="zara-search-input"
                            onClick={() => window.location.href = '/catalog'}
                            readOnly
                        />
                    </div>

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

export default MyQueries;
