const {
  Order,
  ProductCart
} = require("../models/order");
const excelJS = require("exceljs");

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Order not found in DB",
        });
      }
      req.order = order;
      next();
    });
};

// create
exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to save order in DB",
      });
    }
    res.josn(order);
  })
}

// get all orders
exports.getAllOrders = (req,res)=>{
  Order.find()
  .populate('user',"_id name")
  .exec((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "NO Order Found",
      });
    }
    res.josn(order);
  })
}

// order status 
exports.getOrderStatus=(req,res)=>{
  res.json(Order.schema.path("status").enumValues);
};
// order update
exports.updateOrderStatus = (req,res)=>{
  Order.update(
    {_id:req.body.orderId},
    {$set: {status:req.body.status}},
    (err,order)=>{
      if(err){
        return res.status(400).json({
          error:"Cannot update order status"
        });
      }
      res.json(order);
    }
  ) 
}

 // export
 exports.exportOrder = async (req, res) => { 
  // get all data
  const orders = await Order.find()
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My Orders"); // New Worksheet
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
       path: `http://127.0.0.1:8000/${path}/products.xlsx`,
      });
   });
} catch (err) {
    res.send({
    status: "error",
    message: "Something went wrong",
  });
  }
};