const express = require("express");
bodyParser = require("body-parser");
uuid = require("uuid");

const { check, validationResult } = require("express-validator");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(
  process.env.CONNECTION_URI || "mongodb://localhost:27017/superFlixDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Logging middleware
app.use(morgan("common"));

// For the sending of static files
app.use(express.static("public"));
app.use(bodyParser.json());

const cors = require("cors");
let allowedOrigins = [
  "https://superflixheroes.netlify.app",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://movie-api-k8molony.vercel.app",
  "https://k8molony.github.io",
  "https://github.com/k8molony",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application does not allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// Adding Passport authentication
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

/**
 * GET welcome page, which contains a welcome message and a link to documentation from '/' endpoint
 * @name welcomePage
 * @kind function
 * @returns Welcome page
 */
app.get("/", (_req, res) => {
  res.send("<h1>Welcome to SuperFlix!</h1>");
});

/**
 * READ: get full movie list
 * Request body: None
 * @name getAllMovies
 * @kind function
 * @returns A JSON object holding data of all the movies
 * @requires passport
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * READ: get a list of all users
 * Request body: None
 * @name getAllUsers
 * @kind function
 * @returns A JSON object holding data of all the users
 * @requires passport
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * READ: get data of a single user
 * Request body: None
 * @name getUser
 * @kind function
 * @param {string} username
 * @returns A JSON object holding data of the particular user
 * @requires passport
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * READ: get data of a single movie
 * Request body: None
 * @name getSingleMovie
 * @kind function
 * @param {string} title The title of the movie
 * @returns A JSON object holding data about a single movie, including
 * title, description, series, and director
 * @requires passport
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * READ: get data about a series by name
 * Request body: none
 * @name getSeries
 * @kind function
 * @returns A JSON object holding data about a single series,
 * including name and description
 * @requires passport
 */
app.get(
  "/movies/series/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Series.Name": req.params.Name })
      .then((series) => {
        res.json(series);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * READ: get data about a director by name
 * Request body: None
 * @name getDirector
 * @kind function
 * @returns A JSON object hodling data about a single director,
 * including name, biography, birthday, and death if applicable
 * @requires passport
 */
app.get(
  "/movies/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Director.Name": req.params.Name })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * POST: register a new user
 * Request body: A JSON object holding data about the new user,
 * including username, password, email, and birthday
 * @name registerUser
 * @kind function
 * @returns A JSON object holding data of the user
 * @requires passport
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required, min 6 characters").isLength({
      min: 6,
    }),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * PUT: update a user's new info
 * Request body: A JSON object holding data about the updated user information
 * @name updatedUser
 * @kind function
 * @param {string} username
 * @returns A JSON object holding updated user data
 * @requires passport
 */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    // check('Password', 'Password is required, min 6 characters').isLength({ min: 6 }),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          // Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * POST: Add a movie to the user's list of favorites
 * Request body: None
 * @name addFavoriteMovie
 * @kind function
 * @param {string} username
 * @param {string} movieid
 * @returns A JSON object holding the updated user data
 * @requires passport
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE: Delete a movie from a user's list of favorites
 * Request body: None
 * @name removeFavoriteMovie
 * @kind function
 * @param {string} username
 * @param {string} movieid
 * @returns A JSON object holding the updated user data
 * @requires passport
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE: Delete a user's data
 * Request body: None
 * @name deleteUser
 * @kind function
 * @param {string} username
 * @returns A text message indicating that the user's data has been removed
 * @requires passport
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Error handler
 * @name errorHandler
 * @kind function
 */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/**
 * Request listener
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("SuperFlix is listening on Port " + port);
});
module.exports = app;
