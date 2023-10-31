const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const permissionSchema = new mongoose.Schema({
    user_group:{
        type:ObjectId,
        ref:"UserGroup",
        required:true
    },
    access:[{
        type:ObjectId,
        ref:"Access",
        required:true
    }]
},{timestamps:true});

module.exports = mongoose.model("Permission",permissionSchema);