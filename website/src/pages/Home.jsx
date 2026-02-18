import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layout, ArrowRight, User } from 'lucide-react';
import { fetchGroups } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';
import '../styles/CatalogLayout.css';

const Home = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadInitialData = async () => {
            try {
                const groupsData = await fetchGroups();
                setGroups(groupsData);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Fallback images for groups if missing
    const fallbackImages = [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e5252c35a93?auto=format&fit=crop&q=80'
    ];

    return (
        <div className="home-page fade-in-up">
            {/* <header className="page-header" style={{ padding: '8rem 5% 4rem 5%', textAlign: 'left' }}>
                <span className="zara-label">STENNA COLLECTION</span>
                <h1 className="zara-hero-title" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: '0.9', margin: '1rem 0' }}>
                    PURE <br /> MATERIALITY.
                </h1>
                <Link to="/catalog" className="btn-zara-outline" style={{ marginTop: '2rem', display: 'inline-block' }}>
                    ENTER ARCHIVE
                </Link>
            </header> */}

            <div className="home-layout-container">
                {/* COLUMN 1: ALTERNATING GROUPS */}
                <div className="col-main-content">
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 className="zara-label" style={{ fontWeight: '800' }}>OUR COLLECTIONS</h2>
                    </div>

                    {loading ? (
                        <div className="loading" style={{ padding: '10rem 0' }}>LOADING COLLECTIONS...</div>
                    ) : (
                        <div className="alternating-list">
                            {groups.map((group, index) => (
                                <div key={group.id} className="alternating-item fade-in-up">
                                    <div className="alt-image-box">
                                        <Link to={`/catalog?group=${group.id}`}>
                                            <img
                                                src={group.image_url || fallbackImages[index % fallbackImages.length]}
                                                alt={group.name}
                                                loading="lazy"
                                            />
                                        </Link>
                                    </div>
                                    <div className="alt-text-box">
                                        <span className="zara-label" style={{ fontSize: '0.6rem', marginBottom: '0.5rem', display: 'block' }}>
                                            COLLECTION No. {index + 1}
                                        </span>
                                        <h4>{group.name}</h4>
                                        <p>{group.description || "Discover the essence of architectural purity with our hand-curated collection of premium wall coverings."}</p>
                                        <Link to={`/catalog?group=${group.id}`} className="btn-zara-link" style={{ marginTop: '2rem' }}>
                                            VIEW COLLECTION
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUMN 2: TOOLS PANEL */}
                <div className="col-tools-panel">
                    {/* Search Section */}
                    <div className="tool-section">
                        <h3>DISCOVER</h3>
                        <div style={{ position: 'relative', borderBottom: '1px solid #000', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="SEARCH CATALOG..."
                                onFocus={() => window.location.href = '/catalog'}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.1em',
                                    outline: 'none',
                                    textTransform: 'uppercase'
                                }}
                            />
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="tool-section">
                        <h3>QUICK ACCESS</h3>
                        <Link to="/try-it-on" className="tool-link">
                            <Layout size={16} /> TRY IT ON
                        </Link>
                        <Link to="/ai-recommendations" className="tool-link">
                            <Sparkles size={16} /> AI ADVISOR
                        </Link>
                    </div>

                    {/* User Section */}
                    <div className="tool-section">
                        <h3>MY STENNA</h3>
                        <div className="user-display">
                            <User size={16} />
                            <span className="user-name-label">
                                {user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : "GUEST"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
