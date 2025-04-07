import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
  host: "database-quotes.ctt0icgkikvx.us-west-1.rds.amazonaws.com",
  user: "admin",
  password: "quotesdb9876",
  database: "quotesdb",
  connectionLimit: 10,
  waitForConnections: true
});
const conn = await pool.getConnection();

//routes
app.post("/author/new", async function(req, res){
  let fName = req.body.fName;
  let lName = req.body.lName;
  let birthDate = req.body.birthDate;
  let deathDate = req.body.deathDate;
  let sex = req.body.sex;
  let profession = req.body.profession;
  let birthPlace = req.body.birthPlace;
  let portrait = req.body.portrait;
  let bio = req.body.bio;
  //console.log(req.body);
  let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let params = [fName, lName, birthDate, deathDate, sex, profession, birthPlace, portrait, bio];
  const [rows] = await conn.query(sql, params);
  res.render("newAuthor",
      {"message": "Author added!"});
});

app.post("/quote/new", async function(req, res){
  let authorId = req.body.authorId;
  let category = req.body.category;
  let likes = req.body.likes;
  let quote = req.body.quote;
  //console.log(req.body);
  let sql = `INSERT INTO q_quotes
             (quote, authorId, category, likes)
             VALUES (?, ?, ?, ?)`;
  let params = [quote, authorId, category, likes];
  const [rows] = await conn.query(sql, params);

  let sql2 = `SELECT authorId, firstName, lastName
                    FROM q_authors
                    ORDER BY lastName`;
  const [rows2] = await conn.query(sql2);
  let sql3 = `SELECT DISTINCT category
                    FROM q_quotes
                    ORDER BY category`;
  const [rows3] = await conn.query(sql3);
  res.render("newQuote", {"authors":rows2, "categories":rows3, "message": "Quote added!"});
});

app.get("/authors", async function(req, res){
  let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
  const [rows] = await conn.query(sql);
  res.render("authorList", {"authors":rows});
});

app.get("/quotes", async function(req, res){
  let sql = `SELECT *
            FROM q_quotes
            ORDER BY quote`;
  const [rows] = await conn.query(sql);
  res.render("quoteList", {"quotes":rows});
});

app.get("/author/edit", async function(req, res){
  let authorId = req.query.authorId;
  let sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId =  ${authorId}`;
  const [rows] = await conn.query(sql);
  res.render("editAuthor", {"authorInfo":rows});
});

app.get("/quote/edit", async function(req, res){
  let quoteId = req.query.quoteId;
  let sql = `SELECT *
        FROM q_quotes
        WHERE quoteId = ${quoteId}`;
  const [rows] = await conn.query(sql);

  let sql2 = `SELECT authorId, firstName, lastName
                    FROM q_authors
                    ORDER BY lastName`;
  const [rows2] = await conn.query(sql2);
  let sql3 = `SELECT DISTINCT category
                    FROM q_quotes
                    ORDER BY category`;
  const [rows3] = await conn.query(sql3);
  res.render("editQuote", {"quoteInfo":rows, "authors":rows2, "categories":rows3});
});

app.post("/author/edit", async function(req, res){
  let sql = `UPDATE q_authors
            SET firstName = ?,
                lastName = ?,
                dob = ?,
                dod = ?,
                sex = ?,
                profession = ?,
                country = ?,
                portrait = ?,
                biography = ?
            WHERE authorId =  ?`;
  let params = [req.body.fName,
    req.body.lName, req.body.dob, req.body.dod,
    req.body.sex, req.body.profession, req.body.country,
    req.body.portrait, req.body.bio, req.body.authorId];
  const [rows] = await conn.query(sql,params);
  res.redirect("/authors");
});

app.post("/quote/edit", async function(req, res){
  let sql = `UPDATE q_quotes
            SET quote = ?,
                authorId = ?,
                category = ?,
                likes = ?
            WHERE quoteId =  ?`;
  let params = [req.body.quote,
    req.body.authorId, req.body.category,
    req.body.likes, req.body.quoteId];
  const [rows] = await conn.query(sql,params);
  res.redirect("/quotes");
});

app.get("/author/delete", async function(req, res){
  let authorId  = req.query.authorId;
  let sql = `DELETE 
                    FROM q_authors
                    WHERE authorId  = ?`;
  const [rows] = await conn.query(sql, [authorId]);
  res.redirect("/authors");
})

app.get("/quote/delete", async function(req, res){
  let quoteId  = req.query.quoteId;
  let sql = `DELETE 
                    FROM q_quotes
                    WHERE quoteId  = ?`;
  const [rows] = await conn.query(sql, [quoteId]);
  res.redirect("/quotes");
})

app.get("/author/new", (req, res) => {
  res.render("newAuthor");
})

app.get("/quote/new", async (req, res) => {
  let sql = `SELECT authorId, firstName, lastName
                    FROM q_authors
                    ORDER BY lastName`;
  const [rows] = await conn.query(sql);
  let sql2 = `SELECT DISTINCT category
                    FROM q_quotes
                    ORDER BY category`;
  const [rows2] = await conn.query(sql2);
  res.render("newQuote", {"authors":rows, "categories":rows2});
})

app.get('/', (req, res) => {
  res.render('index', {})
});

app.get("/dbTest", async(req, res) => {
  let sql = "SELECT CURDATE()";
  const [rows] = await conn.query(sql);
  res.send(rows);
});//dbTest

app.listen(3002, ()=>{
  console.log("Express server running on port: " + 3002);
})