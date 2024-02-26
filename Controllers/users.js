// userId,socket.id,socket

const { BonusTrailBet } = require("../models/bonusTrail.gameBet.model");
const { UserMaster } = require("../models/bonusTrail.gameUser.model");

const registerUser = async (userId, socket) => {
  try {
    if (!userId) {
      console.log({ msg: "error in register user:- userId not found" });
      return;
    }
    const user = await UserMaster.findOne({ _id: userId });

    if (!user) {
      console.log({ msg: "error in register user:- user not found" });
      socket.emit("userNotFound", { msg: "User Not Found" });
      return;
    }
    let userbet = await BonusTrailBet.findOne({ userId });
    if (!userbet) {
      userbet = new BonusTrailBet({
        userId: userId,
      });
    }
    await user.save();
    await userbet.save();

    socket.emit("userDetails", {
      user,
    });
  } catch (error) {
    console.error("Error initializing game state:", error.message);
  }
};

const updatedUserAfterWin = (userId, socket) => {
  socket.on("getUpdatedUserDetails", async () => {
    try {
      if (!userId) {
        console.log({ msg: "user not found in updatedUserAfterWin" });
        return;
      }
      let user = await UserMaster.findOne({ _id: userId });
      if (!user) {
        console.log({ msg: "user not found" });
        return;
      }

      socket.emit("userDetails", {
        user,
      });
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = { registerUser, updatedUserAfterWin };
