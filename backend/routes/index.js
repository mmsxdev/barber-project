import express from 'express';
import commissionRoutes from './commissionRoutes.js';

const router = express.Router();

// Rotas de comissões
router.use('/commissions', commissionRoutes);

export default router; 