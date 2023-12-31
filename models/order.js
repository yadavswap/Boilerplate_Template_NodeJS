const { ObjectId } = require('mongoose');
var mongoose = require('mongoose');

const ProductCartSchema = new mongoose.Schema({
    product:{
        type:ObjectId,
        ref:"Product"
    },
    name:String,
    count:Number,
    price:Number
})

const  ProductCart = mongoose.model("ProductCart",ProductCartSchema);

const orderSchema = new mongoose.Schema({
        products:[ProductCartSchema],
        transaction_id:{},
        amount:{type:Number},
        address:String,
        status:{
            type:String,
            default:"Recived",
            enum:["Cancelled","Deliverd","Shipped","Processing","Received"]
        },
        updated:Date,
        user:{
            type:ObjectId,
            ref:"User"
        }
}, {
    timestamps: true
});

const  Order = mongoose.model("Order",orderSchema);

// module.exports = mongoose.model("Order", orderSchema);