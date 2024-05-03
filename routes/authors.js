const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/books");
const { render } = require("ejs");

//all authors route

router.get("/", async (req, res) => {
  let searchOption = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOption.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("authors/index", {
      authors: authors,
      searchOption: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

//new authors route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

//creating authors route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    res.redirect(`/authors/${newAuthor.id}`)
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "error creating author",
    });
  }
});

//show author
router.get("/:id", async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author:author.id}).limit(6).exec()
        res.render('authors/show',{
            author:author,
            booksAuthor: books
        })
    } catch{
        res.redirect('/')
    }
});

//edit author
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});

//update author
router.put("/:id", async (req, res) => {
    let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
        res.redirect('/auhtors')
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "error updating author",
      });
    }
  }
});

// delete Author wich is not associated with any book
router.delete("/:id", async (req, res) => {
    try {
      await Author.deleteOne({_id: req.params.id});
      res.redirect(`/authors`);
    } catch{
    res.redirect(`/authors/${req.params.id}`)
    }
});


module.exports = router;
