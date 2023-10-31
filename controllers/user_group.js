const UserGroup = require("../models/user_group");
const AccessModel = require("../models/access");
const excelJS = require("exceljs");

exports.getUserGroupById = (req, res, next, id) => {
    UserGroup.findById(id).exec((err, user_group) => {
    if (err) {
      return res.status(400).json({
        error: "UserGroup not found in DB"
      });
    }
    req.user_group = user_group;
    next();
  });
};
exports.createUserGroup_old = (req, res) => {
  const user_group = new UserGroup(req.body);
  user_group.save((err, user_group) => {
    if (err) {
      return res.status(400).json({
        error: "NOT able to save user_group in DB"
      });
    }
    res.json({ user_group });
  });
};

exports.createUserGroup = async (req, res) => {
  try {
    // console.log('user group req body',req.body)
    const user_group = new UserGroup();
    user_group.name = req.body.name
    user_group.display_name = req.body.display_name
    user_group.access = req.body.access
    await user_group.save();
    res.send({
      "success": "Data saved successfully !"
    })

  } catch (error) {
    res.send({
      "error": error
    })
  }
};

// exports.getUserGroup = (req, res) => {

//   return res.json(req.user_group);
// };

exports.getUserGroup = async(req,res)=>{
  try {

      // user find
      const user_group = await UserGroup.findById(req.params.user_groupId)

      // console.log(user_group);
      const access_list = await AccessModel.aggregate([
        {
          $group: {
            _id: "$table_name",
            records: {
              $push: "$$ROOT"
            }
          }
        }
      ])
      res.status(200).json({
          success:true,
          user_group,
          access_list
      })
      
  } catch (error) {
      // console.log(error);
      res.status(401).json({
          success:false,
          message:error.message
      })
  }
}
exports.getAllUserGroup = (req, res) => {
    UserGroup.find().exec((err, user_groups) => {
    if (err) {
      return res.status(400).json({
        error: "NO user groups found"
      });
    }
    res.json(user_groups);
  });
};
exports.updateUserGroup_old = (req, res) => {
  // console.log('req.body',req.body);
    UserGroup.findOneAndUpdate({_id: req.params.user_groupId}, {$set: {name: req.body.name,display_name:req.body.display_name,access:req.body.access}}).exec((err, user_group) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to update user group"
      });
    }
    res.json({success:"Updated Successfully"});
  });
};

// edit
exports.updateUserGroup= async(req,res)=>{

  try {

      const user = await UserGroup.findByIdAndUpdate({_id: req.params.user_groupId}, {$set: {name: req.body.name,display_name:req.body.display_name,access:req.body.access}})
      res.status(200).json({
      success:true,
      message:"User updated successfully"
  })
      
  } catch (error) {
      // console.log(error);
      res.status(401).json({
          success:false,
          message:error.message
      })
  }
  
}


exports.removeUserGroup = (req, res) => {
  const user_group = req.user_group;
  user_group.remove((err, user_group) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete this user group"
      });
    }
    res.json({
      message: "Successfully Deleted"
    });
  });
};
//   multiple delete
exports.deleteUserGroup = async(req, res) => {
  const selectedUserGroups = req.body.id;
  let resonse =  await UserGroup.deleteMany(
      {'_id':{$in:selectedUserGroups},  
  })
  res.json({
          message: "Successfully Deleted"
        });
  // console.log(resonse)
};


// export
exports.exportUserGroup = async (req, res) => { 

  
  // get all data
  const user_groups = await UserGroup.find()
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My User Groups"); // New Worksheet
  const path = "./files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "Name", key: "name", width: 10 }, 
    { header: "Display Name", key: "display_name", width: 10 },
];
// Looping through User data
let counter = 1;

user_groups.forEach((user_group) => {
  user_group.s_no = counter;
  worksheet.addRow(user_group); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
try {
  const data = await workbook.xlsx.writeFile(`${path}/user_groups.xlsx`)
   .then(() => {
     res.send({
       status: "success",
       message: "file successfully downloaded",
       path: `http://127.0.0.1:8000/files/user_groups.xlsx`,
      });
   });
} catch (err) {
    res.send({
    status: "error",
    message: "Something went wrong",
  });
  }
};