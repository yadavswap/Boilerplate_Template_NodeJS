// var jwt = require("jsonwebtoken");

// const isLogin = (req,res,next)=>{
//     const token = req.headers.Authorization
//     console.log(token)
//     // what if token is not there

//     if(!token){
//         return res.status(403).send("Unauthazied")
//     }

//     // verify token

//     try {
//         const decode = jwt.verify(token,process.env.SECRT)
//         console.log(decode);
//         req.user = decode
//     } catch (error) {
//         return res.send(403).send("Token invaild")
//         console.log(error)
//     }
//     return next()
// }

// module.exports = isLogin

const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");


  // protected route
//   exports.isSignedIn = expressJwt({
//     secret:process.env.SECRET,
//     userProperty:"auth"
//   });



  //custom middlewares
exports.isLogin = (req, res, next) => {
    //  const token = req.headers.authorization
    const { authorization } = req.headers;
    const bearertoken = authorization.split(' ');
    const token = bearertoken[1];
    // what if token is not there
    if(!token){
        return res.sendStatus(403).send("Unauthazied")
    }
    // verify token
    try {
      
        const decode = jwt.verify(token,process.env.SECRET)
        req.user = decode
    } catch (error) {
        return res.sendStatus(403).send("Token invaild")
    }
    return next()
};


