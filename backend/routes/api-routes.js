import express from 'express';
import * as searchController from '../controllers/search-controller.js';

const router = express.Router();

// Web search endpoint
router.get('/search', searchController.searchWeb);

// Image search endpoint  
router.get('/images', searchController.searchImages);

// News search endpoint (with positive filtering)
router.get('/news', searchController.searchNews);

// Cache management endpoints
router.get('/cache/stats', searchController.getCacheStats);
router.delete('/cache', searchController.clearCache);

export default router;