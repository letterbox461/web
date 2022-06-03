const { Router, query } = require("express");
const router = Router();
const path = require("path");

router.get("/", (req, res) => {
  res.render("index", {
    title: "Lear corp.",
  });
});

// router.get("/", async (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build/index.html"));
// });

module.exports = router;
