const {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    findMetadataPda,
  } = require("@metaplex-foundation/js");
  const {
    createCreateMetadataAccountV2Instruction,
  } = require("@metaplex-foundation/mpl-token-metadata");
  const fs = require("fs");
  
  const { initializeKeypair } =require("./intializeKeypair");
  const web3 = require("@solana/web3.js");
  const token = require("@solana/spl-token");
  const { PublicKey } = require("@solana/web3.js");
 
  
  async function main() {
    // Variables
    // my wallet address = 9etdXNVKagNphUuhP9MojkZ7TWwkdQx4FU8V4HXuWWeD
    const connection = new web3.Connection(web3.clusterApiUrl("mainnet"));
    const user = await initializeKeypair(connection);
    const payer = user;
  
    console.log({user,payer})
    const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
   
    const owner = user.publicKey;
  console.log({owner,})
    // Instructions
  
    // Create Token
    // const tokenMint = await token.createMint(
    //   connection,
    //   user,
    //   user.publicKey,
    //   user.publicKey,
    //   decimals
    // );
    // console.log({tokenMint})
  
    let tokenPubKey = new PublicKey('6h35r4cwit4pEsJw4H7Hi5sWMDjS4RYZ2nL21URZEidj');
    const mintInfoData = await token.getMint(
      connection,
      tokenPubKey
    )
    
    console.log({tokenPubKey})
    console.log(mintInfoData.supply,"supppplllllliiy");
    console.log("TOKEN MINT BİLGİLERİ:");
    console.log(`The token mint account address is ${tokenPubKey}`);
    console.log(
      `Token Mint: https://explorer.solana.com/address/${tokenPubKey}?cluster=mainnet`
    );
  
    // Create Token Account
    //  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
      connection,
      user,
      tokenPubKey,
      myAddress
    );
    
  console.log({tokenAccount,address:tokenAccount.address})
    console.log(tokenAccount.address,"tokenaccount address");
  
    const tokenAccountInfo = await token.getAccount(
      connection,
      tokenAccount.address
    )
    
    console.log(tokenAccountInfo.amount,"amount of token above here");
    // Mint Token
    const mintInfo = await token.getMint(connection, tokenPubKey);
    // Check if user already has a token account
    if (tokenAccount) {
      // Mint tokens to existing token account by adding the amount to the existing balance
      console.log("yes there is a token account")
      const transactionSignature = await token.mintTo(
        connection,
        payer,
        tokenPubKey,
        tokenAccount.address,
        user, // Replace `user` with the receiver's public key
        3 * 10 ** mintInfo.decimals
      );
      console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
      );
    } else {
      console.log("no there is no token account")
      // Create a new token account and mint tokens to that account with the given amount
      const newTokenAccount = await token.createAssociatedTokenAccount(
        connection,
        user,
        myAddress,
       tokenPubKey
      );
      const transactionSignature = await token.mintTo(
        connection,
        payer,
       tokenPubKey,
        newTokenAccount,
        user, // Replace `user` with the receiver's public key
        3 * 10 ** mintInfo.decimals
      );
      console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
      );
    }
    // metaplex setup
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://mainnet.bundlr.network",
          providerUrl: "https://api.mainnet.solana.com",
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
  
    console.log("metadata uri:", uri);
  
    // get metadata account address
    const metadataPDA = await findMetadataPda(tokenPubKey);
    console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);
  
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
  
    console.log("=============================");
    console.log("CREATING TRANSACTION");
    console.log("=============================");
    // transaction to create metadata account
    const transaction = new web3.Transaction().add(
      createCreateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          mint: tokenPubKey,
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
  
    console.log(`METADATA TRANSACTİON : ${transaction}`);
    console.log("=============================");
    console.log("BEGIN SEND AND CONFIRMTRANSACTION");
    // send transaction
    const transactionSignature2 = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [user]
    );
  
    console.log(
      `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=mainnet`
    );
    console.log("PublicKey:", user.publicKey.toBase58());
  }
  async function main2() {
    // Variables
    const connection = new web3.Connection(web3.clusterApiUrl("mainnet"));
    const user = await initializeKeypair(connection);
    const payer = user;
    const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
    const mintAuthority = user.publicKey;
    const freezeAuthority = user.publicKey;
    const decimals = 4;
    const owner = user.publicKey;
  
    // Instructions
    // Create Token
    const tokenMint = await token.createMint(
      connection,
      user,
      user.publicKey,
      user.publicKey,
      decimals
    );
    console.log("TOKEN MINT BİLGİLERİ:");
    console.log(`The token mint account address is ${tokenMint}`);
    console.log(
      `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=mainnet`
    );
  
    // Create Token Account
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
      connection,
      user,
      tokenMint,
      myAddress
    );
    // Mint Token
    const mintInfo = await token.getMint(connection, tokenMint);
  
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMint,
      tokenAccount.address,
      user,
      3 * 10 ** mintInfo.decimals
    );
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
    );
    // end mint token
  
    // metaplex setup
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://mainnet.bundlr.network",
          providerUrl: "https://api.mainnet.solana.com",
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
    });
  
    console.log("metadata uri:", uri);
  
    // get metadata account address
    const metadataPDA = await findMetadataPda(tokenMint);
    console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);
  
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
  
    console.log("=============================");
    console.log("CREATING TRANSACTION");
    console.log("=============================");
    // transaction to create metadata account
    const transaction = new web3.Transaction().add(
      createCreateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          mint: tokenMint,
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
  
    console.log(`METADATA TRANSACTİON : ${transaction}`);
    console.log("=============================");
    console.log("BEGIN SENDANDCONFIRMTRANSACTION");
    // send transaction
    const transactionSignature2 = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [user]
    );
  
    console.log(
      `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=mainnet`
    );
    console.log("PublicKey:", user.publicKey.toBase58());
  }
  async function main3() {
    // Variables
    const connection = new web3.Connection(web3.clusterApiUrl("mainnet"));
    const user = await initializeKeypair(connection);
    const payer = user;
    const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
    const mintAuthority = user.publicKey;
    const freezeAuthority = user.publicKey;
    const decimals = 4;
    const owner = user.publicKey;
  
    // Instructions
    // Create Token
    const tokenMint = await token.createMint(
      connection,
      user,
      user.publicKey,
      user.publicKey,
      decimals
    );
    console.log("TOKEN MINT BİLGİLERİ:");
    console.log(`The token mint account address is ${tokenMint}`);
    console.log(
      `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=mainnet`
    );
  
    const tokenATA = await token.getAssociatedTokenAddress(
      user.publicKey,
      user.publicKey
    )
    console.log("token account found")
    const receiverTokenAccount = await token.getAccount(connection, tokenATA);
    console.log(receiverTokenAccount)
    if (!receiverTokenAccount) {
      // Create receiver's token account if it does not exist
      await token.getOrCreateAssociatedTokenAccount(connection, user, tokenMint, myAddress);
    }
  
    // Mint Token
    const mintInfo = await token.getMint(connection, tokenMint);
  
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMint,
      receiverTokenAccount.address,
      user,
      3 * 10 ** mintInfo.decimals
    );
  
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
    );
    // end mint token
  
    // metaplex setup
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://mainnet.bundlr.network",
          providerUrl: "https://api.mainnet.solana.com",
          timeout: 60000,
        })
      );
  
    // file to buffer
    const buffer = fs.readFileSync("assets/ph.png");
  
    // buffer to metaplex file
    const file = toMetaplexFile(buffer, "ph.png");
  
    // upload image and get image uri
    const imageUri = await metaplex.storage().upload(file);
    console.log("image uri:", imageUri);
  
    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "PH Root Labs COIN",
      description: "for all workers of the world",
      image: imageUri,
    });
  
    console.log("metadata uri:", uri);
  
    // get metadata account address
    const metadataPDA = await findMetadataPda(tokenMint);
    console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);
  
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
  
    console.log("=============================");
    console.log("CREATING TRANSACTION");
    console.log("=============================");
    // transaction to create metadata account
    const transaction = new web3.Transaction().add(
      createCreateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          mint: tokenMint,
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
  
    console.log(`METADATA TRANSACTİON : ${transaction}`);
    console.log("=============================");
    console.log("BEGIN SEND AND CONFIRMTRANSACTION");
    // send transaction
    const transactionSignature2 = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [user]
    );
  
    console.log(
      `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=mainnet`
    );
    console.log("PublicKey:", user.publicKey.toBase58());
  }
  async function main4() {
    async function main4() {
      const connection = new web3.Connection(web3.clusterApiUrl("mainnet"));
      const user = await initializeKeypair(connection);
      const payer = user;
      const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
     
      const decimals = 4;
      const owner = user.publicKey;
  
      const tokenMint = await token.createMint(
        connection,
        user,
        user.publicKey,
        user.publicKey,
        decimals
      );
      const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        user,
        tokenMint,
        myAddress
      );
      console.log(tokenAccount.address);
      // Mint Token
      const mintInfo = await token.getMint(connection, tokenMint);
  
      // Check if user already has a token account
      if (tokenAccount) {
        // Mint tokens to existing token account by adding the amount to the existing balance
        const transactionSignature = await token.mintTo(
          connection,
          payer,
          tokenMint,
          tokenAccount.address,
          user, // Replace `user` with the receiver's public key
          3 * 10 ** mintInfo.decimals
        );
        console.log(
          `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
        );
      } else {
        // Create a new token account and mint tokens to that account with the given amount
        const newTokenAccount = await token.createAssociatedTokenAccount(
          connection,
          user,
          myAddress,
          tokenMint
        );
        const transactionSignature = await token.mintTo(
          connection,
          payer,
          tokenMint,
          newTokenAccount,
          user, // Replace `user` with the receiver's public key
          3 * 10 ** mintInfo.decimals
        );
        console.log(
          `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
        );
      }
    }
  }
  main()
    .then(() => {
      console.log("Finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
  