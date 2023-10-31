

const express = require("express");
const router = express.Router();
const { isLogin } = require("../middleware/isLogin")

const {
  getAccessById,
  createAccess,
  getAccess,
  getAllAccess,
  updateAccess,
  removeAccess,
  deleteAccess,
  exportAccess
} = require("../controllers/access");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
// export 
router.get(
  "/access/downloadExcel",
  exportAccess
);
//params
router.param("userId", getUserById);
router.param("accessId", getAccessById);

//actual routers goes here

//create
router.post(
  "/access/create/:userId",
  isSignedIn,
  isAuthenticated,
  createAccess
);

//read
router.get("/access/:accessId", getAccess);
router.get("/access",isLogin, getAllAccess);

//update
router.put(
  "/access/:accessId",
  // isSignedIn,
  // isAuthenticated,
  updateAccess
);

//delete

router.delete(
  "/access/:accessId/:userId",
  isSignedIn,
  isAuthenticated,
  removeAccess
);

// mutiple delete
router.delete(
  "/deleteAccess",
  deleteAccess
);


module.exports = router;

