require('dotenv').config()
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const mysql = require("mysql");
const cors = require('cors');
const request = require('request');
const qs = require('querystring');

const API_URI = "/api";
const app = express();
app.use(cors({}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT
})

var makeQuery = (sql, pool)=>{
    console.log(sql);

    return  (args)=>{
        let queryPromsie = new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log(args);

                connection.query(sql, args || [], (err, results)=>{
                    connection.release();
                    if(err){
                        reject(err);
                        return;
                    }
                    console.log(">>> "+ results);
                    resolve(results);
                })
            });
        });
        return queryPromsie;
    }
}

// SQL Queries
const sqlFindAllBooksSimple = "SELECT * FROM books";
const sqlFindAllBooks = "SELECT cover_thumbnail, title, author_lastname, author_firstname FROM books WHERE (title LIKE ?) || (author_lastname LIKE ?) || (author_firstname LIKE ?) ORDER BY title LIMIT ? OFFSET ? ";
const sqlFindAllBooksTitleDesc = "SELECT cover_thumbnail, title, author_lastname, author_firstname FROM books WHERE (title LIKE ?) || (author_lastname LIKE ?) || (author_firstname LIKE ?) ORDER BY title DESC LIMIT ? OFFSET ? ";
const sqlFindAllBooksName = "SELECT cover_thumbnail, title, author_lastname, author_firstname FROM books WHERE (title LIKE ?) || (author_lastname LIKE ?) || (author_firstname LIKE ?) ORDER BY author_lastname LIMIT ? OFFSET ? ";
const sqlFindAllBooksNameDesc = "SELECT cover_thumbnail, title, author_lastname, author_firstname FROM books WHERE (title LIKE ?) || (author_lastname LIKE ?) || (author_firstname LIKE ?) ORDER BY author_lastname DESC LIMIT ? OFFSET ? ";
const sqlFindBook = "SELECT * FROM books WHERE id=? ";

var findBookById = makeQuery(sqlFindBook, pool);
var findAllBooks = makeQuery(sqlFindAllBooks, pool);
var findAllBooksTitleDesc = makeQuery(sqlFindAllBooksTitleDesc, pool);
var findAllBooksName = makeQuery(sqlFindAllBooksName, pool);
var findAllBooksNameDesc = makeQuery(sqlFindAllBooksNameDesc, pool);

//Step 3: Define routes

// Books (One book only) by params
app.get(API_URI +  "/books/:bookId", (req, res)=>{
    let bookId = req.params.bookId;
    findBookById([parseInt(bookId)]).then((results)=>{
         console.log(results);
         res.json(results);
    }).catch((error)=>{
         res.status(500).json(error);
    })
})

// Books by Query (Multiple)
app.get(API_URI + "/books", (req, res)=>{
    var keyword = req.query.keyword;
    keyword = '%' + keyword + '%';

    let qSort = req.query.sort;
    if(typeof(qSort) === 'undefined' ){
        qSort = 'default';
    }

    //default limit to 10
    let qLimit = req.query.limit;
    if(typeof(qLimit) === 'undefined' ){
        qLimit = '10';
    }
    qLimit = parseInt(qLimit);

    // default offset to 0
    let qOffset = req.query.offset;
    if(typeof(qOffset) === 'undefined' ){
        qOffset = '0';
    }
    qOffset = parseInt(qOffset);

    let qAuthor = req.query.author;
    let bAuthor = true;
    if(typeof(qAuthor) === 'undefined' ){
        qAuthor = '@';
        bAuthor = false;
    } else {
        qAuthor = '%' + req.query.author + '%';
    }

    let qTitle = req.query.title;
    let bTitle = true;
    if(typeof(qTitle) === 'undefined' ){
        qTitle = '@';
        bTitle = false;
    } else {
        qTitle = '%' + req.query.title + '%';
    }

    let finalCriteriaFromType = []
    if (bTitle & bAuthor) {
        finalCriteriaFromType = [qTitle, qAuthor, qAuthor, qLimit, qOffset];
    } else if (bTitle) {
        finalCriteriaFromType = [qTitle, '@', '@', qLimit, qOffset]
    } else if (bAuthor) {
        finalCriteriaFromType = ['@', qAuthor, qAuthor, qLimit, qOffset]
    } else {
        finalCriteriaFromType = ['%', '%' , '%', qLimit, qOffset];
    }

    if (qSort == 'name_asc') {
        findAllBooksName(finalCriteriaFromType)
        .then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    } else if (qSort == 'name_desc') {
        findAllBooksNameDesc(finalCriteriaFromType)
        .then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });

    } else if (qSort == 'title_desc') {
        findAllBooksTitleDesc(finalCriteriaFromType)
        .then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    } else {
        findAllBooks(finalCriteriaFromType)
        .then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }
})

//Serves from public and images
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

app.use((req, resp) => {
    resp.status(404);
    resp.sendFile(path.join(__dirname, 'public', '404.html'));
});

//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});