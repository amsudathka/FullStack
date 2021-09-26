if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');




app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
//Handle input element 
app.use(express.urlencoded({ extended: true, inflate: '10mb' }))

//Connection to mongoose DB
const mongoose = require('mongoose');
const { parse } = require('dotenv');
mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true
    //useNewUrlParse: true //error
});

const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));


// '/' = home directory 
app.use('/', indexRouter);
app.use('/authors', authorRouter);


app.listen(process.env.PORT || 3000);
