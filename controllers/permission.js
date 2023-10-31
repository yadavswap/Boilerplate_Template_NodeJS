const Permission = require("../models/permission");
const UserGroup = require("../models/user_group");
const AccessModel = require("../models/access");
const excelJS = require("exceljs");

const formidable = require('formidable');
const {
  Access
} = require("accesscontrol");

// get product

exports.getPermissionById = (req, res, next, id) => {
  Permission.findById(id).exec((err, permission) => {
    if (err) {
      return res.status(400).json({
        error: "Permission not found in DB"
      });
    }
    req.permission = permission;
    next();
  });
};

exports.createPermission = async (req, res) => {
  try {
    // console.log('permission req body',req.body)
    const permission = new Permission();
    permission.user_group = req.body.user_group
    permission.access = req.body.access
    await permission.save();
    res.send({
      "success": "Data saved successfully !"
    })

  } catch (error) {
    res.send({
      "error": error
    })
  }
};


exports.getPermission = async (req, res) => {
  try {
    const user_group = await UserGroup.find();
    
      const access = await AccessModel.aggregate([
        {
          $group: {
            _id: "$table_name",
            records: {
              $push: "$$ROOT"
            }
          }
        }
      ])
    // const access =await AccessModel.find({$group : { table_name : "$table_name"}});
    return res.json({
      'success': "Data Found",
      user_group,
      access
    });
  } catch (error) {
    // console.log(error)
  }
};

exports.getAllPermission = (req, res) => {
  Permission.find().exec((err, permission) => {
    if (err) {
      return res.status(400).json({
        error: "NO Permission found"
      });
    }
    res.json(permission);
  });
};

exports.updatePermission = (req, res) => {
  Access.findOneAndUpdate({
    _id: req.params.permissionId
  }, {
    $set: {
      name: req.body.name
    }
  }).exec((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to update access"
      });
    }
    res.json({
      success: "update Sucessfully"
    });
  });
};

exports.removePermission = (req, res) => {
  const permission = req.permission;

  permission.remove((err, access) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete this Permission"
      });
    }
    res.json({
      message: "Successfully deleted"
    });
  });
};


//   multiple delete
exports.deletePermission = async (req, res) => {
  const selectedPermission = req.body.id;
  let resonse = await Permission.deleteMany({
    '_id': {
      $in: selectedPermission
    },
  })
  res.json({
    message: "Successfully Deleted"
  });
  // console.log(resonse)
};



// export
exports.exportPermission = async (req, res) => { 
  // get all data
  const permissions = await Permission.find()
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My Permissions"); // New Worksheet
  const path = "./files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "User Group", key: "user_group", width: 10 }, 

];
// Looping through User data
let counter = 1;

permissions.forEach((permission) => {
  permission.s_no = counter;
  worksheet.addRow(permission); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
try {
  const data = await workbook.xlsx.writeFile(`${path}/permissions.xlsx`)
   .then(() => {
     res.send({
       status: "success",
       message: "file successfully downloaded",
       path: `http://127.0.0.1:8000/${path}/permissions.xlsx`,
      });
   });
} catch (err) {
    res.send({
    status: "error",
    message: "Something went wrong",
  });
  }
};