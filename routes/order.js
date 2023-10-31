const express = require('express')
const router = express.Router()

const {
    isSignedIn,
    isAuthenticated,
    isAdmin
} = require("../controllers/auth");
const {
    getUserById,userPurchaseList
} = require("../controllers/user");
const {
    updateStock
} = require("../controllers/product");
const {getOrderById,createOrder,getAllOrders,getOrderStatus,updateOrderStatus} = require("../controllers/order");
// export 
router.get(
    "/orders/downloadExcel",
    exportOrder
  );
// params
router.param("userId", getUserById);
router.param("orderId", getOrderById);
// Actual routes
// create
router.post(
    "/order/create/:userId",
    isSignedIn,
    isAuthenticated,
    userPurchaseList,
    updateStock,
    createOrder
  );

// read
router.get("order/all/:userId", getAllOrders);
router.get("/order/status/:userId",isSignedIn,isAuthenticated,isAdmin,getOrderStatus);
router.put("/order/:orderId/status/:userId",isSignedIn,isAuthenticated,isAdmin,updateOrderStatus);

module.exports = router;