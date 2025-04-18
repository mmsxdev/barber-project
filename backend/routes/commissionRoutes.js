import express from 'express';
import { getMonthlyReport } from '../controllers/commissionController.js';

const router = express.Router();

// Rota para obter relatório mensal de comissões
router.get('/monthly-report', getMonthlyReport);

export default router; 