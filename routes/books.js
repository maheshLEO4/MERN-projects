const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']; // Fixed typo in 'images/gif' -> 'image/gif'

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title.trim() !== '') {
    query = query.regex('title', new RegExp(req.query.title.trim(), 'i'));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore.trim() !== '') {
    query = query.lte('publishDate', req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter.trim() !== '') {
    query = query.gte('publishDate', req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render('books/index', {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    res.redirect('/');
  }
});

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    renderNewPage(res, book, true);
  }
});

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec();
    res.render('books/show', { book: book });
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    res.redirect('/');
  }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    res.redirect('/');
  }
});

// Update Book Route
router.put('/:id', async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;

    if (req.body.cover != null && req.body.cover.trim() !== '') {
      saveCover(book, req.body.cover);
    }

    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      res.redirect('/');
    }
  }
});

// Delete Book Route
router.delete('/:id', async (req, res) => {
  try {
    // Use findByIdAndDelete to delete the book by ID
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    res.render('books/show', {
      book: null,
      errorMessage: 'Could not remove book',
    });
  }
});


// Render New Book Page
async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError);
}

// Render Edit Book Page
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError);
}

// Common Function for Rendering Form Pages
async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      params.errorMessage = form === 'edit' ? 'Error Updating Book' : 'Error Creating Book';
    }
    res.render(`books/${form}`, params);
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    res.redirect('/books');
  }
}

// Save Cover Image
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;

  try {
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64');
      book.coverImageType = cover.type;
    }
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
  }
}

module.exports = router;
