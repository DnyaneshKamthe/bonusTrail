// CardNameGenerator
const CardNameGenerator = (card) => {
  var createCard;
  if (card?.rank == 11) {
    createCard = `${card.suit}_jack.png`;
  } else if (card?.rank == 12) {
    createCard = `${card.suit}_queen.png`;
  } else if (card?.rank == 13) {
    createCard = `${card.suit}_king.png`;
  } else if (card?.rank == 14) {
    createCard = `${card.suit}_ace.png`;
  } else if (
    card?.rank != 11 ||
    card?.rank != 12 ||
    card?.rank != 13 ||
    card?.rank != 14
  ) {
    createCard = `${card.suit}_${card.rank}.png`;
  }
  return createCard;
};

module.exports={CardNameGenerator}
