import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Globe,
    Star,
    Layers,
    Sparkles,
    Layout,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { fetchGroups } from '../services/api';
import FloatingProductBar from '../components/FloatingProductBar';
import ZaraMenu from '../components/ZaraMenu';
import ToolsSidebar from '../components/ToolsSidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';
import '../styles/CatalogLayout.css';

const Home = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadGroups = async () => {
            try {
                const data = await fetchGroups();
                setGroups(data);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoading(false);
            }
        };
        loadGroups();
    }, []);

    // Curated high-end fallback images for Zara aesthetic
    const fallbackImages = [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e5252c35a93?auto=format&fit=crop&q=80'
    ];

    return (
        <div className="home-page">
            <ZaraMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                user={user}
                signOut={signOut}
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

                    <div className="zara-breadcrumb" style={{ fontSize: '0.6rem', marginBottom: '2rem' }}>
                        <div className="zara-breadcrumb" style={{ fontSize: '0.6rem' }}>
                            <Link to="/catalog">CATALOG</Link>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: MAIN SCROLLABLE CONTENT */}
                <div className="col-main-content">
                    <div className="zara-container">
                        {/* DYNAMIC GROUPS SECTIONS */}
                        {loading ? (
                            <div style={{ padding: '10rem', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', color: '#000', fontWeight: '800' }}>
                                Loading Collections...
                            </div>
                        ) : (
                            groups.map((group, index) => (
                                <section key={group.id} className="zara-section">
                                    <div className="zara-content-block">
                                        <span className="section-label" style={{ color: '#000', fontWeight: '900' }}>
                                            COLLECTION No. {index + 1} &mdash; {group.name}
                                        </span>
                                        <h2 style={{ fontWeight: '900' }}>
                                            {group.name.split(' ').map((word, i) => (
                                                <React.Fragment key={i}>
                                                    {word} {i === 0 && <br />}
                                                </React.Fragment>
                                            ))}
                                        </h2>
                                        <p style={{ color: '#000', fontWeight: '500' }}>
                                            {group.description || "Discover the essence of architectural purity with our hand-curated collection of premium wall coverings."}
                                        </p>
                                        <div className="infographic-points" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: '600' }}>
                                                <ChevronRight size={14} /> <span>Hand-crafted textures</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: '600' }}>
                                                <ChevronRight size={14} /> <span>Sustainable premium materials</span>
                                            </div>
                                        </div>
                                        <Link to={`/catalog?group=${group.id}`} className="btn-zara-link" style={{ fontWeight: '800' }}>
                                            Explore {group.name} Collection <ArrowRight size={14} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                                        </Link>
                                    </div>
                                    <div
                                        className="zara-visual-block"
                                        style={{
                                            backgroundImage: `url(${group.image_url || fallbackImages[index % fallbackImages.length]})`
                                        }}
                                    >
                                        <div className="visual-block-overlay"></div>
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <ToolsSidebar
                    readOnlySearch
                    onSearchClick={() => navigate('/catalog')}
                />
            </div>
        </div>
    );
};

export default Home;
