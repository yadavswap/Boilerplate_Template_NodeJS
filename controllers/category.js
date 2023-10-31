
const Category = require("../models/category");
const User = require("../models/user");
const excelJS = require("exceljs");

const { roles } = require("../controllers/roles")
exports.grantAccess = function(action, resource) {
  return async (req, res, next) => {
   try {
    const user = req.user;
    // const id =role._id;
    const user_role =await User.findById(user.userId).populate('role')
    console.log('user_role',user_role.role.name);

    const permission = roles.can(user_role.role.name)[action](resource);
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
   const user = res.profile;
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
exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, cate) => {
    if (err) {
      return res.status(400).json({
        error: "Category not found in DB"
      });
    }
    req.category = cate;
    next();
  });
};

exports.createCategory = (req, res) => {
  req.body.user = req.profile._id
  const category = new Category(req.body);
  category.save((err, category) => {
    if (err) {
      return res.status(400).json({
        error: "NOT able to save category in DB"
      });
    }
    res.json({ category });
  });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "NO categories found"
      });
    }
    res.json(categories);
  });
};

exports.updateCategory = (req, res) => {


  Category.findOneAndUpdate({_id: req.params.categoryId}, {$set: {name: req.body.name}}).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to update category"
      });
    }
    res.json({success:"update Sucessfully"});
  });
};

exports.updateCategory_old = (req, res) => {
 
    //   updation code
    let category = req.category;
    category.name = req.body.name;
    // save db
    category.save((err, category) => {
      if (err) {
        return res.status(400).json({
          error: "updation of category failed",
        });
      }
      res.json(category)
    })

}

exports.removeCategory =async (req, res) => {

  try {
    const {id} = req.params
    const deleteCategory = await Category.findByIdAndDelete({_id:id})
    res.status(201).json({message: "Successfully deleted"})
  } catch (error) {
      res.status(422).json(error)
  }
};


//   multiple delete
exports.deleteCategories = async(req, res) => {
  const selectedCategories = req.body.id;
  let resonse =  await Category.deleteMany(
      {'_id':{$in:selectedCategories},  
  })
  res.json({
          message: "Successfully Deleted"
        });
  // console.log(resonse)
};

 // export
 exports.exportCategories = async (req, res) => { 
  // get all data
  const categories = await Category.find()
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My Categories"); // New Worksheet
  const path = "./files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "Name", key: "name", width: 10 }, 

];
// Looping through User data
let counter = 1;

categories.forEach((category) => {
  category.s_no = counter;
  worksheet.addRow(category); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
try {
  const data = await workbook.xlsx.writeFile(`${path}/category.xlsx`)
   .then(() => {
     res.send({
       status: "success",
       message: "file successfully downloaded",
       path: `http://127.0.0.1:8000/files/category.xlsx`,
      });
   });
} catch (err) {
    res.send({
    status: "error",
    message: "Something went wrong",
  });
  }
};