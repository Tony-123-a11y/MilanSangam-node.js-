import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { userId } = req.user;
    const { text } = req.body;

    const message = await Message.create({
      userId,
      profileId,
      text,
    });
    let conversation = await Conversation.findOne({
      members: { $all: [profileId, userId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [profileId, userId],
      });
    }
    conversation.messages.push(message._id);
    await conversation.save();
    res.status(200).json({ msg: "Message sent succesfully", sucess: true });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", sucess: false });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const { userId } = req.user;
    const conversations = await Conversation.find({
      members: { $all: [userId] },
    }).populate({ path: "members", populate: { path: "profile" } });
    if (!conversations) {
      return res
        .status(200)
        .json({ msg: "No contacts were found", sucess: true });
    }
    let contacts = [];
    conversations.forEach((ele) => {
      ele.members.forEach((contact) => {
        if (contact._id != userId) {
          contacts.push({
            profilePhotos: contact.profile.profilePhotos,
            user: {
              _id: contact._id,
              fullName: contact.fullName,
            },
          });
        }
      });
    });
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", sucess: false });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { userId } = req.user;
    const { profileId } = req.params;

    const conversation = await Conversation.findOne({
      members: { $all: [userId, profileId] },
    }).populate("messages");
    if (!conversation) {
      res.status(404).json({ msg: "Conversation not found", sucess: false });
    }
    res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", sucess: false });
  }
};
