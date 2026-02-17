import { supabase } from '../config/supabase.js';
import openaiService from '../services/openaiService.js';

/**
 * Controller to handle AI-powered wallpaper recommendations.
 */
export const getRecommendations = async (req, res) => {
    const { answers } = req.body;

    try {
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ message: 'Questionnaire answers are required' });
        }

        // 1. Get Dynamic AI Analysis from OpenAI
        console.log("Stenna AI: Analyzing preferences with OpenAI...");
        const aiAnalysis = await openaiService.recommendWallpaper(answers);
        const { tags, summary, category, description } = aiAnalysis;

        console.log("Stenna AI Calculated Vibe:", { tags, summary, category });

        // 3. Query the database for matching wallpapers
        let query = supabase.from('wallpapers').select(`
            *,
            images:wallpaper_images(*),
            categories:wallpaper_categories!inner(category:categories(*))
        `);

        // Apply filters
        // Priority 1: Filter by category if AI suggested one
        if (category) {
            query = query.ilike('wallpaper_categories.category.name', `%${category}%`);
        }

        // Priority 2: Use tags for keyword matching
        if (tags && tags.length > 0) {
            const filterParts = tags.map(tag =>
                `name.ilike.%${tag}%,description.ilike.%${tag}%,design_code.ilike.%${tag}%`
            );
            query = query.or(filterParts.join(','));
        }

        const { data: products, error } = await query.limit(6);

        if (error) throw error;

        res.status(200).json({
            summary: summary,
            description: description || '',
            tags: tags,
            recommendations: products
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error);
        res.status(500).json({ message: error.message });
    }
};
