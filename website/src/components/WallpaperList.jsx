import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import VisualizerModal from './VisualizerModal';

const WallpaperList = ({ wallpapers }) => {
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);

    if (wallpapers.length === 0) {
        return <div className="no-results">No wallpapers found for this selection.</div>;
    }

    return (
        <div className="zara-grid">
            <VisualizerModal
                isOpen={!!selectedWallpaper}
                onClose={() => setSelectedWallpaper(null)}
                wallpaper={selectedWallpaper}
            />
            {wallpapers.map(wallpaper => (
                <div key={wallpaper.id} className="card zara-product-card">
                    <Link to={`/wallpaper/${wallpaper.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="image-container zara-image-aspect">
                            <img
                                src={wallpaper.images?.[0]?.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                alt={wallpaper.name}
                                loading="lazy"
                            />
                        </div>
                        <div className="card-content zara-product-info">
                            <h4>{wallpaper.name}</h4>
                            <p className="slug">{wallpaper.slug}</p>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );

};

export default WallpaperList;
