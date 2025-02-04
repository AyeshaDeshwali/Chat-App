// In messagesRoutes.js
const {
  getAllMessages,
  addMessage,
} = require("../controllers/messageController");
const router = require("express").Router();

// Correcting GET and POST routes
router.get("/getmsg", getAllMessages); // This is to fetch messages
router.post("/addmsg", addMessage); // This is for adding new messages

module.exports = router;
