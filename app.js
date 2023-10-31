const path = require('path')
require('dotenv').config()
const mongoose = require("mongoose");
const express = require("express");
var bodyParser = require('body-parser')
var cors = require('cors')
var cookieParser = require('cookie-parser')
const User = require("./models/user");

const app = express();
// my routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const CategoryRoutes = require("./routes/category");
const ProductRoutes = require("./routes/product");
const UserGroupRoutes = require("./routes/user_group");
const AccessRoutes = require("./routes/access");
const PermissionRoutes = require("./routes/permission");

var jwt = require("jsonwebtoken");

// database connection
mongoose.connect(process.env.DATABSE,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
})
.then(()=>{
    console.log("Db Connected")
});
app.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
     const accessToken = req.headers["x-access-token"];
     const { userId, exp } = await jwt.verify(accessToken, process.env.SECRET);
     // Check if token has expired
     if (exp < Date.now().valueOf() / 1000) { 
      return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
     } 
     res.locals.loggedInUser = await User.findById(userId); next(); 
    } else { 
     next(); 
    } 
   });
// middleware
app.use(bodyParser.json())
app.use(cors())
app.use(cookieParser())


// Route
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',CategoryRoutes);
app.use('/api',ProductRoutes);
app.use('/api',UserGroupRoutes);
app.use('/api',AccessRoutes);
app.use('/api',PermissionRoutes);


// upload folder
// app.use('/files',express.static(path.join(__dirname,'/files')))

const port = process.env.PORT || 8000;
app.listen(port,()=>{
    console.log(`App runing on port ${port}`);
})
