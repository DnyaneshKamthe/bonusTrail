const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");
const { GenerateCardsName } = require("../utils/CardNameGenerator");
const { BonusTrailAdminAmount } = require("../models/bonusTrail.game.admin");
const { checkHandsRanking } = require("../utils/handsCheckers");
const {
  randomGameIdGenerator,
  randomDigitGenerator3,
} = require("../utils/randomNumberGenerators");
const { shuffle } = require("../utils/shuffle");
const { highCardsGenerator } = require("../utils/highCardsGenerator");
const { bonusTrailGameHistory, winStatusObj, handsName } = require("../Constants/constant");
const { gameHistoryData } = require("../utils/gameHistoryData");

const cardID = { cardID: null };
let deck = [];
let flag = true;
var resultCards = [];
var cardsRanking = 5;


const MainGameIdGenerator = async () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  try {
    deck = [];

    for (const rank of ranks) {
      for (const suit of suits) {
        const card = { rank, suit };
        deck.push(card);
      }
    }
    //shuffle deck
    shuffle(deck);

    const GameId = randomGameIdGenerator();

    let mainGame = new BonusTrailGameCard({
      gameid: GameId,
      player1_amount: 0,
      player2_amount: 0,
      total: 0,
      player1Cards: [],
      player2Cards: [],
      winstatus: "",
    });
    let cardCreated = await mainGame.save();
    cardID.cardID = cardCreated._id;
  } catch (error) {
    console.log(error);
  }
};

// gameCardHandler

const gameCardHandler = async (gameCardId) => {
  flag = true;

  try {
    if (deck.length > 0) {
      const mainGameCard = await BonusTrailGameCard.findById(gameCardId);

      if (!mainGameCard) {
        console.log({ msg: "mainGame not found" });
      }
      resultCards = [];
      for (let i = 0; i < 3; i++) {
        const randomNum = randomDigitGenerator3();
        const drawcards = deck[randomNum];
        resultCards.push(drawcards);
      }

      cardsRanking = checkHandsRanking(resultCards);

      let multiplyer = {
        0: 1,
        1: 2, //pair
        2: 4, //color
        3: 6, //sequence
        4: 20, // pure sequence
        5: 40, //trail
      };

      //admin Amount
      let adminAmount = await BonusTrailAdminAmount.find();
      if(adminAmount.length<=0){
        adminAmount=await BonusTrailAdminAmount()
        await adminAmount.save()
      }
     console.log(adminAmount);

      while (flag == true) {
        if (
          adminAmount[0].amount <
            mainGameCard.total * multiplyer[cardsRanking] &&
          cardsRanking !== 0
        ) {
          const { genCardsRanking, genResultCards } = highCardsGenerator(deck);
          cardsRanking = genCardsRanking;
          resultCards = [...genResultCards];
        } else if (
          adminAmount[0].amount >
          mainGameCard.total * multiplyer[cardsRanking]
        ) {
          let cardsName = GenerateCardsName(resultCards);
          mainGameCard.finalCards = cardsName;
          // finalCards
          if (cardsRanking > 0) {
            adminAmount[0].amount -= mainGameCard.total;
            mainGameCard.winstatus = winStatusObj.YOU_WIN;
          } else if (cardsRanking <= 0) {
            adminAmount[0].amount += mainGameCard.total;
            mainGameCard.winstatus = winStatusObj.YOU_LOSS;
          }
          flag = false;
          break;
        } else {
          let cardsName = GenerateCardsName(resultCards);

          mainGameCard.finalCards = cardsName;
          // finalCards
          if (cardsRanking > 0) {
            adminAmount[0].amount -= mainGameCard.total;
            mainGameCard.winstatus = winStatusObj.YOU_WIN;
          } else if (cardsRanking <= 0) {
            adminAmount[0].amount += mainGameCard.total;
            mainGameCard.winstatus = winStatusObj.YOU_LOSS;
          }
    
          flag = false;
          break;
        }
      }

      if (cardsRanking == 5) {
        mainGameCard.winnerSet = handsName.TRAIL
      } else if (cardsRanking == 4) {
        mainGameCard.winnerSet = handsName.PURE_SEQUENCE;
      } else if (cardsRanking == 3) {
        mainGameCard.winnerSet = handsName.SEQUENCE;
      } else if (cardsRanking == 2) {
        mainGameCard.winnerSet = handsName.COLOR;
      } else if (cardsRanking == 1) {
        mainGameCard.winnerSet = handsName.PAIR;
      } else if (cardsRanking == 0) {
        mainGameCard.winnerSet = handsName.HIGH_CARDS;
      }

      //game history logic
      let winValue = mainGameCard.winstatus == winStatusObj.YOU_WIN ? "UW" : "UL";
      gameHistoryData(winValue, bonusTrailGameHistory);

      await mainGameCard.save();
      await adminAmount[0].save();
      console.log("maincard", mainGameCard);
    }
  } catch (error) {
    console.log({ msg: "error in gamehandlerfunction-", error: error });
  }
};




module.exports = { MainGameIdGenerator, gameCardHandler, cardID };
