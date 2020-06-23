const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  from_user: { type: Schema.Types.ObjectId, ref: "Users" },
  to_user: { type: Schema.Types.ObjectId, ref: "Users" },
  message: {
    type: String,
    require: true,
  },
  cratedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
