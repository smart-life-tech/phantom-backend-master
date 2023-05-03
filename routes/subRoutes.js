// const express = require("express");
// const { createSub, getSub } = require("../controllers/subControllers")

// const router = express.Router();

// router.route("/").post(createSub)
// router.route("/").get(getSub)


// module.exports = router; 
const express = require("express");
const token = require("@solana/spl-token");
const web3 = require("@solana/web3.js");
const cron = require("node-cron")
const { initializeKeypair } =require("../intializeKeypair");
const { createSub, getSub, getAllSubData, findUserReadings, getLatestSubData } = require("../controllers/subControllers");
const Readings = require("../models/readingModel");
const {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    findMetadataPda,
  } = require("@metaplex-foundation/js");
  const { PublicKey } = require("@solana/web3.js");
  const {
    createCreateMetadataAccountV2Instruction,
  } = require("@metaplex-foundation/mpl-token-metadata");
  const fs = require("fs");
  
const Sub = require("../models/subModel");

// const router = express.Router();



module.exports = function(io){ 
    let router = express.Router()
    router.route("/").post(createSub)
    router.route("/").get(getSub)
    router.route("/graph").get(getLatestSubData)



    const setUpFDRLToken = async (data,temperature) =>{
try{
    
        let FDRLPubKey = new PublicKey(data.FDRL);
        let FDRLTokenAccount = new PublicKey(data.FDRLAccountInfo)
        const connection = new web3.Connection("https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc ", "confirmed"); 
         const mintInfo = await token.getMint(connection, FDRLPubKey);
        const user = await initializeKeypair(connection);
        console.log({mintInfo,user,FDRLTokenAccount,FDRLPubKey})
        const transactionSignature = await token.mintTo(
            connection,
            user,
            FDRLPubKey,
            FDRLTokenAccount,
            user, // Replace `user` with the receiver's public key
            temperature * 10 ** mintInfo.decimals
          );

          console.log(
            `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
          );
              // metaplex setup
              console.log("kkrrrrrrrrrrrrr",keypairIdentity(user))
              const metaplex = Metaplex.make(connection)
              .use(keypairIdentity(user))
              .use(
                bundlrStorage({
                  address: "https://node1.bundlr.network",
                  providerUrl: "https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc",
                  timeout: 60000,
                })
              );
  // file to buffer
  const buffer = fs.readFileSync("assets/fara.jpeg");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "fara.jpeg");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "Fahrenheit Root Labs COIN",
    description: "for all workers of the world",
    image: imageUri,
  });

  // console.log("metadata uri:", uri);

  // get metadata account address
  const metadataPDA = await findMetadataPda(FDRLPubKey);
  // console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);

  // onchain metadata format
  const tokenMetadata = {
    name: "Fahrenheit Root Labs COIN",
    symbol: "FRLC",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: FDRLPubKey,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );
  console.log({transaction},"hghghghh")

  // send transaction
  // const transactionSignature2 = await web3.sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [user]
  // );

  // console.log(
  //   `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=mainnet`
  // );
  // console.log("PublicKey:", user.publicKey.toBase58());
}catch(e){
    console.log({e})
}
    }
    const setUpHDRLToken = async (data,humidity) =>{
try{
    
        let HDRLPubKey = new PublicKey(data.HDRL);
        let HDRLTokenAccount = new PublicKey(data.HDRLAccountInfo)
         const connection = new web3.Connection("https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc ", "confirmed"); 
         const mintInfo = await token.getMint(connection, HDRLPubKey);
        const user = await initializeKeypair(connection);
        const transactionSignature = await token.mintTo(
            connection,
            user,
            HDRLPubKey,
            HDRLTokenAccount,
            user, // Replace `user` with the receiver's public key
            parseInt(humidity) * 10 ** mintInfo.decimals
          );

          console.log(
            `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
          );
              // metaplex setup
     const metaplex = Metaplex.make(connection)
              .use(keypairIdentity(user))
              .use(
                bundlrStorage({
                  address: "https://node1.bundlr.network",
                  providerUrl: "https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc",
                  timeout: 60000,
                })
              );

  // file to buffer
  const buffer = fs.readFileSync("assets/hum.jpeg");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "hum.jpeg");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: "HUMIDITY Root Labs COIN",
        description: "for all workers of the world",
        image: imageUri,
      })
  // console.log("metadata uri:", uri);

  // get metadata account address
  const metadataPDA = await findMetadataPda(HDRLPubKey);
  // onchain metadata format
  const tokenMetadata = {
    name: "HUMIDITY Root Labs COIN",
    symbol: "HRLC",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: HDRLPubKey,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  // send transaction
  // const transactionSignature2 = await web3.sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [user]
  // );
}catch(e){
    console.log({e})
}
    }
    const setUpPHRLToken = async (data,phVal) =>{
try{
    
        let PHRLPubKey = new PublicKey(data.PHRL);
        let PHRLTokenAccount = new PublicKey(data.PHRLAccountInfo)
         const connection = new web3.Connection("https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc ", "confirmed"); 
         const mintInfo = await token.getMint(connection, PHRLPubKey);
        const user = await initializeKeypair(connection);
        const transactionSignature = await token.mintTo(
            connection,
            user,
            PHRLPubKey,
            PHRLTokenAccount,
            user, // Replace `user` with the receiver's public key
            parseInt(phVal) * 10 ** mintInfo.decimals
          );
              // metaplex setup
     const metaplex = Metaplex.make(connection)
              .use(keypairIdentity(user))
              .use(
                bundlrStorage({
                  address: "https://node1.bundlr.network",
                  providerUrl: "https://solana-api.syndica.io/access-token/tUu8UOheWsLBwF8M9BAceEzu0XvB2mjCjXERnXgtV00khusU40pcVP8lm8w7PvWr/rpc",
                  timeout: 60000,
                })
              );

  // file to buffer
  const buffer = fs.readFileSync("assets/ph.png");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "ph.png");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  // console.log("image uri:", imageUri);

    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: "PH Root Labs COIN",
        description: "for all workers of the world",
        image: imageUri,
      });
    

  // get metadata account address
  const metadataPDA = await findMetadataPda(PHRLPubKey);

  // onchain metadata format
  const tokenMetadata = {
    name: "PH Root Labs COIN",
    symbol: "PRLC",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: PHRLPubKey,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );
  // send transaction
  const transactionSignature2 = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

}catch(e){
    console.log({e})
}
    }


    const runBlockchainTransaction = async (data,temperature,humidity,phVal) => {
       
          // await setUpFDRLToken(data,temperature)
          await setUpHDRLToken(data,humidity)
          // await setUpPHRLToken(data,phVal)
          return "completed"
    }


    const checkUserData = async () =>{
        const allSubscription = await getAllSubData()
        const ValidSubscription = allSubscription.filter((subscription)=>{
            const totalDurationInMinutes =parseInt(subscription.startTime) + parseInt(subscription.endSub)
            let date = new Date();
            let currentTimeInMinutes = Math.round(date.getTime() / (1000 * 60));
            if(totalDurationInMinutes> currentTimeInMinutes && subscription.hasActiveSub){
                console.log("we are here")
                let startTimeTime = parseInt(subscription.startTime) + ( subscription.subRatePerMin * (subscription.noOfTransaction + 1))
                console.log({startTimeTime,cur:subscription.nextTime})
                if(startTimeTime === parseInt(subscription.nextTime)){
                    return subscription
                }
            }else{
                // change avtive subscription to false
                return
            }
        })
        if(ValidSubscription.length > 0) {
            await Promise.all(ValidSubscription.map(async data => {
                const {temperature,humidity,phVal} = await findUserReadings(data.MacAddress)
                if(temperature){
                  console.log("eeee")
                  // Sub.findByIdAndUpdate(data._id,{
                  //   hasActiveSub:active,
                  //   // presentDate: nextFrequencyData,
                  //   $inc: { noOfTransaction: 1, },
                  //   nextTime:`${parseInt(data.nextTime) + data.subRatePerMin}`
                
                  //  }) 
                  console.log(1234)
                  const result =await runBlockchainTransaction(data,temperature,humidity,phVal)
                if(result === "completed") {
                  console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj completed")
                  io.emit("success",{
                    data:{temperature,humidity,phVal},
                    status:true
                  }
                  )
                    const totalDurationInMinutes =parseInt(data.startTime) + parseInt(data.endSub)
                    console.log(data.startTime,data.endSub)
                    let date = new Date();
                    let currentTimeInMinutes = Math.round(date.getTime() / (1000 * 60));
                    let active = currentTimeInMinutes > totalDurationInMinutes ? false : true
                  //  Sub.findByIdAndUpdate(data._id,{
                  //   hasActiveSub:active,
                  //   // presentDate: nextFrequencyData,
                  //   $inc: { noOfTransaction: 1, },
                  //   nextTime:`${parseInt(data.nextTime) + data.subRatePerMin}`
                
                  //  }) 
                } 
                }else{
                  return
                }
               
            })
            )
        }else{
            return
        }
    }


    // cron.schedule('*/3 * * * *',checkUserData)

    return router
}
