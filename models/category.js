var mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
        unique:true
    },
    user:{
        type:ObjectId,
        ref:"User",
    },
}, {
    timestamps: true
});
module.exports = mongoose.model("Category", categorySchema);