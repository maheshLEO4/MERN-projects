if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

// Middleware
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended:false}))

// Database connection
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to Mongoose"))
    .catch((error) => console.error("MongoDB Connection Error:", error));

// Routes
app.use('/', indexRouter);
app.use('/authors', authorRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
