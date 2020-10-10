if (process.env.Node_DEV === "production") {
  module.exports = require("./prod");
} else module.exports = require("./dev");
