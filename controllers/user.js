const fs = require('fs')
const path = require('path')
const User = require("../models/user");
const Order = require("../models/order");
const {roles} = require("../roles")
const excelJS = require("exceljs");
const filePath = path.resolve('.', 'files/users.xlsx')
const imageBuffer = fs.readFileSync(filePath)

exports.grantAccess = function(action, resource) {
  return async (req, res, next) => {
//  console.log('req',req.user);
   try {
 
    const permission = roles.can(req.user.role)[action](resource);
    if (!permission.granted) {
     return res.status(401).json({
      error: "You don't have enough permission to perform this action"
     });
    }
    next()
   } catch (error) {
    next(error)
   }
  }
 }
  
 exports.allowIfLoggedin = async (req, res, next) => {
  try {
   const user = res.locals.loggedInUser;
   if (!user)
    return res.status(401).json({
     error: "You need to be logged in to access this route"
    });
    req.user = user;
    next();
   } catch (error) {
    next(error);
   }
 }
exports.getUserById = (req, res, next, id) => {
  
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "No User Found in DB"
            });
        }
        req.profile = user;
        next();
    })
};


exports.getUser = (req,res)=>{
    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;

    return res.json(req.profile);
}

// get all users

exports.getAllUsers_new = async(req,res)=>{
  try {
   
      await User.find().populate('role')
      .exec((err, users) => {
          if (err || !users) {
              return res.status(400).json({
                  error: "No User Found in DB"
              });
          }

        return res.json(users);
  })
  } catch (error) {
    // console.log(error);
    res.status(500).send()
  }
    
}
exports.getAllUsers = async(req,res)=>{
  try {
      const PAGE_SIZE = 2;
      const page = parseInt(req.query.page || "0")
      const total = await User.countDocuments({});
      await User.find().limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .populate('role')
      .exec((err, users) => {
          if (err || !users) {
              return res.status(400).json({
                  error: "No User Found in DB"
              });
          }
        return res.json({
          totalPages:Math.ceil(total / PAGE_SIZE),
          users
        });
  })
  } catch (error) {
    // console.log(error);
    res.status(500).send()
  }
    
}


// update user
exports.getUpdateUser = (req, res) => {
  
    User.findOneAndUpdate({_id: req.params.userId}, {$set: {name: req.body.name,email:req.body.email,password:req.body.password}}).exec((err, category) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to update category"
        });
      }
      res.json({success:"update Sucessfully"});
    });
  };
exports.getUpdateUser_old = (req,res)=>{
    User.findByIdAndUpdate(
        {_id:req.profile._id},
        {$set:req.body},
        {new:true,useFindAndModify:false},
        (err,user)=>{
            if(err){
                return res.status(400).json({
                    error:"You are not authorized to update this user"
                });
            }
            user.salt = undefined;
            user.encry_password = undefined;
            user.encry_password = undefined;
            user.createdAt = undefined;
            user.updatedAt = undefined;
            return res.json(user);
        }
    )
}

// 
exports.userPurchaseList = (req,res)=>{
    Order.find({user:req.profile._id})
    .populate("user","_id name")
    .exec((err,order)=>{
        if(err){
            return res.status(400).json({
                error:"No Order in this account"
            });
        }
        return res.json(order);
    });
}

// push order in purchase list

exports.pushOrderInPurchaseList = (req,res,next)=>{
    let purchases = [];
    req.body.order.products.forEach(product=>{
        purchases.push({
            _id:product._id,
            name:product.name,
            description:product.description,
            category:product.category,
            quantity:product.quantity,
            amount:req.body.order.amount,
            transaction_id:req.body.order.transaction_id
        });
    });
    

    User.findOneAndUpdate(
        { _id: req.profile._id },
        { $push: { purchases: purchases } },
        { new: true },
        (err, purchases) => {
          if (err) {
            return res.status(400).json({
              error: "Unable to save purchase list"
            });
          }
          next();
        }
      );
}

// store this in db


// delete user
exports.removeUser = (req, res) => {
    const user = req.profile;
  
    user.remove((err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to delete this user"
        });
      }
      res.json({
        message: "Successfull deleted"
      });
    });
  };

//   multiple delete
// delete user
exports.deleteUsers = async(req, res) => {
    const selectedUsers = req.body.id;
    let resonse =  await User.deleteMany(
        {'_id':{$in:selectedUsers},  
    })
    res.json({
            message: "Successfull deleted"
          });
    // console.log(resonse)
  };

  // export
  exports.exportUser = async (req, res) => { 
   
    // get all data
    const users = await User.find()
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
    const path = "./files";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: "Name", key: "name", width: 10 }, 
      { header: "Last Name", key: "lastname", width: 10 },
      { header: "Email Id", key: "email", width: 10 },
  ];
  // Looping through User data
  let counter = 1;

  users.forEach((user) => {
    user.s_no = counter;
    worksheet.addRow(user); // Add data in worksheet
    counter++;
  });
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  try {
    const data = await workbook.xlsx.writeFile(`${path}/users.xlsx`)
     .then(() => {
      res.setHeader('Content-Type', 'application/vnd.ms-excel')
      res.send(imageBuffer)
      //  res.send({
      //    status: "success",
      //    message: "file successfully downloaded",
      //    path: `http://127.0.0.1:8000/files/users.xlsx`,
         
      //   });
     });
  } catch (err) {
    // console.log(err);
      res.send({
      status: "error",
      message: "Something Went Wrong",
    });
    }
  };