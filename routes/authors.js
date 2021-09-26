const express = require('express');
const router = express.Router();
const Author = require('../models/author');

//All authors route
router.get('/', async (req, res) => {
    let searchOption = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOption.name = new RegExp(req.query.name, 'i') // i -ignor case sensitive
    }
    try {
        const authors = await Author.find(searchOption)
        res.render('authors/index', {
            authors: authors,
            searchOption: req.query
        })
    } catch {
        res.redirect('/')
    }
})

//New Author route or load existing authors
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })

})
//Post - Send Data to Server
//Create Author route 
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newauthor = await author.save();
        //res.redirect(`author/${newAuthor.id}`)
        res.redirect('authors')
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }

    /*     author.save((err, newAuthor) => {
            if (err) {
                res.render('authors/new', {
                    author: author,
                    errorMessage: 'Error creating Author'
                })
            } else {
                //res.redirect(`author/${newAuthor.id}`)
                res.redirect('authors')
            }
        })
     */
})
module.exports = router;
