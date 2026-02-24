import React from 'react';
import { Link } from 'react-router-dom';

const ToolsSidebar = ({
    searchQuery,
    setSearchQuery,
    handleSearch,
    readOnlySearch = false,
    onSearchClick
}) => {
    return (
        <div className="col-tools-panel desktop-only">
            {/* Search Section */}
            <div className="zara-search-wrapper">
                <input
                    type="text"
                    placeholder="SEARCH"
                    value={searchQuery}
                    onChange={setSearchQuery ? (e) => setSearchQuery(e.target.value) : undefined}
                    onKeyDown={handleSearch}
                    onClick={onSearchClick}
                    className="zara-search-input"
                    readOnly={readOnlySearch}
                />
            </div>

            {/* Navigation/User Section */}
            <div className="sidebar-tools-group">
                <Link to="/ai-recommendations" className="sidebar-tool-link">
                    AI RECOMMENDATIONS
                </Link>
                <Link to="/profile/visualizations" className="sidebar-tool-link">
                    VISUALIZATION HISTORY
                </Link>
                <Link to="/profile/enquiries" className="sidebar-tool-link">
                    MY QUERIES
                </Link>
                <Link to="/profile" className="sidebar-tool-link">
                    ACCOUNT
                </Link>
            </div>
        </div>
    );
};

export default ToolsSidebar;
