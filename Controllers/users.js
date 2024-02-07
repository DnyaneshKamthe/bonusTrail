// userId,socket.id,socket

const { UserMaster } = require("../models/bonusTrail.game");

// const {GameUser}
const registerUser = async (userId, socket) => {
  try {
    const user = await UserMaster.findOne({_id:userId});

    if (!user) {
      throw new Error({ msg: "user not found" });
    }
    if (user.coins <= 0) {
         user.coins=10000
      }
     
      await user.save();
  
    socket.emit("userDetails", {
      user,
    });
  } catch (error) {
    console.error("Error initializing game state:", error.message);
  }
};


const updatedUserAfterWin =(userId,socket)=>{
    socket.on("getUpdatedUserDetails",async()=>{
      let user = await UserMaster.findOne({ _id: userId });
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


