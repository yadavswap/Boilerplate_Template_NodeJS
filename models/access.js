var mongoose = require('mongoose');
const accessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
        unique:true
    },
    key: {
        type: String,
        maxlength: 32,
        trim: true,
    },
    table_name: {
        type: String,
        maxlength: 32,
        trim: true,
    },
}, {
    timestamps: true
});
module.exports = mongoose.model("Access", accessSchema);