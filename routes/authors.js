const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// all authors
router.get('/', async (req, res) => {
    try{
     const authors = await Author.find({})
     res.render("authors/index", {authors: authors})
    }catch{
    res.redirect('/')
   }
})

// new Author Route
    router.get('/new', async (req, res) => {
    res.render("authors/new", { author: new Author() })
})


// Create author route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })

  try {
    // Save the new author
    const newAuthor = await author.save()
    res.redirect('authors') // Corrected typo here from `redircet` to `redirect`
  } catch (err) {
    // Handle error and re-render form with error message
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

module.exports = router
