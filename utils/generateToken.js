const jwt = require("jsonwebtoken");
const web3 = require("@solana/web3.js");
const token = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const { initializeKeypair } = require("../intializeKeypair");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: "30d",
  });
};

const checkToken = (token) => {
  try {
    const key = process.env.JWT_SECRETE;
    const decoded = jwt.verify(token, key);
    return decoded;
  } catch (error) {
    return null;
  }
};

const createCustomTokenForUser = async (address) => {
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

    const connection = new web3.Connection(
      "https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc",
      "confirmed"
    ); //lts test this
    const user = await initializeKeypair(connection);

    const decimals = 4;
    const myAddress = new PublicKey(address);
    console.log({ myAddress, user, decimals }, user.publicKey);
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
    console.log({ HDRL });
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

    console.log({ newHDRLAccount });
    const HDRLAccountInfo = await token.getAccount(connection, newHDRLAccount);
    const FDRLAccountInfo = await token.getAccount(connection, newFDRLAccount);
    const PHRLAccountInfo = await token.getAccount(connection, newPHRLAccount);
    console.log({
      HDRLAccountInfo: HDRLAccountInfo.address.toBase58(),
      FDRLAccountInfo: FDRLAccountInfo.address.toBase58(),
      PHRLAccountInfo: PHRLAccountInfo.address.toBase58(),
      HDRL: HDRL.toBase58(),
      FDRL: FDRL.toBase58(),
      PHRL: PHRL.toBase58(),
    });

    return {
      HDRLAccountInfo: HDRLAccountInfo.address.toBase58(),
      FDRLAccountInfo: FDRLAccountInfo.address.toBase58(),
      PHRLAccountInfo: PHRLAccountInfo.address.toBase58(),
      HDRL: HDRL.toBase58(),
      FDRL: FDRL.toBase58(),
      PHRL: PHRL.toBase58(),
    };
  } catch (error) {
    console.log({ error });
  }
};
const createECSensorTokenForUser = async (address) => {
  try {
    const connection = new web3.Connection(
      "https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc",
      "confirmed"
    ); //lts test this
    const user = await initializeKeypair(connection);

    const decimals = 4;
    const myAddress = new PublicKey(address);
    console.log({ myAddress, user, decimals }, user.publicKey);
    // const owner = user.publicKey;

    const ECRL = await token.createMint(
      connection,
      user,
      user.publicKey,
      user.publicKey,
      decimals
    );
    const WARL = await token.createMint(
      connection,
      user,
      user.publicKey,
      user.publicKey,
      decimals
    );
    const newECRLAccount = await token.createAssociatedTokenAccount(
      connection,
      user,
      ECRL,
      myAddress
    );
    const newWARLAccount = await token.createAssociatedTokenAccount(
      connection,
      user,
      WARL,
      myAddress
    );
    const ECRLAccountInfo = await token.getAccount(connection, newECRLAccount);
    console.log({
      ECRLAccountInfo: ECRLAccountInfo.address.toBase58(),
    });
    const WARLAccountInfo = await token.getAccount(connection, newWARLAccount);
    console.log({
      WARLAccountInfo: WARLAccountInfo.address.toBase58(),
    });

    return {
      ECRLAccountInfo: ECRLAccountInfo.address.toBase58(),
      ECRL: ECRL.toBase58(),
      WARLAccountInfo: WARLAccountInfo.address.toBase58(),
      WARL: WARL.toBase58(),
    };
  } catch (error) {
    console.log({ error });
  }
};

const changeFrequencyTodays = (interval) => {
  console.log({ interval });
  let date = new Date();
  const startTime = date.getTime() / 60000;
  let nextTime = startTime + interval;
  const days = 60;
  let endSub = days * 24 * 60;
  return { startTime, nextTime, endSub };
};

module.exports = {
  generateToken,
  checkToken,
  createCustomTokenForUser,
  changeFrequencyTodays,
  createECSensorTokenForUser,
};
