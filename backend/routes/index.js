const express = require('express');
const router = express.Router();
const commissionRoutes = require('./commissionRoutes');

// Rotas de comissões
router.use('/commissions', commissionRoutes);

module.exports = router; 