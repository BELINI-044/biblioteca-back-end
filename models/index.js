const db = require('../config/db');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Book = require('../book/book.model');
const Reader = require('../reader/reader.model');
const User = require('../user/user.model');
const Loan = require('../loan/loan.model');

const BookAuthor = db.models.BookAuthor || db.define('BookAuthor', {});

// Categoria possui vários livros
Category.hasMany(Book, {
    foreignKey: 'categoryId',
    onDelete: 'RESTRICT'
});

Book.belongsTo(Category, {
    foreignKey: 'categoryId',
    onDelete: 'RESTRICT'
});

// Livro e autor: muitos para muitos
Book.belongsToMany(Author, {
    through: 'BookAuthors',
    foreignKey: 'bookId',
    otherKey: 'authorId'
});

Author.belongsToMany(Book, {
    through: 'BookAuthors',
    foreignKey: 'authorId',
    otherKey: 'bookId'
});

// Livro possui vários empréstimos
Book.hasMany(Loan, {
    foreignKey: 'bookId',
    onDelete: 'RESTRICT'
});

Loan.belongsTo(Book, {
    foreignKey: 'bookId',
    onDelete: 'RESTRICT'
});

// Leitor possui vários empréstimos
Reader.hasMany(Loan, {
    foreignKey: 'readerId',
    onDelete: 'RESTRICT'
});

Loan.belongsTo(Reader, {
    foreignKey: 'readerId',
    onDelete: 'RESTRICT'
});

// Usuário registra vários empréstimos
User.hasMany(Loan, {
    foreignKey: 'userId',
    onDelete: 'RESTRICT'
});

Loan.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'RESTRICT'
});

module.exports = {
    Category,
    Author,
    Book,
    Reader,
    User,
    Loan
};