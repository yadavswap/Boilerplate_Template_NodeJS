const express = require('express')
const router = express.Router()
const {
  signout,
  signup,
  signin,
  isSignedIn
} = require("../controllers/auth")
const { check } = require('express-validator');

// signout

router.post('/signup', [
  check('name', "Name Should be at least 3 char")
  .isLength({
    min: 3
  }),
  check('email', "Email is required")
  .isEmail(),
  check('password', "password Should be at least 3 char")
  .isLength({
    min: 3
  }),

], signup);

router.get('/signout', signout);

// sign in
router.post('/signin', [
 
  check('email', "Email is required")
  .isEmail(),
  check('password', "password is required")
  .isLength({
    min: 3
  }),

], signin);

router.get('/signin', signin);

// protected test route
router.get('/testroute',isSignedIn,(req,res)=>{
  res.send("protected Route");
});
module.exports = router;