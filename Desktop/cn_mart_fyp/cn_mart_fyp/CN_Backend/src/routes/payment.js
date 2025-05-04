const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const { authenticateUser } = require('../middleware/auth');

router.post('/khalti/init', authenticateUser, paymentController.initializeKhaltiPayment);
router.post('/khalti/verify', authenticateUser, paymentController.verifyKhaltiPayment);
router.post('/esewa/init', authenticateUser, paymentController.initializeEsewaPayment);
router.post('/esewa/verify', authenticateUser, paymentController.verifyEsewaPayment);

module.exports = router; 