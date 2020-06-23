const moment = require("moment");
const WallPost = require("../models/WallPost");
const Chat = require("../models/Chat");

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("chatMessage", async (from, to, msg) => {
      let time = moment().format("LT | dddd");
      let user = socket.request.user;
      const newChat = {
        from_user: user.id,
        to_user: to,
        message: msg,
      };
      try {
        if (Object.keys(user).length) {
          let chat = await Chat.create(newChat);
          let getChat = await Chat.findOne({ _id: chat._id })
            .populate("from_user")
            .populate("to_user");
          io.emit("chatMessage", getChat, time);
        }
      } catch (error) {
        console.error("Chat Error=>", Error);
      }
    });

    socket.on("wallstatusPost", async (msg) => {
      let time = moment().format("LT | dddd");
      let user = socket.request.user;
      const newWallPost = {
        user: user.id,
        pastDescription: msg,
      };
      try {
        if (Object.keys(user).length) {
          let wallPost = await WallPost.create(newWallPost);
          io.emit("wallstatusPost", user, msg, time);
        }
      } catch (error) {
        console.error("WallPost Error=>", Error);
      }
    });

    socket.on("notifyUser", function (user, notify_to) {
      io.emit("notifyUser", user, notify_to);
    });
  });
};
