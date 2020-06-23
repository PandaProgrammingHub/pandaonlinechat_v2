const express = require("express");
const router = express.Router();
const WallPost = require("../models/WallPost");
const User = require("../models/Users");
const Chat = require("../models/Chat");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
var _ = require("lodash");

// @desc   get Users Collections
// @route  GET /api/getAllUsers
router.post("/getAllUsers", ensureAuth, async (req, res) => {
  try {
    let users = await User.find({ _id: { $ne: req.user.id } });
    if (users.length > 0) {
      res.send({
        currentUserInfo: req.user,
        userLists: users,
      });
    }
  } catch (error) {}
});

// @desc   get Wall Posts
// @route  GET /api/getWallStatusPost
router.get("/getWallStatusPost", ensureAuth, async (req, res) => {
  try {
    let wallPosts = await WallPost.find({}).populate("user");
    res.send(wallPosts);
  } catch (error) {}
});

// @desc   get one to one Chat
// @route  GET /api/getOneToOneChat
router.post("/getOneToOneChat", ensureAuth, async (req, res) => {
  try {
    let to_id = req.body.to_id;
    let from_id = req.body.from_id;
    let firstCollection = [];
    let secondCollection = [];
    let toUserInfo = await User.findOne({ _id: to_id });
    let fetchChat = async (to_id, from_id) => {
      let chat = await Chat.find({
        to_user: to_id,
      })
        .populate("from_user")
        .populate("to_user");
      let filteredChat = chat.filter((ch) => ch.from_user._id == from_id);
      return filteredChat;
    };
    firstCollection = await fetchChat(to_id, from_id);
    secondCollection = await fetchChat(from_id, to_id);
    let conversations = [...firstCollection, ...secondCollection];
    res.send({
      toUserInfo: toUserInfo,
      conversations: _.sortBy(conversations, function (conversation) {
        return new Date(conversation.cratedAt);
      }),
    });
  } catch (error) {}
});

module.exports = router;
