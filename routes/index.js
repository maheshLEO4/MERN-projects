const express = require('express')
const router = express.Router()


//all authors
router.get('/', (req, res)=>{
res.render("index")
})

module.exports = router