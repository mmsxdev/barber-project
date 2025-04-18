import commissionService from '../services/commissionService.js';

export const getMonthlyReport = async (req, res) => {
  try {
    const { barberId, month, year } = req.query;

    // Validar parâmetros obrigatórios
    if (!barberId || !month || !year) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios não fornecidos: barberId, month, year'
      });
    }

    // Converter parâmetros para números
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    // Validar valores numéricos
    if (isNaN(parsedMonth) || isNaN(parsedYear)) {
      return res.status(400).json({
        error: 'Mês e ano devem ser valores numéricos'
      });
    }

    // Validar intervalo do mês
    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        error: 'Mês deve estar entre 1 e 12'
      });
    }

    // Calcular relatório
    const report = await commissionService.calculateMonthlyCommission(barberId, parsedMonth, parsedYear);

    return res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório de comissões:', error);
    return res.status(500).json({
      error: 'Erro ao gerar relatório de comissões'
    });
  }
}; 