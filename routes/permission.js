const express = require("express");
const router = express.Router();
const {
  getPermissionById,
  createPermission,
  getPermission,
  getAllPermission,
  exportPermission
} = require("../controllers/permission");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const { isLogin } = require("../middleware/isLogin")

// export 
router.get(
  "/permission/downloadExcel",
  exportPermission
);
//params
router.param("userId", getUserById);
router.param("permissionId", getPermissionById);


//create
router.post(
  "/permission/create",
  // isSignedIn,
  // isAuthenticated,
  createPermission
);

// 
router.get(
  "/permissions",
  isLogin,
  getPermission
);


module.exports = router;
