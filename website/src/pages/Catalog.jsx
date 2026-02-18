import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/App.css';
import { fetchGroups, fetchCategories, fetchWallpapers } from '../services/api';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
import WallpaperList from '../components/WallpaperList';
import { Link } from 'react-router-dom';

const Catalog = () => {
    const [searchParams] = useSearchParams();
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallpapers, setWallpapers] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);

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

        if (groupParam) {
            setSelectedGroupIds([groupParam]);
        } else {
            setSelectedGroupIds([]);
        }

        if (catParam) {
            setSelectedCategoryIds([catParam]);
        } else {
            setSelectedCategoryIds([]);
        }
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
                // Fetch categories based on active groups
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
        setSelectedCategoryIds([]); // Reset categories when groups change
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

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <div className="catalog-page fade-in-up">
            {/* Filter Overlay */}
            <div
                className={`filter-overlay ${isFilterOpen ? 'open' : ''}`}
                onClick={() => setIsFilterOpen(false)}
            ></div>

            {/* Filter Drawer */}
            <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
                <div className="filter-header">
                    <button className="btn-close-filter" onClick={() => setIsFilterOpen(false)}>&times;</button>
                </div>

                <div className="filter-content-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="filter-section">
                        <GroupList
                            groups={groups}
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={handleToggleGroup}
                        />
                    </div>

                    <div className="filter-section" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '2rem' }}>
                        <CategoryList
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggleCategory={handleToggleCategory}
                        />
                    </div>
                </div>

                <button className="btn-view-results" onClick={() => setIsFilterOpen(false)}>
                    VIEW RESULTS
                </button>
            </div>

            <header className="page-header" style={{ padding: '4rem 0 2rem 0' }}>
                <div className="zara-breadcrumb">
                    <Link to="/">HOME</Link> / <span>CATALOG</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <button
                            className="filter-trigger-btn"
                            onClick={() => setIsFilterOpen(true)}
                            style={{ display: 'block', marginBottom: '1.5rem' }}
                        >
                            FILTERS
                        </button>
                        <h1 className="zara-detail-title" style={{ margin: 0 }}>COLLECTION</h1>
                        <p className="zara-label" style={{ marginTop: '0.5rem' }}>
                            {loading ? "REFRESHING CATALOG..." : `TOTAL ${wallpapers.length} WALLPAPERS FOUND`}
                        </p>
                    </div>

                    <div className="search-panel" style={{ flex: '0 1 300px', width: '100%' }}>
                        <div className="search-input-wrapper" style={{ position: 'relative', borderBottom: '1px solid #000' }}>
                            <input
                                type="text"
                                placeholder="SEARCH"
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
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        padding: 0,
                                        color: '#000'
                                    }}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {loading && wallpapers.length === 0 ? (
                    <div className="loading" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', padding: '10rem 0', textAlign: 'center' }}>LOADING...</div>
                ) : (
                    <WallpaperList wallpapers={wallpapers} />
                )}
            </main>
        </div>
    );
};

export default Catalog;
