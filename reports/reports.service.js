const { Op } = require('sequelize');
const { Book, Loan } = require('../models');

const getToday = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

const reportsService = {
    dashboard: async () => {
        const today = getToday();

        // Atualiza empréstimos que passaram do vencimento
        await Loan.update(
            { status: 'ATRASADO' },
            {
                where: {
                    status: 'ATIVO',
                    returnDate: null,
                    dueDate: {
                        [Op.lt]: today
                    }
                }
            }
        );

        const [
            totalBooks,
            totalCopies,
            availableCopies,
            activeLoans,
            overdueLoans,
            totalFines
        ] = await Promise.all([
            Book.count(),

            Book.sum('totalCopies'),

            Book.sum('availableCopies'),

            Loan.count({
                where: {
                    status: 'ATIVO',
                    returnDate: null
                }
            }),

            Loan.count({
                where: {
                    status: 'ATRASADO',
                    returnDate: null
                }
            }),

            Loan.sum('fine')
        ]);

        return {
            totalBooks,
            totalCopies: Number(totalCopies || 0),
            availableCopies: Number(availableCopies || 0),
            activeLoans,
            overdueLoans,
            totalFines: Number(Number(totalFines || 0).toFixed(2))
        };
    }
};

module.exports = reportsService;