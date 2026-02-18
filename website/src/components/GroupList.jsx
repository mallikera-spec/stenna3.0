import React from 'react';

const GroupList = ({ groups, selectedGroupIds, onToggleGroup }) => {
    return (
        <div className="group-list" style={{ marginBottom: '1.5rem' }}>
            <span className="section-label">[01] GROUPS</span>
            <div className="flex-wrap" style={{ gap: '1rem' }}>
                <button
                    className={`btn-zara-outline ${selectedGroupIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleGroup(null)}
                    style={{
                        padding: '0.4rem 1rem',
                        fontSize: '0.6rem',
                        backgroundColor: selectedGroupIds.length === 0 ? '#000' : 'transparent',
                        color: selectedGroupIds.length === 0 ? '#fff' : '#000'
                    }}
                >
                    ALL
                </button>
                {groups.map(group => (
                    <button
                        key={group.id}
                        className={`btn-zara-outline ${selectedGroupIds.includes(group.id) ? 'active' : ''}`}
                        onClick={() => onToggleGroup(group.id)}
                        style={{
                            padding: '0.4rem 1rem',
                            fontSize: '0.6rem',
                            backgroundColor: selectedGroupIds.includes(group.id) ? '#000' : 'transparent',
                            color: selectedGroupIds.includes(group.id) ? '#fff' : '#000'
                        }}
                    >
                        {group.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GroupList;
