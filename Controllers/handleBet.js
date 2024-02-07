const { BONUSTRAIL } = require("../Constants/constant");
const { UserMaster } = require("../models/bonusTrail.game");
const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");

const handlebet = (userId, socket) => {
  socket.on("bet", async (data) => {
    const { coins, cardId } = data;
    console.log("betcardid", cardId);
    try {
      const user = await UserMaster.findOne({ _id: userId });
      if (!user) {
        console.log({ msg: "user not found" });
        return;
      }
      if (user.coins <= 0 || coins <= 0 || user.coins - coins < 0) {
        console.log({ msg: "insufficient balance" });
        return;
      }

      const gameCard = await BonusTrailGameCard.findById(cardId);
      if (!gameCard) {
        console.log({ msg: "maincard not found" });
        return;
      }

      user.bonusTrailBet.bet_type = BONUSTRAIL;
      user.bonusTrailBet.betCoins += parseInt(coins);

      let updatedCoins = user.coins - parseInt(coins);

      // add main card id to user ref
      user.game_id = gameCard._id;

      user.coins = updatedCoins;

      gameCard.total += parseInt(coins);
      await gameCard.save();

      await user.save();

      socket.emit("userDetails", { user });
    } catch (error) {
      console.log({ msg: "error in bet section", error: error });
    }
  });
};

const betWinHandler = async (gameId) => {
  try {
    // const gameCard = await BonusTrailGameCard.findById(gameId);
    const users = await UserMaster.find({
      game_id: gameId,
      "bonusTrailBet.bet_type": { $in: [BONUSTRAIL, null] },
    });
    for (const user of users) {
      const updatedCoins = user.coins + user.bonusTrailBet.betCoins * 1.98;

      // Update the coins field in the user document
      await UserMaster.updateOne(
        { _id: user._id },
        {
          $set: {
            coins: updatedCoins,
            "bonusTrailBet.bet_type": null,
            "bonusTrailBet.betCoins": 0,
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handlebet, betWinHandler };
