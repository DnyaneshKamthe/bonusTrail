const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");
const { CardNameGenerator } = require("../utils/CardNameGenerator");
const { BonusTrailAdminAmount } = require("../models/bonusTrail.game.admin");
const {
  isTrail,
  isPureSequence,
  isSequence,
  isColor,
  isPair,
} = require("../utils/handsCheckers");
const {
  randomNumberGenerator1,
  randomGameIdGenerator,
  randomNumberGenerator2,
  randomDigitGenerator3,
} = require("../utils/randomNumberGenerators");
const { shuffle } = require("../utils/shuffle");

const cardID = { cardID: null };
let deck = [];
let flag = true;
var resultCards = [];

const highCardsGenerator = (deck) => {
  // while(cardsRanking != 0){
  resultCards = [];
  console.log("resultcards", resultCards);
  for (let i = 0; i < 3; i++) {
    const randomNum = randomDigitGenerator3();
    const drawcards = deck[randomNum];
    resultCards.push(drawcards);
  }
  console.log("deck", deck.length, resultCards);

  cardsRanking = checkHandsRanking(resultCards);
  return cardsRanking;
  // }
};

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
  console.log("flag1",flag);
  var cardsRanking = 5;
  try {
    if (deck.length > 0) {
      const mainGameCard = await BonusTrailGameCard.findById(gameCardId);

      if (!mainGameCard) {
        // socket.emit("gamecardError", { msg: "mainGame not Found" });
        console.log({ msg: "mainGame not found" });
      }
      resultCards = [];
      for (let i = 0; i < 3; i++) {
        const randomNum = randomDigitGenerator3();
        const drawcards = deck[randomNum];
        resultCards.push(drawcards);
      }
      console.log("deck", deck.length, resultCards);

      cardsRanking = checkHandsRanking(resultCards);

      let multiplyer = {
        0:1,
        1: 2, //pair
        2: 4, //color
        3: 6, //sequence
        4: 20, // pure sequence
        5: 40, //trail
      };

      //admin Amount
      const adminAmount = await BonusTrailAdminAmount.find();
      console.log("amount", adminAmount[0].amount);

      while (flag == true) {
        if (
          adminAmount[0].amount <
          mainGameCard.total * multiplyer[cardsRanking] && cardsRanking!==0
        ) {
          const v=highCardsGenerator(deck);
          console.log("abeeeeeeeeeeeeeee baitada",v);
        } else if (
          adminAmount[0].amount >
          mainGameCard.total * multiplyer[cardsRanking]
        ) {
          let cardsName = GenerateCardsName(resultCards);
          mainGameCard.finalCards = cardsName;
          // finalCards
          adminAmount[0].amount -= mainGameCard.total;
          mainGameCard.winstatus = "You Win";
          flag = false;
          console.log("flag2",flag);
          break;
        } else {
          let cardsName = GenerateCardsName(resultCards);

          mainGameCard.finalCards = cardsName;
          // finalCards
          adminAmount[0].amount += mainGameCard.total;
          mainGameCard.winstatus = "You Loss";
          flag = false;
          console.log("flag3",flag);
          break;
        }
      }

      // // const side2cardsRanking = checkHandsRanking(side2Cards);
      // // console.log("side1cardsRanking", side1cardsRanking);
      // console.log("cardsRanking", cardsRanking);
      // let cardNames = GenerateCardsName(resultCards);
      // // let p2 = GenerateCardsName(side2Cards);
      // console.log("cardNames", cardNames);
      // // console.log("p2", p2);
      // var ranking = 5;

      await mainGameCard.save();
      await adminAmount[0].save();
      console.log("maincard", mainGameCard);
      console.log("adminAmount-154", adminAmount);
      // })
    }
  } catch (error) {
    console.log({ msg: "error in gamehandlerfunction-", error: error });
  }
};

const checkHandsRanking = (cards) => {
  if (isTrail(cards)) {
    return 5; // Trail
  } else if (isPureSequence(cards)) {
    return 4; // pure Sequence
  } else if (isSequence(cards)) {
    return 3; // Sequence
  } else if (isColor(cards)) {
    return 2; //color
  } else if (isPair(cards)) {
    return 1; // Pair
  } else {
    return 0; // High cards
  }
};

const GenerateCardsName = (cards) => {
  return cards.map((card) => CardNameGenerator(card));
};

module.exports = { MainGameIdGenerator, gameCardHandler, cardID };
