const express = require('express');
const router = express.Router();
const { getMonthlyReport } = require('../controllers/commissionController');

// Rota para obter relatório mensal de comissões
router.get('/monthly-report', getMonthlyReport);

module.exports = router; 