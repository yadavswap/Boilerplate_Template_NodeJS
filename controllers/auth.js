const User = require("../models/user");
const UserGroup = require("../models/user_group");

const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()[0].msg,
    });
  }
  const user = new User(req.body);


  const accessToken = jwt.sign({ userId: user._id }, process.env.SECRET, {
    expiresIn: "1d"
   });
   user.accessToken = accessToken;
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "Not able to save user in dB",
      });
    }
    // res.json(
    //   {
    //   name: user.name,
    //   email: user.email,
    //   id: user._id,
    // });
    return res.status(200).json({
      message: 'User Created Successfully',
      accessToken
    })
  });
};
exports.signout = (req, res) => {
  res.json({
    message: "User logout!",
  });
};
  
// sign
exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()[0].msg,
    });
  }
  User.findOne({email},
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User email does not exist",
        });
      }
      if (!user.autheticate(password)) {
        return res.status(401).json({
          error: "Email and password do not match",
        });
      }
      // create token
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.SECRET
      );
      // put token in cokkies
      res.cookie("token", token, {
        expire: new Date() + 9999,
      });
      // send response from front end
      const { _id, name, email, role } = user;
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role,
        },
      });


    }
    
  );
};

  // protected route
//   exports.isSignedIn = expressJwt({
//     secret:process.env.SECRET,
//     userProperty:"auth"
//   });

  //protected routes
exports.isSignedIn = expressJwt({
    secret: "cat123",
    userProperty: "auth"
  });

  //custom middlewares
exports.isAuthenticated = (req, res, next) => {
  // console.log(req.params.userId)

  let checker = req.profile && req.auth && req.profile._id == req.params.userId;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED"
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied"
    });
  }
  next();
};
