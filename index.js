
const dotenv = require('dotenv');
dotenv.config();

const db = require('./config/db');
const express = require('express');
const cors = require('cors');

// Carrega os relacionamentos do banco
require('./models');

const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const categoryRouter = require('./category/category.router');
const authorRouter = require('./author/author.router');
const bookRouter = require('./book/book.router');
const readerRouter = require('./reader/reader.router');
const loanRouter = require('./loan/loan.router');
const app = express();
const PORT = process.env.PORT || 3000;
const reportsRouter = require('./reports/reports.router');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);
app.use('/v1/categories', categoryRouter);
app.use('/v1/authors', authorRouter);
app.use('/v1/books', bookRouter);
app.use('/v1/readers', readerRouter);
app.use('/v1/loans', loanRouter);
app.use('/v1/reports', reportsRouter);

db.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Erro ao conectar ao banco:', error);
});
