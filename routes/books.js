const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/books')
const { render } = require('ejs')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']


//all books route

router.get('/', async (req,res)=>{
   try {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query= query.regex('title', new RegExp(req.query.title, 'i'))
    }

    if(req.query.publishBefore != null && req.query.publishBefore != ''){
        query= query.lte('publishDate',req.query.publishBefore)
    }

    if(req.query.publishAfter != null && req.query.publishAfter != ''){
        query= query.gte('publishDate',req.query.publishAfter)
    } 

    const books =  await query.exec()
    res.render('books/index',{
        books: books,
        searchOption: req.query
    })
   } catch (error){
    
    res.redirect('/')
   }
})

//new book route
router.get('/new', async (req,res) => {
    renderNewPage(res, new Book())
})

//creating book route
router.post('/', async(req,res) => {
   const book = new Book({
    title: req.body.title,
    author: req.body.author,
    createdAt: new Date(),
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
   })

   saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch (error){
        console.log(error);
        renderNewPage(res, book, true)
    }
})
 
async function renderNewPage(res, book, hasError=false){
     
   try {
    const authors = await Author.find({})
    const params =  {
        authors: authors,
        book: book,
     }
     if(hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new',params)
  } catch {
   res.redirect('/books')
  }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router