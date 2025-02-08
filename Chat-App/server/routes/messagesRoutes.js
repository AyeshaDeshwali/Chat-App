// Backend: Add Clear Chat Route in messagesRoutes.js
const {
  getAllMessages,
  addMessage,
  clearMessages,
} = require("../controllers/messageController");
const router = require("express").Router();

router.get("/getmsg", getAllMessages);
router.post("/addmsg", addMessage);
router.post("/clearchat", clearMessages); // New Route for Clearing Chat

module.exports = router;
