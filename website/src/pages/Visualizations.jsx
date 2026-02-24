import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVisualizationHistory } from '../hooks/useVisualizationHistory';
import ToolsSidebar from '../components/ToolsSidebar';
import '../styles/CatalogLayout.css';

const Visualizations = () => {
    const { history, loading, removeFromHistory, clearHistory } = useVisualizationHistory();
    const [activeFilters, setActiveFilters] = useState({
        date: 'all',
        group: 'all',
        category: 'all'
    });

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            // Date Filter
            if (activeFilters.date !== 'all') {
                const itemDate = new Date(item.timestamp);
                const now = new Date();
                const diffTime = Math.abs(now - itemDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (activeFilters.date === 'today' && diffDays > 1) return false;
                if (activeFilters.date === 'week' && diffDays > 7) return false;
                if (activeFilters.date === 'month' && diffDays > 30) return false;
            }

            // Group Filter
            if (activeFilters.group !== 'all' && item.groupName !== activeFilters.group) return false;

            // Category Filter
            if (activeFilters.category !== 'all' && item.categoryName !== activeFilters.category) return false;

            return true;
        });
    }, [history, activeFilters]);

    // Derived metadata for filters
    const groups = useMemo(() => ['all', ...new Set(history.map(h => h.groupName).filter(Boolean))], [history]);
    const categories = useMemo(() => ['all', ...new Set(history.map(h => h.categoryName).filter(Boolean))], [history]);

    return (
        <div className="catalog-page fade-in-up">
            <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                {/* COLUMN 1: FILTER SIDEBAR */}
                <div className="col-filter-trigger desktop-only">
                    <div className="zara-breadcrumb">
                        <Link to="/">HOME</Link> / <span>HISTORY</span>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div className="tool-section">
                            <h3>DATE</h3>
                            <ul className="zara-sidebar-list">
                                {['all', 'today', 'week', 'month'].map(d => (
                                    <li key={d}>
                                        <button
                                            className={`zara-sidebar-item ${activeFilters.date === d ? 'active' : ''}`}
                                            onClick={() => setActiveFilters(prev => ({ ...prev, date: d }))}
                                        >
                                            {d.toUpperCase()}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="tool-section" style={{ marginTop: '2.5rem' }}>
                            <h3>GROUPS</h3>
                            <ul className="zara-sidebar-list">
                                {groups.map(g => (
                                    <li key={g}>
                                        <button
                                            className={`zara-sidebar-item ${activeFilters.group === g ? 'active' : ''}`}
                                            onClick={() => setActiveFilters(prev => ({ ...prev, group: g }))}
                                        >
                                            {g.toUpperCase()}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="tool-section" style={{ marginTop: '2.5rem' }}>
                            <h3>CATEGORIES</h3>
                            <ul className="zara-sidebar-list">
                                {categories.map(c => (
                                    <li key={c}>
                                        <button
                                            className={`zara-sidebar-item ${activeFilters.category === c ? 'active' : ''}`}
                                            onClick={() => setActiveFilters(prev => ({ ...prev, category: c }))}
                                        >
                                            {c.toUpperCase()}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: MAIN CONTENT */}
                <div className="col-main-content" style={{ padding: '4rem 1.5rem !important' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4rem' }}>
                        <div>
                            <h1 className="zara-label" style={{ fontSize: '1.5rem', letterSpacing: '0.2em' }}>VISUALIZATION HISTORY</h1>
                            <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.5rem', letterSpacing: '0.1em' }}>
                                {filteredHistory.length} TRANSFORMATIONS FOUND
                            </p>
                        </div>
                        {history.length > 0 && (
                            <button
                                onClick={clearHistory}
                                style={{ background: 'none', border: 'none', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer', opacity: 0.5 }}
                            >
                                CLEAR ALL
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ padding: '10rem 0', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>LOADING...</div>
                    ) : filteredHistory.length === 0 ? (
                        <div style={{ padding: '10rem 0', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                            NO RESULTS MATCHING YOUR FILTERS
                        </div>
                    ) : (
                        <div className="related-zara-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4rem 2rem' }}>
                            {filteredHistory.map((item) => (
                                <div key={item.id} className="history-card zara-fade-in">
                                    <div className="history-viz-container" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/10', borderRadius: '2px' }}>
                                        {/* Comparison View */}
                                        <div className="viz-comparison group">
                                            <div className="viz-layer after" style={{ width: '100%', height: '100%' }}>
                                                <img src={item.generatedUrl} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <span style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '0.55rem', padding: '4px 8px', letterSpacing: '0.1em' }}>AI RESULT</span>
                                            </div>

                                            <div className="viz-layer before" style={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                opacity: 0, transition: 'opacity 0.4s ease',
                                                pointerEvents: 'none'
                                            }}>
                                                <img src={item.originalUrl} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <span style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.55rem', padding: '4px 8px', letterSpacing: '0.1em' }}>ORIGINAL</span>
                                            </div>

                                            {/* Hover instructions or small icon */}
                                            <div className="viz-hint" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, transition: 'opacity 0.3s' }}>
                                                <span style={{ background: '#000', color: '#fff', padding: '8px 16px', fontSize: '0.6rem', letterSpacing: '0.2em' }}>VIEW BEFORE</span>
                                            </div>
                                        </div>

                                        <button
                                            className="close-modal"
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', zIndex: 10, border: 'none', cursor: 'pointer' }}
                                            onClick={(e) => { e.preventDefault(); removeFromHistory(item.id); }}
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div className="related-info" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <Link to={`/wallpaper/${item.wallpaperSlug}`} className="related-name" style={{ textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    {item.wallpaperName}
                                                </Link>
                                                <div style={{ fontSize: '0.6rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem' }}>
                                                    {item.groupName} / {item.categoryName}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.55rem', opacity: 0.5, letterSpacing: '0.05em' }}>
                                                {new Date(item.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <ToolsSidebar />
            </div>

            <style>{`
                .history-viz-container:hover .before {
                    opacity: 1 !important;
                }
                .history-viz-container:hover .viz-hint {
                    opacity: 0.8 !important;
                }
                .zara-sidebar-item.active {
                    font-weight: 800;
                    text-decoration: underline;
                }
                .history-card {
                    transition: transform 0.3s ease;
                }
                .history-card:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
};

export default Visualizations;
