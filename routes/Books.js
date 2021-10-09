const express = require('express');
const router = express.Router();

const Book = require('../models/book');
const Author=require('../models/author');
//File upload 
const multer =require('multer');
const path=require('path');
const uploadPath=path.join('public', Book.coverImageBasePath);
const imageMimeType=['image/Jpeg', 'image/png','image/gif'];
const fileStorageEngine=multer.diskStorage({
    fileFilter:(req, file,callback)=>{
        callback(null,imageMimeType.includes(file.mimetype))
    },
    destination:(req, res,callback)=>{
        callback(null,uploadPath);
    },
    /*
    filename:(req, file,callback)=>{
        callback(null,file.originalname);
    },
    */

})
const upload=multer({
    storage:fileStorageEngine    
})
//if saving error then need to remove uploaded cover image
const fs= require('fs')


/* const upload=multer({
    dest:uploadPath,
    fileFilter:(req, file,callback)=>{
        callback(null,imageMimeType.includes(file.mimetype))
    }
})
 */


//All Books route
router.get('/', async (req, res) => {
    let query= Book.find()
    if (req.query.title!=null && req.query.title!=''){
        //'title' is title filed of Book schema
        //req.query.title is a serach condition from serach page /index.js
        query=query.regex('title', new RegExp(req.query.title,'i'))
    }
    if (req.query.publishedBefore!=null && req.query.publishedBefore!=''){
        //'title' is title filed of Book schema
        //req.query.title is a serach condition from serach page /index.js
        query=query.lte('publishDate', req.query.publishedBefore)
    }

    if (req.query.publishedAfter!=null && req.query.publishedAfter!=''){
        //'title' is title filed of Book schema
        //req.query.title is a serach condition from serach page /index.js
        query=query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books= await query.exec()
        res.render('books/index',{
            books:books,
            searchOption:req.query
        })            
    } catch {
        res.redirect('/')
    }
})

//New Books route or load existing Books
router.get('/new', async (req, res) => {
    renderNewPage(res,new Book())
})
//Post - Send Data to Server
//Create Book route 
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName=req.file.originalname != null ? req.file.originalname : null;    
/* 
    console.log(req.body.title);
    console.log(req.body.author);
    console.log(new Date(req.body.publishDate));
    console.log(req.body.pageCount);
    console.log(req.file);
    console.log(req.body.description);
     */


    const book = new Book({
        title:req.body.title,
        author:req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount:req.body.pageCount,
        coverImageName:fileName,
        description:req.body.description,
     

    });

    

    try {
        const newBook= await book.save()
        //res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch  {
        if(book.coverImageName!=null)  {removeBookCoverImage(book.coverImageName)}
        renderNewPage(res,book,true)

    }

})

async function renderNewPage(res, book, hasError=false){
    try {
        const authors = await Author.find({})
        const params={
            authors:authors,
            book:book
        }
        if(hasError) params.errorMessage='Error craeting Book'
        res.render('books/new',params)
    } catch {
        res.redirect('/books')
    }
}
//Remve uploaded cover image if there is an error
function removeBookCoverImage(fileName){
    fs.unlink(path.join(uploadPath,fileName), err=>{
        if(err) console.error(err);
    })
    }

module.exports = router;
