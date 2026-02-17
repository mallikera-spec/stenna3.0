import React from 'react';

const GroupList = ({ groups, selectedGroupIds, onToggleGroup }) => {
    return (
        <div className="group-list">
            <h3>Groups</h3>
            <div className="flex-wrap">
                <button
                    className={`filter-btn ${selectedGroupIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleGroup(null)}
                >
                    All
                </button>
                {groups.map(group => (
                    <button
                        key={group.id}
                        className={`filter-btn ${selectedGroupIds.includes(group.id) ? 'active' : ''}`}
                        onClick={() => onToggleGroup(group.id)}
                    >
                        {group.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GroupList;
