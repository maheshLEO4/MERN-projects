const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// Utility function for error logging
const logError = (error) => console.error(`[ERROR]: ${error.message}`);

// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name.trim() !== '') {
    searchOptions.name = new RegExp(req.query.name.trim(), 'i');
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query,
    });
  } catch (error) {
    logError(error);
    res.redirect('/');
  }
});

// New Author Route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() });
});

// Create Author Route
router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    const author = new Author({ name: req.body.name });

    if (!errors.isEmpty()) {
      return res.status(400).render('authors/new', {
        author: author,
        errorMessage: errors.array().map((err) => err.msg).join(', '),
      });
    }

    try {
      const newAuthor = await author.save();
      res.redirect(`authors/${newAuthor.id}`);
    } catch (error) {
      logError(error);
      res.render('authors/new', {
        author: author,
        errorMessage: 'Error creating Author',
      });
    }
  }
);

// Show Author Route
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render('authors/show', {
      author: author,
      booksByAuthor: books,
    });
  } catch (error) {
    logError(error);
    res.redirect('/');
  }
});

// Edit Author Route
router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render('authors/edit', { author: author });
  } catch (error) {
    logError(error);
    res.redirect('/authors');
  }
});

// Update Author Route
router.put(
  '/:id',
  body('name').trim().notEmpty().withMessage('Name is required'),
  async (req, res) => {
    let author;
    const errors = validationResult(req);

    try {
      author = await Author.findById(req.params.id);

      if (!errors.isEmpty()) {
        return res.status(400).render('authors/edit', {
          author: author,
          errorMessage: errors.array().map((err) => err.msg).join(', '),
        });
      }

      author.name = req.body.name;
      await author.save();
      res.redirect(`/authors/${author.id}`);
    } catch (error) {
      logError(error);
      if (author == null) {
        res.redirect('/');
      } else {
        res.render('authors/edit', {
          author: author,
          errorMessage: 'Error updating Author',
        });
      }
    }
  }
);

// Delete Author Route
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author == null) throw new Error('Author not found');

    // Replace `remove()` with `findByIdAndDelete`
    await Author.findByIdAndDelete(req.params.id);
    res.redirect('/authors');
  } catch (error) {
    console.error(`[ERROR]: ${error.message}`);
    res.redirect(author == null ? '/' : `/authors/${req.params.id}`);
  }
});


module.exports = router;
