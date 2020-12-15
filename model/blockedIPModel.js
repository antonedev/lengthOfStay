const mongoose = require("mongoose");

const ipSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  attempts: { type: Number, required: true },
  lastAttempt: { type: Date, required: true },
});

exports.BlockedIP = mongoose.model("BlockedIP", ipSchema);