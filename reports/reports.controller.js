const reportsService = require('./reports.service');

const reportsController = {
    dashboard: async (req, res) => {
        try {
            const report = await reportsService.dashboard();

            res.json(report);
        } catch (error) {
            console.error('Erro no dashboard:', error);

            res.status(500).json({
                error: 'Error generating dashboard report'
            });
        }
    }
};

module.exports = reportsController;