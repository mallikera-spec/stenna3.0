import React from 'react';

const CategoryList = ({ categories, selectedCategoryIds, onToggleCategory }) => {
    if (categories.length === 0) return null;

    return (
        <div className="category-list">
            <h3>Categories</h3>
            <div className="flex-wrap">
                <button
                    className={`filter-btn ${selectedCategoryIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleCategory(null)}
                >
                    All Categories
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`filter-btn ${selectedCategoryIds.includes(category.id) ? 'active' : ''}`}
                        onClick={() => onToggleCategory(category.id)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
