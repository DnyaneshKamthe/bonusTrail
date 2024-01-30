const { BonusTrailgameuser } = require("../models/bonusTrail.game");
const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");

const handleBait = (userId, socket) => {
  socket.on("bait", async (data) => {
    const { coins, cardId } = data;
    // console.log("baitcardid",cardId);
    try {
      const user = await BonusTrailgameuser.findOne({ userId: userId });
      if (!user) {
        console.log({ msg: "user not found" });
        return;
      }
      if (user.coins <= 0 || coins <= 0|| user.coins-coins<0) {
        console.log({ msg: "insufficient balance" });
        return;
      }

      const gameCard = await BonusTrailGameCard.findById(cardId);
      if (!gameCard) {
        console.log({ msg: "maincard not found" });
        return;
      }

      let updatedCoins = user.coins - parseInt(coins);

      // add main card id to user ref
      user.game_id = gameCard._id;

      user.coins = updatedCoins;

      gameCard.total += parseInt(coins);
      await gameCard.save();

      await user.save();

      socket.emit("userDetails", { user });
    } catch (error) {
      console.log({ msg: "error in bait section", error: error });
    }
  });
};

const baitWinHandler = async (gameId) => {
  try {
    const gameCard = await BonusTrailGameCard.findById(gameId);
    const users = await BonusTrailgameuser.find({
      game_id: gameId,
      bait_status: gameCard.winstatus,
    });
    for (const user of users) {
      const updatedCoins = user.coins + user.baitCoins * 1.98;

      // Update the coins field in the user document
      await BonusTrailgameuser.updateOne(
        { _id: user._id },
        { $set: { coins: updatedCoins, bait_status: "", baitCoins: 0 } }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handleBait, baitWinHandler };
