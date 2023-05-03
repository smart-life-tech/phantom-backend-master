const jwt = require("jsonwebtoken");
const web3 = require("@solana/web3.js");
const token = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const { initializeKeypair } = require("../intializeKeypair");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: "30d",
  })
}

const checkToken = (token) => {
  try{
    const key =process.env.JWT_SECRETE
    const decoded = jwt.verify(token,key);
    return decoded
}catch(error){
  return null
}
}

const createCustomTokenForUser =async (address) => {
  try {

//     const connectionss = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
//     const users = await initializeKeypair(connectionss);
  
//     const decimal = 4;
//   const HDRLs = await token.createMint(
//     connectionss,
//     users,
//     users.publicKey,
//     users.publicKey,
//     decimal
//   );
// console.log({users,HDRLs,},users.publicKey)


    const connection = new web3.Connection("https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc", "confirmed"); //lts test this 
    const user = await initializeKeypair(connection);
  
    const decimals = 4;
    const myAddress = new PublicKey(address);
   console.log({myAddress,user,decimals},user.publicKey)
    // const owner = user.publicKey;

  const HDRL = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  const PHRL = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  const FDRL = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  console.log({HDRL,PHRL,FDRL})
  const newHDRLAccount = await token.createAssociatedTokenAccount(
    connection,
    user,
   HDRL,
   myAddress
  );
  const newFDRLAccount = await token.createAssociatedTokenAccount(
    connection,
    user,
   FDRL,
   myAddress
  );
  const newPHRLAccount = await token.createAssociatedTokenAccount(
    connection,
    user,
   PHRL,
   myAddress
  );
  
    console.log({newFDRLAccount,newHDRLAccount,newPHRLAccount})
  const HDRLAccountInfo = await token.getAccount(
    connection,
    newHDRLAccount
  )
  const PHRLAccountInfo = await token.getAccount(
    connection,
    newPHRLAccount
  )
  const FDRLAccountInfo = await token.getAccount(
    connection,
    newFDRLAccount
  )


  // const transactionSignature = await token.mintTo(
  //   connection,
  //   payer,
  //  HDRL,
  //   newTokenAccount,
  //   user, // Replace `user` with the receiver's public key
  //   3 * 10 ** mintInfo.decimals
  // );
  // console.log(
  //   `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  // );
  return {
    HDRLAccountInfo:HDRLAccountInfo.address.toBase58(),
    FDRLAccountInfo:FDRLAccountInfo.address.toBase58(),
    PHRLAccountInfo:PHRLAccountInfo.address.toBase58(),
    HDRL:HDRL.toBase58(),
    FDRL:FDRL.toBase58(),
    PHRL:PHRL.toBase58()

  }

  }catch(error){
    console.log({error})
  }
}

 const changeFrequencyTodays = (
  interval
)=> {
  console.log({interval})
  let date = new Date();
  let startTime = Math.round(date.getTime() / (1000 * 60));
  let nextTime = startTime + interval
  let endSub = 30* 24 * 60
  return { startTime,nextTime,endSub };
};

module.exports = {generateToken, checkToken,createCustomTokenForUser,changeFrequencyTodays};