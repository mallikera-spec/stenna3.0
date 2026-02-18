import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Layout, Search, User } from 'lucide-react';
import '../styles/App.css';
import '../styles/CatalogLayout.css';
import { fetchGroups, fetchCategories, fetchWallpapers } from '../services/api';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
import WallpaperList from '../components/WallpaperList';
import { useAuth } from '../context/AuthContext';

const Catalog = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallpapers, setWallpapers] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Initial load for groups
    useEffect(() => {
        const loadGroups = async () => {
            try {
                const groupsData = await fetchGroups();
                setGroups(groupsData);
            } catch (error) {
                console.error("Error loading groups:", error);
            }
        };
        loadGroups();
    }, []);

    // Sync URL params to state
    useEffect(() => {
        const groupParam = searchParams.get('group');
        const catParam = searchParams.get('category');

        if (groupParam) setSelectedGroupIds([groupParam]);
        else setSelectedGroupIds([]);

        if (catParam) setSelectedCategoryIds([catParam]);
        else setSelectedCategoryIds([]);
    }, [searchParams]);

    // Handle search debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const loadFilteredData = async () => {
            setLoading(true);
            try {
                if (selectedGroupIds.length > 0) {
                    const catsPromises = selectedGroupIds.map(id => fetchCategories(id));
                    const catsArrays = await Promise.all(catsPromises);
                    const mergedCats = Array.from(new Set(catsArrays.flat().map(c => c.id)))
                        .map(id => catsArrays.flat().find(c => c.id === id));
                    setCategories(mergedCats);
                } else {
                    setCategories([]);
                }

                const walls = await fetchWallpapers({
                    groupIds: selectedGroupIds,
                    categoryIds: selectedCategoryIds,
                    search: debouncedSearch
                });
                setWallpapers(walls);
            } catch (error) {
                console.error("Error loading filtered data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadFilteredData();
    }, [selectedGroupIds, selectedCategoryIds, debouncedSearch]);

    const handleToggleGroup = (groupId) => {
        if (groupId === null) {
            setSelectedGroupIds([]);
            setSelectedCategoryIds([]);
            return;
        }
        setSelectedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
        setSelectedCategoryIds([]);
    };

    const handleToggleCategory = (categoryId) => {
        if (categoryId === null) {
            setSelectedCategoryIds([]);
            return;
        }
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    };

    return (
        <div className="catalog-page fade-in-up">
            {/* Filter Overlay & Drawer */}
            <div className={`filter-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}></div>
            <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
                <div className="filter-header">
                    <button className="btn-close-filter" onClick={() => setIsFilterOpen(false)}>&times;</button>
                    <h2 className="zara-label">FILTERS</h2>
                </div>

                <div className="filter-content-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="filter-section">
                        <GroupList groups={groups} selectedGroupIds={selectedGroupIds} onToggleGroup={handleToggleGroup} />
                    </div>
                    <div className="filter-section" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '2rem' }}>
                        <CategoryList categories={categories} selectedCategoryIds={selectedCategoryIds} onToggleCategory={handleToggleCategory} />
                    </div>
                </div>

                {/* Pagination at the bottom of the tool panel */}
                <div className="pagination-container-drawer">
                    <button className="page-dot active"></button>
                    <button className="page-dot"></button>
                    <button className="page-dot"></button>
                </div>

                <button className="btn-view-results" onClick={() => setIsFilterOpen(false)}>
                    VIEW RESULTS
                </button>
            </div>

            <header className="page-header" style={{ padding: '4rem 5% 0 5%' }}>
                <div className="zara-breadcrumb">
                    <Link to="/">HOME</Link> / <span>CATALOG</span>
                </div>
            </header>

            <div className="desktop-layout-container">
                {/* COLUMN 1: FILTER TRIGGER */}
                <div className="col-filter-trigger desktop-only">
                    <button className="filter-word-btn" onClick={() => setIsFilterOpen(true)}>
                        FILTER
                    </button>
                </div>

                {/* COLUMN 2: ALTERNATING CONTENT */}
                <div className="col-main-content">
                    <div style={{ marginBottom: '4rem' }}>
                        <h1 className="zara-detail-title" style={{ margin: 0 }}>COLLECTION</h1>
                        <p className="zara-label" style={{ marginTop: '0.5rem' }}>
                            {loading ? "REFRESHING..." : `TOTAL ${wallpapers.length} ITEMS`}
                        </p>
                    </div>

                    {loading && wallpapers.length === 0 ? (
                        <div className="loading" style={{ padding: '10rem 0' }}>LOADING...</div>
                    ) : (
                        <WallpaperList wallpapers={wallpapers} isAlternating={true} />
                    )}
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <div className="col-tools-panel">
                    {/* Search Section */}
                    <div className="tool-section">
                        <h3>SEARCH</h3>
                        <div style={{ position: 'relative', borderBottom: '1px solid #000' }}>
                            <input
                                type="text"
                                placeholder="KEYWORDS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                    {/* Links Section */}
                    <div className="tool-section">
                        <h3>DISCOVERY</h3>
                        <Link to="/try-it-on" className="tool-link">
                            <Layout size={16} /> TRY IT ON YOUR WALL
                        </Link>
                        <Link to="/ai-recommendations" className="tool-link">
                            <Sparkles size={16} /> AI RECOMMENDATIONS
                        </Link>
                    </div>

                    {/* User Section */}
                    <div className="tool-section">
                        <h3>ACCOUNT</h3>
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

export default Catalog;
