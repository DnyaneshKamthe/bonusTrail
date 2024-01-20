// userId,socket.id,socket

const { BonusTrailgameuser } = require("../models/bonusTrail.game");

// const {GameUser}
const registerUser = async (userId, socket) => {
  try {
    let user = await BonusTrailgameuser.findOne({ userId: userId });

    if (!user) {
      let userObj = new BonusTrailgameuser({
        userId,
        coins: 1000,
        bait_status: "",
        baitCoins: 0,

      });

      user = await userObj.save();
      // console.log(user);
      socket.emit("userDetails", {
        user,
      });
    } else {
      socket.emit("userDetails", {
        user,
      });
    }
  } catch (error) {
    console.error("Error initializing game state:", error.message);
  }
};


const updatedUserAfterWin =(userId,socket)=>{
    socket.on("getUpdatedUserDetails",async()=>{
      let user = await BonusTrailgameuser.findOne({ userId: userId });
        if(!user){
          console.log({msg:'user not found'})
          return
        }

        socket.emit("userDetails", {
          user,
        });
    })
}

module.exports = { registerUser,updatedUserAfterWin };


