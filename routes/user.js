const express = require('express')
const router = express.Router()

const {getUserById,getUser,getAllUsers,getUpdateUser,userPurchaseList,removeUser,deleteUsers,exportUser} = require("../controllers/user");
const {isSignedIn,isAuthenticated,isAdmin } = require("../controllers/auth");
const { isLogin } = require("../middleware/isLogin")

// export 
router.get(
  "/users/downloadExcel",
  exportUser
);

router.param("userId",getUserById);
router.get("/user/:userId",getUser);
router.get("/users",isLogin,getAllUsers);
router.put("/user/:userId",
// isSignedIn,
// isAuthenticated,
getUpdateUser);
router.get("/orders/user/:userId",isSignedIn,isAuthenticated,userPurchaseList);
//delete
router.delete(
    "/user/:userId",
    isSignedIn,
    removeUser
  );
// mutiple delete
router.delete(
  "/deleteUsers",
  deleteUsers
);



module.exports = router;