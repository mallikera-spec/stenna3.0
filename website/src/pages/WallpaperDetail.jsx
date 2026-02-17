import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWallpaperBySlug, fetchWallpapers } from '../services/api';
import RelatedProductCarousel from '../components/RelatedProductCarousel';
import VisualizerModal from '../components/VisualizerModal';
import EnquiryModal from '../components/EnquiryModal';
import FloatingProductBar from '../components/FloatingProductBar';
import '../styles/App.css';

const WallpaperDetail = () => {
    const { slug } = useParams();
    const [wallpaper, setWallpaper] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeImage, setActiveImage] = useState(0);
    const [productList, setProductList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [timeLapseProduct, setTimeLapseProduct] = useState(null);
    const [isTimeLapsing, setIsTimeLapsing] = useState(false);
    const prevSlugRef = useRef(slug);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            const cachedProduct = productList.find(p => p.slug === slug);
            const prevSlug = prevSlugRef.current;
            prevSlugRef.current = slug;

            // Time-Lapse Detection & Sequence
            if (productList.length > 0 && prevSlug && prevSlug !== slug) {
                const prevIndex = productList.findIndex(p => p.slug === prevSlug);
                const nextIndex = productList.findIndex(p => p.slug === slug);

                // Only time-lapse if we jump more than 1 item (not a direct neighbor swipe)
                if (prevIndex !== -1 && nextIndex !== -1 && Math.abs(nextIndex - prevIndex) > 1) {
                    setIsTimeLapsing(true);
                    const direction = nextIndex > prevIndex ? 1 : -1;
                    const intermediates = [];
                    // Max 8 intermediate flashes to keep it snappy
                    const step = Math.max(1, Math.floor(Math.abs(nextIndex - prevIndex) / 8));

                    for (let i = prevIndex + (direction * step);
                        direction > 0 ? i < nextIndex : i > nextIndex;
                        i += (direction * step)) {
                        intermediates.push(productList[i]);
                    }

                    // Rapid Cycle sequence
                    for (const item of intermediates) {
                        setTimeLapseProduct(item);
                        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms ultra-fast flash
                    }

                    // Small pause on the last intermediate to build tension before final reveal
                    await new Promise(resolve => setTimeout(resolve, 30));

                    setIsTimeLapsing(false);
                    setTimeLapseProduct(null);
                }
            }

            if (cachedProduct) {
                // Instant update - use cached basic info to avoid loading screen
                setWallpaper(prev => ({
                    ...cachedProduct,
                    // Preserve existing full data if we had it, but prioritize new basic info
                    ...(prev?.slug === slug ? prev : {})
                }));
                // We're already "loaded" as far as the user is concerned
                setLoading(false);
            } else {
                // Truly new view or collection jump - show loader
                setLoading(true);
            }

            try {
                // Background (or foreground if truly new) fetch for full metadata
                const data = await fetchWallpaperBySlug(slug);
                setWallpaper(data);

                if (data.images && data.images.length > 0) {
                    setActiveImage(0);
                }

                // If collection jump, fetch new list
                const gId = data.groups?.[0]?.id;
                const cId = data.categories?.[0]?.id;

                if ((gId || cId) && productList.length === 0) {
                    setListLoading(true);
                    const listData = await fetchWallpapers({
                        groupIds: gId ? [gId] : [],
                        categoryIds: cId ? [cId] : [],
                        activeOnly: 'true'
                    });
                    setProductList(listData.slice(0, 50));
                    setListLoading(false);
                }
            } catch (err) {
                // Only show error if we don't even have cached data
                if (!cachedProduct) setError(err.message);
                console.error("Background sync error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            const currentIndex = productList.findIndex(p => p.slug === slug);
            if (currentIndex === -1) return;

            if (diff > 0) {
                // Swipe Left -> Next Product
                const nextIndex = (currentIndex + 1) % productList.length;
                navigate(`/wallpaper/${productList[nextIndex].slug}`);
            } else {
                // Swipe Right -> Prev Product
                const prevIndex = (currentIndex - 1 + productList.length) % productList.length;
                navigate(`/wallpaper/${productList[prevIndex].slug}`);
            }
        }
        setTouchStart(null);
    };

    if (loading) return <div className="loading">Loading Stenna details...</div>;
    if (error) return <div className="error" style={{ textAlign: 'center', padding: '4rem' }}>{error}</div>;
    if (!wallpaper) return null;

    const firstGroupId = wallpaper.groups?.[0]?.id;
    const firstCategoryId = wallpaper.categories?.[0]?.id;

    return (
        <div
            className="detail-page"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }} // Allow vertical scroll, capture horizontal
        >
            <VisualizerModal
                isOpen={isVisualizerOpen}
                onClose={() => setIsVisualizerOpen(false)}
                wallpaper={wallpaper}
            />
            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                wallpaper={wallpaper}
            />

            {/* Premium Full-Screen Gallery Modal */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="gallery-modal"
                    >
                        <button className="gallery-close" onClick={() => setIsGalleryOpen(false)}>&times;</button>
                        <div className="gallery-layout">
                            <div className="gallery-main">
                                <motion.img
                                    key={activeImage}
                                    src={wallpaper.images?.[activeImage]?.image_url}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <div className="gallery-sidebar">
                                {wallpaper.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`gallery-thumb ${activeImage === idx ? 'active' : ''}`}
                                        onClick={async () => {
                                            if (idx === activeImage) return;
                                            // Internal Time-Lapse for Image Selection
                                            setIsTimeLapsing(true);
                                            const direction = idx > activeImage ? 1 : -1;
                                            for (let i = activeImage + direction; direction > 0 ? i < idx : i > idx; i += direction) {
                                                setTimeLapseProduct({ ...wallpaper, images: [wallpaper.images[i]] });
                                                await new Promise(r => setTimeout(r, 40));
                                            }
                                            setIsTimeLapsing(false);
                                            setTimeLapseProduct(null);
                                            setActiveImage(idx);
                                        }}
                                    >
                                        <img src={img.image_url} alt="Gallery Thumb" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time-Lapse Overlay (Enhanced for both Product and Image jumps) */}
            <AnimatePresence>
                {isTimeLapsing && timeLapseProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100%', height: '100vh',
                            zIndex: 20000, background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <img
                            src={timeLapseProduct.images?.[0]?.image_url}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px)', opacity: 0.8 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.div
                    key={slug}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="detail-container"
                >
                    {isMobile ? (
                        /* Mobile Optimized Layout */
                        <div className="mobile-detail-layout">
                            {/* 1. Hero Image */}
                            <div className="mobile-hero-image" onClick={() => setIsGalleryOpen(true)}>
                                <img src={wallpaper.images?.[0]?.image_url} alt={wallpaper.name} />
                                <div className="expand-hint">TAP TO EXPAND</div>
                            </div>

                            {/* 2. Tabbed Information */}
                            <div className="mobile-info-tabs">
                                <div className="tab-headers">
                                    <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Info</button>
                                    <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>Specs</button>
                                    <button className={activeTab === 'actions' ? 'active' : ''} onClick={() => setActiveTab('actions')}>Buy</button>
                                </div>
                                <div className="tab-content">
                                    {activeTab === 'description' && (
                                        <div className="tab-pane">
                                            <h1>{wallpaper.name}</h1>
                                            <p>{wallpaper.slug}</p>
                                            <p className="desc">Experience the luxury of {wallpaper.name}. Designed for high-end interiors, this premium wallpaper combines texture and durability.</p>
                                        </div>
                                    )}
                                    {activeTab === 'specs' && (
                                        <div className="tab-pane">
                                            <div className="specs-list">
                                                <div className="spec-row"><span>Material</span><span>Non-woven</span></div>
                                                <div className="spec-row"><span>Roll Size</span><span>0.53m x 10m</span></div>
                                                <div className="spec-row"><span>Origin</span><span>Italian Collection</span></div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'actions' && (
                                        <div className="tab-pane">
                                            <div className="mobile-actions">
                                                <button className="btn-usp-try" onClick={() => setIsVisualizerOpen(true)}>Try it on my wall</button>
                                                <button className="btn-usp-enquire" onClick={() => setIsEnquiryOpen(true)}>Enquire for Quote</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Remaining Images */}
                            <div className="mobile-gallery">
                                {wallpaper.images?.slice(1).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.image_url}
                                        alt="Gallery"
                                        onClick={() => {
                                            setActiveImage(idx + 1);
                                            setIsGalleryOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Desktop Layout */
                        <>
                            {/* Left Column: Vertical Image Scroll */}
                            <div className="detail-image-scroll">
                                {wallpaper.images?.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.image_url}
                                        alt={`${wallpaper.name} detail ${idx}`}
                                        className="detail-scroll-image"
                                        onClick={() => {
                                            setActiveImage(idx);
                                            setIsGalleryOpen(true);
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Right Column: Sticky Info Area */}
                            <div className="zara-detail-info">
                                <nav className="zara-breadcrumb">
                                    <Link to="/catalog">Catalog</Link> / <span>{wallpaper.name}</span>
                                </nav>

                                <h1 className="zara-detail-title">{wallpaper.name}</h1>
                                <p className="zara-detail-slug">{wallpaper.slug}</p>

                                <div className="product-description zara-detail-desc">
                                    <p>Minimalist wallpaper with refined texture. Designed for high-end archival interiors.</p>
                                </div>

                                <div className="zara-detail-meta">
                                    <div className="meta-item">
                                        <span>Material</span>
                                        <span>Non-woven Premium</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>Roll Size</span>
                                        <span>0.53m x 10m</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>Origin</span>
                                        <span>Stenna Heritage</span>
                                    </div>
                                </div>

                                <div className="zara-detail-actions">
                                    <button
                                        className="btn-zara-primary"
                                        onClick={() => setIsVisualizerOpen(true)}
                                    >
                                        Try on my wall
                                    </button>
                                    <button
                                        className="btn-zara-outline"
                                        onClick={() => setIsEnquiryOpen(true)}
                                    >
                                        Enquire for Quote
                                    </button>
                                </div>
                            </div>

                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            <FloatingProductBar
                currentSlug={slug}
                groupId={firstGroupId}
                categoryId={firstCategoryId}
                products={productList}
                loading={listLoading}
            />
        </div>
    );
};

export default WallpaperDetail;
