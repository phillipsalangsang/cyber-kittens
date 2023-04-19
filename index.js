require ("dotenv").config();
const express = require('express');
const app = express();
const { User, kitten } = require('./db');
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send(`
      <h1>Welcome to Cyber Kittens!</h1>
      <p>Cats are available at <a href="/kittens/1">/kittens/:id</a></p>
      <p>Create a new cat at <b><code>POST /kittens</code></b> and delete one at <b><code>DELETE /kittens/:id</code></b></p>
      <p>Log in via POST /login or register via POST /register</p>
    `);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware
app.use((req, res, next) => {
  const header = req.get("Authorization")

    if (!header) {
      console.error("Missing Authorization header.");
      res.set("WWW-Authenticate", "Bearer");
      res.sendStatus(401);
      return;
    }

    const [type, token] = header.split (" ");

    if (type.toLowerCase() !== "bearer" || !token) {
      console.error("Invalid Token");
      res.sendStatus(401);
      return;
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
    } catch (err){
      console.error(err);
      res.sendStatus(401);
    }
});

app.get("/hello", (req, res) => {
  res.send("<h1>Hello</h1>");
});

// POST /register
// OPTIONAL - takes req.body of {username, password} and creates a new user with the hashed password

// POST /login
// OPTIONAL - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

// GET /kittens/:id
// TODO - takes an id and returns the cat with that id
app.get("/kittens/:id", async (req, res, next) => {
  try {
      const kitten = await kitten.findByPk(req.params.id);

      if (!kitten) {
        res.sendStatus(404);
        return;
      }
      
      if (kitten.ownerId !== req.user.id) {
        res.sendStatus(403);
        return;
      }

      res.send({
        name: kitten.name,
        age: kitten.age,
        color: kitten.color,
      });
  } catch (err) {
    next(err);
  }

  });

// POST /kittens
// TODO - takes req.body of {name, age, color} and creates a new cat with the given name, age, and color

// DELETE /kittens/:id
// TODO - takes an id and deletes the cat with that id

// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
