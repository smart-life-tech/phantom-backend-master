// const express = require("express");
// const { createSub, getSub } = require("../controllers/subControllers")

// const router = express.Router();

// router.route("/").post(createSub)
// router.route("/").get(getSub)


// module.exports = router; 
const express = require("express");
const { getAuth } = require('firebase-admin/auth');
const { getDatabase, ref } = require('firebase-admin/database');
var admin = require("firebase-admin");
const token = require("@solana/spl-token");
const web3 = require("@solana/web3.js");
const cron = require("node-cron")
const { initializeKeypair } = require("../intializeKeypair");
const { createSub, getSub, getAllSubData, findUserReadings, getLatestSubData, getDataInfo } = require("../controllers/subControllers");
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



module.exports = function (io) {
  let router = express.Router()
  router.route("/").post(createSub)
  router.route("/data").post(getSub)
  router.route("/graph").get(getLatestSubData)
  router.route("/getmac").get(getDataInfo)



  const setUpFDRLToken = async (data, temperature) => {
    try {

      let FDRLPubKey = new PublicKey(data.FDRL);
      let FDRLTokenAccount = new PublicKey(data.FDRLAccountInfo)
      const connection = new web3.Connection("https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc ", "confirmed");
      const mintInfo = await token.getMint(connection, FDRLPubKey);
      const user = await initializeKeypair(connection);
      const transactionSignature = await token.mintTo(
        connection,
        user,
        FDRLPubKey,
        FDRLTokenAccount,
        user, // Replace `user` with the receiver's public key
        parseFloat(temperature.toFixed(2)) * 10 ** mintInfo.decimals
      );
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
          bundlrStorage({
            address: "https://node1.bundlr.network",
            providerUrl: "https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc",
            timeout: 60000,
          })
        );
      // file to buffer
      const buffer = fs.readFileSync("assets/fara.jpeg");

      // buffer to metaplex file
      const file = toMetaplexFile(buffer, "fara.jpeg");

      // upload image and get image uri
      const imageUri = await metaplex.storage().upload(file);

      // upload metadata and get metadata uri (off chain metadata)
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: "Fahrenheit Root Labs COIN",
        description: "for all workers of the world",
        image: imageUri,
      });

      console.log("STILL RUNNING")
      // get metadata account address
      const metadataPDA = await findMetadataPda(FDRLPubKey);

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

      // send transaction
      // const transactionSignature2 = await web3.sendAndConfirmTransaction(
      //   connection,
      //   transaction,
      //   [user]
      // );
    } catch (e) {
      console.log({ e })
    }
  }
  const setUpHDRLToken = async (data, humidity) => {
    try {
      let HDRLPubKey = new PublicKey(data.HDRL);
      let HDRLTokenAccount = new PublicKey(data.HDRLAccountInfo)
      const connection = new web3.Connection("https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc ", "confirmed");
      const mintInfo = await token.getMint(connection, HDRLPubKey);
      const user = await initializeKeypair(connection);
      const transactionSignature = await token.mintTo(
        connection,
        user,
        HDRLPubKey,
        HDRLTokenAccount,
        user, // Replace `user` with the receiver's public key
        parseFloat(humidity.toFixed(2)) * 10 ** mintInfo.decimals
      );
      // metaplex setup
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
          bundlrStorage({
            address: "https://node1.bundlr.network",
            providerUrl: "https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc",
            timeout: 60000,
          })
        );
      // file to buffer
      const buffer = fs.readFileSync("assets/hum.jpeg");

      // buffer to metaplex file
      const file = toMetaplexFile(buffer, "hum.jpeg");

      // upload image and get image uri
      const imageUri = await metaplex.storage().upload(file);

      // upload metadata and get metadata uri (off chain metadata)
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: "HUMIDITY Root Labs COIN",
        description: "for all workers of the world",
        image: imageUri,
      })

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
      const transactionSignature2 = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [user]
      );
    } catch (e) {
      console.log({ e })
    }
  }
  const setUpPHRLToken = async (data, phVal) => {
    try {

      let PHRLPubKey = new PublicKey(data.PHRL);
      let PHRLTokenAccount = new PublicKey(data.PHRLAccountInfo)
      const connection = new web3.Connection("https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc ", "confirmed");
      const mintInfo = await token.getMint(connection, PHRLPubKey);
      const user = await initializeKeypair(connection);
      const transactionSignature = await token.mintTo(
        connection,
        user,
        PHRLPubKey,
        PHRLTokenAccount,
        user, // Replace `user` with the receiver's public key
        parseFloat(phVal.toFixed(2)) * 10 ** mintInfo.decimals
      );
      // metaplex setup
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
          bundlrStorage({
            address: "https://node1.bundlr.network",
            providerUrl: "https://solana-api.syndica.io/access-token/zUgRFScqFcVnQm688ippwlL9R2BrI1qH7nXzjub9z9X7CslBRYxEGyXCGiZm4rq6/rpc",
            timeout: 60000,
          })
        );

      // file to buffer
      const buffer = fs.readFileSync("assets/ph.png");

      // buffer to metaplex file
      const file = toMetaplexFile(buffer, "ph.png");

      // upload image and get image uri
      const imageUri = await metaplex.storage().upload(file);

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

    } catch (e) {
      console.log({ e })
    }
  }


  const runBlockchainTransaction = async (data, temperature, humidity, phVal) => {
    console.log("START RUNNING")
    await setUpFDRLToken(data, temperature)
    await setUpHDRLToken(data, humidity)
    await setUpPHRLToken(data, phVal)
    return "completed"
  }


  const checkUserData = async () => {
    try {

      const allSubscription = await getAllSubData()
      console.log({ allSubscription })
      const ValidSubscription = allSubscription.filter((subscription) => {
        const totalDurationInMinutes = parseInt(subscription.startTime) + parseInt(subscription.endSub)
        const date = new Date();
        const currentTimeInMinutes = date.getTime() / 60000; //minutes
        if (totalDurationInMinutes > currentTimeInMinutes && subscription.hasActiveSub) {
          let startTimeMinutes = parseInt(subscription.startTime) + (subscription.subRatePerMin * (subscription.noOfTransaction + 1))
          console.log({ currentTimeInMinutes }, subscription.nextTime)
          if (subscription.nextTime <= parseInt(currentTimeInMinutes) && subscription.hasActiveSub) {
            console.log("yes")
            return subscription
          }
        } else {
          // change avtive subscription to false
          return null
        }
      })
      console.log({ ValidSubscription }, ValidSubscription.length)
      if (ValidSubscription.length > 0) {
        await Promise.all(ValidSubscription.map(async data => {
          const { temperature, humidity, phVal, date } = await findUserReadings(data.MacAddress)
          const dateConv = new Date(date);
          const secondsConv = dateConv.getTime() / 1000; // seconds
          const currentTimeInSeconds = parseInt(new Date().getTime() / 1000)
          const dateDiff = currentTimeInSeconds - parseInt(secondsConv)
          const maxDateDiff = 3 * 60 * 60
          console.log({temperature,humidity,date,data})
          if (dateDiff < maxDateDiff) {
            if (temperature) {
              console.log("eeee")
              let date = new Date();
              let currentTimeInMinutes = Math.round(date.getTime() / (1000 * 60));
              const nextFrequencyData = currentTimeInMinutes + parseInt(data.subRatePerMin)
              const totalDurationInMinutes = parseInt(data.startTime) + parseInt(data.endSub)
              console.log({ nextFrequencyData, currentTimeInMinutes, totalDurationInMinutes })
              let active = currentTimeInMinutes > totalDurationInMinutes ? false : true
              console.log({ active })
              await Sub.findByIdAndUpdate(data._id, {
                hasActiveSub: active,
                noOfTransaction: data.noOfTransaction + 1,
                nextTime: `${nextFrequencyData}`

              })
              const result = await runBlockchainTransaction(data, temperature, humidity, phVal)
              if (result === "completed") {
                console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj completed")
                io.emit("success", {
                  data: { temperature, humidity, phVal },
                  status: true
                }
                )


              }
            } else {
              return
            }
          } else {
            console.log("dont run")
          }


        })
        )
      } else {
        return
      }

    } catch (e) {
      console.log({ e })
    }
  }


  cron.schedule('* * * * *',checkUserData)


  return router
}
