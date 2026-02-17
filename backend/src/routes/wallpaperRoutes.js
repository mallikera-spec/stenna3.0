import express from 'express';
import {
    getAllWallpapers,
    getWallpaperBySlug,
    createWallpaper,
    updateWallpaper,
    deleteWallpaper,
    toggleStatus
} from '../controllers/wallpaperController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllWallpapers);
router.get('/slug/:slug', getWallpaperBySlug);
router.post('/', verifyToken, isAdmin, createWallpaper);
router.put('/:id', verifyToken, isAdmin, updateWallpaper);
router.delete('/:id', verifyToken, isAdmin, deleteWallpaper);
router.patch('/:id/status', verifyToken, isAdmin, toggleStatus);

export default router;
