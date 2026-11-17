const { Op } = require('sequelize');
const db = require('../config/db');

const {
    Loan,
    Book,
    Reader,
    User,
    Category,
    Author
} = require('../models');

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

const addDays = (dateString, days) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

const calculateLateDays = (dueDate, returnDate) => {
    const due = new Date(`${dueDate}T00:00:00Z`);
    const returned = new Date(`${returnDate}T00:00:00Z`);

    return Math.max(
        0,
        Math.floor((returned - due) / 86400000)
    );
};

const updateOverdueStatuses = async () => {
    const today = getToday();

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
};

const loanIncludes = () => [
    {
        model: Book,
        include: [
            { model: Category },
            {
                model: Author,
                through: { attributes: [] }
            }
        ]
    },
    { model: Reader },
    {
        model: User,
        attributes: ['id', 'name', 'email']
    }
];

const loanService = {
    create: async (data, userId) => {
        const bookId = Number(data.bookId);
        const readerId = Number(data.readerId);

        if (!Number.isInteger(bookId) || bookId <= 0 ||
            !Number.isInteger(readerId) || readerId <= 0) {
            throw new Error('Invalid book or reader ID');
        }

        await updateOverdueStatuses();

        return await db.transaction(async (transaction) => {
            const book = await Book.findByPk(bookId, { transaction });
            const reader = await Reader.findByPk(readerId, { transaction });
            const user = await User.findByPk(userId, { transaction });

            if (!book) throw new Error('Book not found');
            if (!reader) throw new Error('Reader not found');
            if (!user) throw new Error('User not found');

            if (book.availableCopies <= 0) {
                throw new Error('No copies available');
            }

            const activeLoans = await Loan.findAll({
                where: {
                    readerId,
                    returnDate: null
                },
                transaction
            });

            const hasOverdue = activeLoans.some(
                loan => loan.status === 'ATRASADO' ||
                    loan.dueDate < getToday()
            );

            if (hasOverdue) {
                throw new Error(
                    'Reader has overdue loans and cannot borrow another book'
                );
            }

            if (activeLoans.length >= 3) {
                throw new Error(
                    'Reader cannot have more than 3 active loans'
                );
            }

            const today = getToday();

            const loan = await Loan.create({
                loanDate: today,
                dueDate: addDays(today, 7),
                returnDate: null,
                status: 'ATIVO',
                fine: 0,
                bookId,
                readerId,
                userId
            }, { transaction });

            await book.update({
                availableCopies: book.availableCopies - 1
            }, { transaction });

            return await Loan.findByPk(loan.id, {
                include: loanIncludes(),
                transaction
            });
        });
    },

    findAll: async (filters = {}) => {
        await updateOverdueStatuses();

        const where = {};
        const allowedStatuses = [
            'ATIVO',
            'ATRASADO',
            'DEVOLVIDO'
        ];

        if (filters.status) {
            if (!allowedStatuses.includes(filters.status)) {
                throw new Error('Invalid loan status');
            }

            where.status = filters.status;
        }

        return await Loan.findAll({
            where,
            include: loanIncludes(),
            order: [['loanDate', 'DESC']]
        });
    },

    findById: async (id) => {
        await updateOverdueStatuses();

        return await Loan.findByPk(id, {
            include: loanIncludes()
        });
    },

    findByReaderId: async (readerId) => {
        await updateOverdueStatuses();

        const reader = await Reader.findByPk(readerId);

        if (!reader) {
            return null;
        }

        return await Loan.findAll({
            where: { readerId },
            include: loanIncludes(),
            order: [['loanDate', 'DESC']]
        });
    },

    returnLoan: async (id) => {
        await updateOverdueStatuses();

        return await db.transaction(async (transaction) => {
            const loan = await Loan.findByPk(id, { transaction });

            if (!loan) {
                return null;
            }

            if (loan.returnDate) {
                throw new Error('This loan has already been returned');
            }

            const book = await Book.findByPk(loan.bookId, {
                transaction
            });

            if (!book) {
                throw new Error('Book not found');
            }

            const today = getToday();

            const lateDays = calculateLateDays(
                loan.dueDate,
                today
            );

            const fine = lateDays * 1.00;

            if (book.availableCopies >= book.totalCopies) {
                throw new Error('Book inventory is inconsistent');
            }

            await loan.update({
                returnDate: today,
                status: 'DEVOLVIDO',
                fine
            }, { transaction });

            await book.update({
                availableCopies: book.availableCopies + 1
            }, { transaction });

            return await Loan.findByPk(id, {
                include: loanIncludes(),
                transaction
            });
        });
    }
};

module.exports = loanService; 