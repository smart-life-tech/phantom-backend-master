









const setUpHDRLToken = async (data,humidity) =>{
    try{
        
            let HDRLPubKey = new PublicKey(data.HDRL);
            let HDRLTokenAccount = new PublicKey(data.HDRLAccountInfo)
             const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
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
    
              // console.log(
              //   `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
              // );
                  // metaplex setup
        const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
          bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
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
      const transactionSignature2 = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [user]
      );
    }catch(e){
        console.log({e})
    }
        }