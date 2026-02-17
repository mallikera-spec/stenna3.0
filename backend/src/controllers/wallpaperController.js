import { supabase } from '../config/supabase.js';

export const getAllWallpapers = async (req, res) => {
    try {
        const { group_id, category_id, search, activeOnly, tag } = req.query;

        // Base query - remove !inner to allow wallpapers without categories/groups to appear
        let query = supabase.from('wallpapers').select(`
            *,
            images:wallpaper_images(*),
            categories:wallpaper_categories(category:categories(*)),
            groups:wallpaper_groups(group:category_groups(*))
        `);

        if (activeOnly === 'true') {
            query = query.eq('is_active', true);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,design_code.ilike.%${search}%`);
        }

        // Apply filters - if filtering by ID, we might need a separate query or different structure
        // because standard Supabase JS client filtering on nested relations can be tricky without !inner.
        // However, for the general case, we want wallpapers even if they have no category.
        if (category_id) {
            const ids = category_id.split(',');
            // If we filter, we re-apply the query with !inner just for that specific call
            // OR we fetch all and filter in JS (simpler for small-medium datasets)
            // Let's use the .filter approach or re-init the query
            query = supabase.from('wallpapers').select(`
                *,
                images:wallpaper_images(*),
                categories:wallpaper_categories!inner(category:categories(*)),
                groups:wallpaper_groups(group:category_groups(*))
            `).in('wallpaper_categories.category_id', ids);

            if (activeOnly === 'true') query = query.eq('is_active', true);
            if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,design_code.ilike.%${search}%`);
        }

        if (group_id) {
            const ids = group_id.split(',');
            // If category_id was already present, we need to handle both
            const currentSelect = category_id ?
                '*, images:wallpaper_images(*), categories:wallpaper_categories!inner(category:categories(*)), groups:wallpaper_groups!inner(group:category_groups(*))' :
                '*, images:wallpaper_images(*), categories:wallpaper_categories(category:categories(*)), groups:wallpaper_groups!inner(group:category_groups(*))';

            query = supabase.from('wallpapers').select(currentSelect).in('wallpaper_groups.group_id', ids);

            if (activeOnly === 'true') query = query.eq('is_active', true);
            if (category_id) query = query.in('wallpaper_categories.category_id', category_id.split(','));
            if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,design_code.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Flatten nested relations for the response
        let formattedData = data.map(w => ({
            ...w,
            categories: w.categories.map(c => c.category),
            groups: w.groups.map(g => g.group),
            images: w.images.sort((a, b) => a.position - b.position)
        }));

        // Handle tags (trending/new)
        if (tag === 'trending') {
            formattedData = formattedData.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
        } else if (tag === 'new_arrival') {
            formattedData = formattedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
        }

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWallpaperBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const { data, error } = await supabase.from('wallpapers').select(`
            *,
            images:wallpaper_images(*),
            categories:wallpaper_categories(category:categories(*)),
            groups:wallpaper_groups(group:category_groups(*))
        `).eq('slug', slug).single();

        if (error) throw error;

        const formatted = {
            ...data,
            categories: data.categories.map(c => c.category),
            groups: data.groups.map(g => g.group),
            images: data.images.sort((a, b) => a.position - b.position)
        };

        res.status(200).json(formatted);
    } catch (error) {
        res.status(404).json({ message: 'Wallpaper not found' });
    }
};

export const createWallpaper = async (req, res) => {
    // Strip out non-column fields for the main table
    const { images, category_ids, group_ids, categories, groups, ...wallpaperData } = req.body;
    try {
        // 1. Create wallpaper entry
        const { data: wallpaper, error: wError } = await supabase
            .from('wallpapers')
            .insert(wallpaperData)
            .select()
            .single();

        if (wError) throw wError;

        // 2. Handle Images
        if (images && images.length > 0) {
            const imageInserts = images.map((url, index) => ({
                wallpaper_id: wallpaper.id,
                image_url: url,
                position: index + 1
            }));
            await supabase.from('wallpaper_images').insert(imageInserts);
        }

        // 3. Handle Categories
        if (category_ids && category_ids.length > 0) {
            const catInserts = category_ids.map(id => ({
                wallpaper_id: wallpaper.id,
                category_id: id
            }));
            await supabase.from('wallpaper_categories').insert(catInserts);
        }

        // 4. Handle Groups
        if (group_ids && group_ids.length > 0) {
            const groupInserts = group_ids.map(id => ({
                wallpaper_id: wallpaper.id,
                group_id: id
            }));
            await supabase.from('wallpaper_groups').insert(groupInserts);
        }

        res.status(201).json({ message: 'Wallpaper created successfully', id: wallpaper.id });
    } catch (error) {
        console.error('Create Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateWallpaper = async (req, res) => {
    const { id } = req.params;
    // Strip out non-column fields for the main table
    const { images, category_ids, group_ids, categories, groups, ...wallpaperData } = req.body;
    try {
        // 1. Update basic info
        const { error: wError } = await supabase.from('wallpapers').update(wallpaperData).eq('id', id);
        if (wError) throw wError;

        // 2. Sync Images
        if (images) {
            await supabase.from('wallpaper_images').delete().eq('wallpaper_id', id);
            const imageInserts = images.map((url, index) => ({
                wallpaper_id: id,
                image_url: url,
                position: index + 1
            }));
            await supabase.from('wallpaper_images').insert(imageInserts);
        }

        // 3. Sync Categories
        if (category_ids) {
            await supabase.from('wallpaper_categories').delete().eq('wallpaper_id', id);
            const catInserts = category_ids.map(cid => ({
                wallpaper_id: id,
                category_id: cid
            }));
            await supabase.from('wallpaper_categories').insert(catInserts);
        }

        // 4. Sync Groups
        if (group_ids) {
            await supabase.from('wallpaper_groups').delete().eq('wallpaper_id', id);
            const groupInserts = group_ids.map(gid => ({
                wallpaper_id: id,
                group_id: gid
            }));
            await supabase.from('wallpaper_groups').insert(groupInserts);
        }

        res.status(200).json({ message: 'Wallpaper updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteWallpaper = async (req, res) => {
    const { id } = req.params;
    try {
        // Cascade delete should handle wallpaper_images and wallpaper_categories automatically due to schema
        const { error } = await supabase.from('wallpapers').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Wallpaper deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        const { data, error } = await supabase.from('wallpapers').update({ is_active }).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Status updated successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
