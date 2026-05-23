const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.get('/', requireAuth, getNotifications);
router.patch('/read-all', requireAuth, markAllAsRead);
router.patch('/:id/read', requireAuth, markAsRead);

module.exports = router;
