import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/App.css';
import { fetchGroups, fetchCategories, fetchWallpapers } from '../services/api';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
import WallpaperList from '../components/WallpaperList';

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

    return (
        <div className="catalog-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Browse by groups and categories to find your perfect design.</p>
                </div>

                <div className="search-panel" style={{ flex: '0 1 400px', width: '100%' }}>
                    <div className="search-input-wrapper" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by design code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                paddingLeft: '3rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                        <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            🔍
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    opacity: 0.5
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <GroupList
                    groups={groups}
                    selectedGroupIds={selectedGroupIds}
                    onToggleGroup={handleToggleGroup}
                />

                <CategoryList
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onToggleCategory={handleToggleCategory}
                />

                <section className="catalog-status" style={{ marginBottom: '1.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontWeight: '500' }}>
                        {loading ? "Refreshing catalog..." : `Total ${wallpapers.length} wallpapers found`}
                        {selectedGroupIds.length > 0 && ` in ${selectedGroupIds.length} groups`}
                        {selectedCategoryIds.length > 0 && ` and ${selectedCategoryIds.length} categories`}
                    </p>
                </section>

                {loading && wallpapers.length === 0 ? (
                    <div className="loading">Loading wallpapers...</div>
                ) : (
                    <WallpaperList wallpapers={wallpapers} />
                )}
            </main>
        </div>
    );
};

export default Catalog;
