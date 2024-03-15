var express = require("express");
var router = express.Router();
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1770182",
  key: "7e4577e3949d26fcc586",
  secret: "a063d77d97dc51a344bd",
  cluster: "eu",
  useTLS: true
});

// Join chat

router.put("/users/:username", (req, res) => {
  try {
    pusher.trigger("chat", "join", {
      username: req.params.username,
    });
    res.json({ result: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ result: false, error: "Internal Server Error" });
  }
});

// Leave chat

router.delete("/users/:username", (req, res) => {
  try {
    pusher.trigger("chat", "leave", {
      username: req.params.username,
    });
    res.json({ result: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ result: false, error: "Internal Server Error" });
  }
});
// Send message

router.post("/message", (req, res) => {
  const message = req.body;

  pusher.trigger("chat", "message", message);

  res.json({ result: true });
});

module.exports = router;