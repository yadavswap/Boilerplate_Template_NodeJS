const Product = require("../models/product");
const formidable = require('formidable');
const _ = require("lodash");
const fs = require("fs");
const excelJS = require("exceljs");

// get product
exports.getProductById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if (err) {
      return res.status(400).json({
        error: "Product not found in DB",
      });
    }
    req.product = product;
    next();
  });
};

// create product
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    //   destrcture the fields

    const {
      name,
      description,
      price,
      category,
      stock
    } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "please include all fields"
      });
    }
    //   restrication on field
    let product = new Product(fields)

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "file size too big"
        })
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type
    }

    // save db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product saving in DB failed",
        });
      }
      res.json(product)
    })
  })
}


exports.getProduct = (req, res) => {
  // console.log(req.Product);
  req.product.photo = undefined;
  return res.json(req.product);
};


exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType)
    return res.send(req.product.photo.data)
  }
  next();
};


// delete product

exports.deleteProduct = (req, res) => {
  
  let product = req.product;
  Product.deleteOne((err, deleteProduct) => {
    if (err) {
      return res.status(400).json({
        error: "faild to delete product",
      });
    }
    res.json({
      message: "Deletion was a success",
      deleteProduct
    });
  });
}

// update product
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }

    //   updation code
    let product = req.product;
    product = _.extend(product, fields)

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "file size too big"
        })
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type
    }

    // save db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "updation of product failed",
        });
      }
      res.json(product)
    })
  })
}

// listing
// exports.getAllProduct = (req, res) => {
//   return 's';
//   // Product.find()
//   //   .select("_photo")
//   //   .populate('category')
//   //   .sort([sortBy, "asc"])
//   //   .limit(limit)
//   //   .exec((err, products) => {
//   //     if (err) {
//   //       return res.status(400).json({
//   //         error: "NO Product Found",
//   //       });
//   //     }
//   //   })

// }
exports.getAllProduct = (req,res)=>{
  Product.find()
  .select(["_photo","name","description","price"])
  .populate('category')
  .exec((err, products) => {
      if (err || !products) {
          return res.status(400).json({
              error: "No User Found in DB"
          });
      }
      return res.json(products);
  })
}

// update stock 

exports.updateStock = (req,res,next)=>{
  let myOperations = req.body.order.products.map(prod =>{
    return {
      updateOne:{
        filter:{_id:pro._id},
        update:{$inc:{stock:-pro.count,sold:+pro.count}}
      }
    };
  });
  Product.bulkWrite(myOperations,{},(err,products)=>{
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed",
      });
    }
    next();
  })
}

// unique category

exports.getAllUniqueCategory=(req,res)=>{
 
  // Product.distinct("category",{},{err,category)=>{
  //   // if (err) {
  //   //   return res.status(400).json({
  //   //     error: "No category found",
  //   //   });
  //   // }
  //   res.json(category);
  // });
}


//   multiple delete

exports.deleteProducts = async(req, res) => {
  const selectedProducts = req.body.id;
  let resonse =  await Product.deleteMany(
      {'_id':{$in:selectedProducts},  
  })
  res.json({
          message: "Successfully deleted"
        });
  // console.log(resonse)
};


 // export
 exports.exportProduct = async (req, res) => { 
  // get all data
  const products = await Product.find()
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My Products"); // New Worksheet
  const path = "./files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "Name", key: "name", width: 10 }, 
    { header: "Price", key: "price", width: 10 },
    { header: "Description", key: "description", width: 10 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Sold", key: "sold", width: 10 },

];
// Looping through User data
let counter = 1;

products.forEach((product) => {
  product.s_no = counter;
  worksheet.addRow(product); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
try {
  const data = await workbook.xlsx.writeFile(`${path}/products.xlsx`)
   .then(() => {
     res.send({
       status: "success",
       message: "file successfully downloaded",
       path: `http://127.0.0.1:8000/files/products.xlsx`,
      });
   });
} catch (err) {
    res.send({
    status: "error",
    message: "Something went wrong",
  });
  }
};