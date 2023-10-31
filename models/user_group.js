var mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const user_groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
        unique:true
    },
    display_name: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
        unique:true
    },
    access:[{
        type:ObjectId,
        ref:"Access",
        required:true
    }]
}, {
    timestamps: true
});
module.exports = mongoose.model("UserGroup", user_groupSchema);