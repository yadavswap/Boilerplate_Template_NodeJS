

const express = require("express");
const router = express.Router();
const { isLogin } = require("../middleware/isLogin")

const {
  getUserGroupById,
  createUserGroup,
  getUserGroup,
  getAllUserGroup,
  updateUserGroup,
  removeUserGroup,
  deleteUserGroup,
  exportUserGroup
} = require("../controllers/user_group");
// export 
router.get(
  "/user_groups/downloadExcel",
  exportUserGroup
);
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");



//params
router.param("userId", getUserById);
router.param("user_groupId", getUserGroupById);

//actual routers goes here

//create
router.post(
  "/user_group/create",
  // isSignedIn,
  // isAuthenticated,
  isLogin,
  createUserGroup
);

//read
router.get("/user_group/:user_groupId", getUserGroup);
router.get("/user_groups",isLogin, getAllUserGroup);

// get by id
// router.get("/user_group",isLogin, getUserGroup);

//update
router.put(
  "/user_group/:user_groupId",
  isLogin,
  // isSignedIn,
  // isAuthenticated,
  updateUserGroup
);

//delete

router.delete(
  "/user_group/:user_groupId/:userId",
  isSignedIn,
  isAuthenticated,
  removeUserGroup
);

// mutiple delete
router.delete(
  "/deleteUserGroups",
  deleteUserGroup
);




module.exports = router;

