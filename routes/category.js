

const express = require("express");
const router = express.Router();

const {
  getCategoryById,
  createCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  removeCategory,
  deleteCategories,
  allowIfLoggedin,
  grantAccess,
  exportCategories
} = require("../controllers/category");
const { isLogin } = require("../middleware/isLogin")
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
// export 
router.get(
  "/categories/downloadExcel",
  exportCategories
);
//params
router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

//actual routers goes here

//create
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  createCategory
);

//read
router.get("/category/:categoryId", getCategory);
router.get("/categories",isLogin,grantAccess('readAny', 'category'),getAllCategory);

//update
router.put(
  "/category/:categoryId",
  // isSignedIn,
  // isAuthenticated,
  updateCategory
);

//delete

router.delete(
  "/category/:id",
  grantAccess('deleteAny', 'category'),
  removeCategory
);

// mutiple delete
router.delete(
  "/deleteCategories",
  deleteCategories
);


module.exports = router;

