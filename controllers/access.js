
const Access = require("../models/access");
const excelJS = require("exceljs");

exports.getAccessById = (req, res, next, id) => {
    Access.findById(id).exec((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "Access not found in DB"
      });
    }
    req.access = access;
    next();
  });
};

exports.createAccess = (req, res) => {
  const access = new Access(req.body);
  access.save((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "NOT able to save access in DB"
      });
    }
    res.json({ access });
  });
};

exports.getAccess = (req, res) => {
  return res.json(req.access);
};

exports.getAllAccess = (req, res) => {
    Access.find().exec((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "NO access found"
      });
    }
    res.json(access);
  });
};

exports.updateAccess = (req, res) => {
  Access.findOneAndUpdate({_id: req.params.accessId}, {$set: {name: req.body.name}}).exec((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to update access"
      });
    }
    res.json({success:"update Sucessfully"});
  });
};

exports.removeAccess = (req, res) => {
  const access = req.access;

  access.remove((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete this access"
      });
    }
    res.json({
      message: "Successfully deleted"
    });
  });
};


//   multiple delete
exports.deleteAccess = async(req, res) => {
  const selectedAccess = req.body.id;
  let resonse =  await Access.deleteMany(
      {'_id':{$in:selectedAccess},  
  })
  res.json({
          message: "Successfully Deleted"
        });
  console.log(resonse)
};


 // export
 exports.exportAccess = async (req, res) => { 
  // get all data
  const access = await Access.find()
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My Access"); // New Worksheet
  const path = "./files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "Name", key: "name", width: 10 }, 


];
// Looping through User data
let counter = 1;

access.forEach((access) => {
  access.s_no = counter;
  worksheet.addRow(access); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
try {
  const data = await workbook.xlsx.writeFile(`${path}/access.xlsx`)
   .then(() => {
     res.send({
       status: "success",
       message: "file successfully downloaded",
       path: `http://127.0.0.1:8000/files/access.xlsx`,
      });
   });
} catch (err) {
    res.send({
    status: "error",
    message: "Something went wrong",
  });
  }
};