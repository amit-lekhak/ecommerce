const User = require("../models/user");
const jwt = require("jsonwebtoken"); // generate signed token with secret
const expressJwt = require("express-jwt"); // authenticate with token
const { errorHandler } = require("./helpers/dbErrorHandler");

exports.signup = function (req, res) {
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }

    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      user,
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email doesn't exist. Please signup.",
      });
    }

    //if user is found make sure email and password match
    //authenticate model in User model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password don't match.",
      });
    }

    //generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    //persist token as 't' in cookie with expiry time
    res.cookie("t", token, { expire: new Date() + 9999 });

    //return response with user and token to front-end client
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, email, name, role },
    });
  });
};


exports.signout = (req,res) => {
  res.clearCookie("t");
  res.json({message: "Signout success"});
}