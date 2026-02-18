import React from 'react';

const CategoryList = ({ categories, selectedCategoryIds, onToggleCategory }) => {
    if (categories.length === 0) return null;

    return (
        <div className="category-list">
            <span className="section-label">[02] CATEGORIES</span>
            <div className="flex-wrap" style={{ gap: '1rem' }}>
                <button
                    className={`btn-zara-outline ${selectedCategoryIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleCategory(null)}
                    style={{
                        padding: '0.4rem 1rem',
                        fontSize: '0.6rem',
                        backgroundColor: selectedCategoryIds.length === 0 ? '#000' : 'transparent',
                        color: selectedCategoryIds.length === 0 ? '#fff' : '#000'
                    }}
                >
                    ALL
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`btn-zara-outline ${selectedCategoryIds.includes(category.id) ? 'active' : ''}`}
                        onClick={() => onToggleCategory(category.id)}
                        style={{
                            padding: '0.4rem 1rem',
                            fontSize: '0.6rem',
                            backgroundColor: selectedCategoryIds.includes(category.id) ? '#000' : 'transparent',
                            color: selectedCategoryIds.includes(category.id) ? '#fff' : '#000'
                        }}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
