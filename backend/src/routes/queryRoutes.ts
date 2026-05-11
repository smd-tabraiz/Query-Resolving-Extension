import { Router } from 'express';
import { captureQuery, getHistory, getAnalytics, getGlobalAnalytics, shareQuery, getGlobalHistory, getInterestClusters, getUserAnalytics, getSearchTrends, deleteQuery } from '../controllers/queryController';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/capture', authenticateJWT, captureQuery);
router.get('/history', authenticateJWT, getHistory);
router.get('/analytics', authenticateJWT, getAnalytics);
router.get('/global-analytics', authenticateJWT, authorizeAdmin, getGlobalAnalytics);
router.get('/global-history', authenticateJWT, authorizeAdmin, getGlobalHistory);
router.get('/clusters', authenticateJWT, authorizeAdmin, getInterestClusters);
router.get('/user-analytics/:userId', authenticateJWT, authorizeAdmin, getUserAnalytics);
router.get('/trends', authenticateJWT, authorizeAdmin, getSearchTrends);
router.delete('/:id', authenticateJWT, deleteQuery);
router.post('/share-query', authenticateJWT, authorizeAdmin, upload.array('files'), shareQuery);

export default router;
