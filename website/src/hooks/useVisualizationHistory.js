import { useState, useEffect } from 'react';
import { fetchVisualizationHistory } from '../services/api';

export const useVisualizationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await fetchVisualizationHistory();
            // Backend returns full relations, we map it to a flat structure for the UI
            const formattedHistory = data.map(item => ({
                id: item.id,
                wallpaperId: item.wallpaper_id,
                wallpaperName: item.wallpapers?.name,
                wallpaperSlug: item.wallpapers?.slug,
                generatedUrl: item.generated_image_url,
                originalUrl: item.room_image_url, // Added original room URL
                timestamp: item.created_at,
                groupName: item.wallpapers?.groups?.name,
                categoryName: item.wallpapers?.categories?.name
            }));
            setHistory(formattedHistory);
        } catch (err) {
            console.error('Error fetching visualization history:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const saveToHistory = async (wallpaper, generatedUrl) => {
        // Backend saves automatically during generation in VisualizerModal,
        // so we just reload the history to get the latest state.
        await loadHistory();
    };

    const clearHistory = () => {
        // Clearing backend history might require a new endpoint, 
        // for now we just clear the local state to simulate.
        setHistory([]);
    };

    const removeFromHistory = (id) => {
        // Removing from backend history might require a new endpoint,
        // for now we just filter the local state.
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    return { history, loading, error, saveToHistory, clearHistory, removeFromHistory, reload: loadHistory };
};
