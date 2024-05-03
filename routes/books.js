const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/books");
const { render } = require("ejs");
const { route } = require("./authors");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

//all books route

router.get("/", async (req, res) => {
  try {
    let query = Book.find();
    if (req.query.title != null && req.query.title != "") {
      query = query.regex("title", new RegExp(req.query.title, "i"));
    }

    if (req.query.publishBefore != null && req.query.publishBefore != "") {
      query = query.lte("publishDate", req.query.publishBefore);
    }

    if (req.query.publishAfter != null && req.query.publishAfter != "") {
      query = query.gte("publishDate", req.query.publishAfter);
    }

    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOption: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

//new book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//creating book route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    createdAt: new Date(),
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);
  try {
    const newBook = await book.save();
    res.redirect(`/books/${newBook.id}`)
   
  } catch (error) {
    // console.log(error);
    renderNewPage(res, book, true);
  }
});

//show the Author books
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", {
      book: book,
    });
  } catch {
    res.redirect("/");
  }
});

//Edit the book
router.get("/:id/edit", async (req, res) => {
    console.log("0.")
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

//Updating book route
router.put("/:id", async (req, res) => {
    let book
    console.log("0.")
    try {
        book = await Book.findById(req.params.id)
        book.title= req.body.title
        book.author= req.body.author
        book.publishDate= new Date(req.body.publishDate)
        book.pageCount= req.body.pageCount
        book.description= req.body.description

        if(req.body.cover != null && req.body.cover !==''){
            saveCover(book, req.body.cover)
        }
        
        await book.save()
        
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        console.log(error)
        if(book != null){
            renderEditPage(res, book, true)
        }else{
            res.redirect('/')
        }
    }
 
  });

  //deleting books
router.delete("/:id", async (req, res) => {
    try {
      await Book.deleteOne({_id: req.params.id});
      res.redirect(`/books`);
    } catch{
    res.redirect(`/books/${req.params.id}`)
    }
});



async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}
async function renderFormPage(res, book, form, hasError) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError){
        if(form==='edit') {params.errorMessage = "Error Updating Book";}
        else{params.errorMessage = "Error Creating Book";} 
    }
    res.render(`books/${form}`, params);
  } catch(error) {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
