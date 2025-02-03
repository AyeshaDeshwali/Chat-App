const {
  register,
  login,
  getAllUsers,
  setAvatar,
  logOut,
} = require("../controllers/userController");
const router = require("express").Router();
router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.get("/logout/:id", logOut);

module.exports = router;
