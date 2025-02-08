const messageModel = require("../model/messageModel"); // Make sure path is correct

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    // Make sure message is not empty
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: "Message text is required" });
    }

    const data = await messageModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) {
      return res.json({ msg: "Message added successfully." });
    } else {
      return res.json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    next(ex);
  }
};

// // Controller to fetch messages between two users
module.exports.getAllMessages = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const messages = await messageModel
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg?.sender?.toString() === from, // Optional Chaining (?.) का उपयोग करें
        message: msg?.message?.text || "No Message", // Default वैल्यू if undefined
      };
    });

    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};
module.exports.clearMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    await messageModel.deleteMany({
      // Change Message to messageModel
      users: { $all: [from, to] },
    });

    return res.json({ msg: "Chat cleared successfully." });
  } catch (ex) {
    next(ex);
  }
};
