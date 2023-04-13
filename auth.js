const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport");

/**
 * Creates JWT (expiring in 7 days, using HS256 algorithm to encode)
 * @param {object} user
 * @returns user object, jwt, and additional info on token
 * @function generateJWTToken
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/**
 * Handles user login, generating a JWT upon login
 * Request body: A JSON object holding Username and Password
 * @name postLogin
 * @kind function
 * @param {*} router
 * @returns A JSON object holding the user object and JWT
 * @requires passport
 */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, _info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
