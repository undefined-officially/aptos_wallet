const axios = require("axios");
const { AptosAccount, AptosClient, TokenClient, HexString, Network } = require("aptos");
require("dotenv").config();

const { Account, Ed25519PrivateKey, Aptos, AptosConfig } = require('@aptos-labs/ts-sdk');

const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

async function main () {
    // Step 1: Initialize Aptos Account and Client
    const privateKeyHex = process.env.PETRA_PRIVATE_KEY_DEVNET;
    if (!privateKeyHex) throw new Error("Private key not found in .env file");

    const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
    // const account = Account({
    //     privateKey: new Ed25519PrivateKey(privateKeyHex)
    // });
    const client = new AptosClient(NODE_URL);
    const tokenClient = new TokenClient(client);
    const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

    console.log("Account Address:", account.address().toString());

    // Step 2: Create a Collection
    const collectionName = 'UDF Avatar';
    const createCollectionTxn = await tokenClient.createCollection(
        account,
        collectionName,                     // Collection name
        "UDF Avatar", // Description
        "ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4",     // Image URL
        10                                // Max supply
    );

    console.log("Create Collection Transaction  Hash:", createCollectionTxn);
    // await client.waitForTransaction(createCollectionTxn);
    // let transactionStatus;
    // do {
    //     transactionStatus = await client.getTransactionByHash(createCollectionTxn);
    //     // console.log('Current transaction status:', transactionStatus);
    //     await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    // } while (!transactionStatus.success);

    console.log('Transaction finalized:', createCollectionTxn);
    const resultCollection = await client.waitForTransaction(createCollectionTxn);
    // const resultCollection = await aptos.waitForTransaction({
    //     transactionHash: createCollectionTxn
    // });
    console.log('result createCollection', resultCollection)

    // const chainId = await client.getChainId();
    // console.log('Connected to chain ID:', chainId);
    // const txnDetails = await client.getTransactionByHash(createCollectionTxn);
    // console.log("Transaction Details:", txnDetails?.success);

    // const resource = await client.getAccountResource(
    //     account.address(),
    //     "0x3::token::Collections"
    // );

    // console.log("Collections Resource:", resource.data);

    // Step 3: Mint an NFT
    // Step 3: Mint multiple NFTs in the same collection
    const nfts = [
        {
            name: "JEERA #1",
            description: "First NFT in the collection Name's JEERA",
            uri: "ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4",
        },
        // {
        //     name: "NFT #2",
        //     description: "Second NFT in the collection",
        //     uri: "https://fastly.picsum.photos/id/200/200/200.jpg?hmac=mk1Tu6dXHQvpaA8RfxlDUZjbWG23krNkiB9kyYoEmO8",
        // },
        // {
        //     name: "NFT #3",
        //     description: "Third NFT in the collection",
        //     uri: "https://fastly.picsum.photos/id/264/200/200.jpg?hmac=O4sRY3iZeFvmPRuanICCCZi-CDz0HdRHMsHttvNCgmw",
        // },
    ];

    for (const nft of nfts) {
        const tokenTxn = await tokenClient.createToken(
            account,
            collectionName,     // Collection name
            nft.name,           // Token name
            nft.description,    // Token description
            1,                  // Token supply (1 for single NFT)
            nft.uri             // Token metadata/image URL
        );
        console.log(`Minted ${nft.name}. Transaction hash:`, tokenTxn);
        const result = await client.waitForTransaction(tokenTxn);
        console.log(`createToken ${nft.name} :`, result)

        // const result = await aptos.waitForTransaction({
        //     transactionHash: tokenTxn
        // });
        // console.log(`createToken ${nft.name} :`, result.hash)
    }

    console.log("Minted all NFTs successfully!");

    // const ownerAddress = account.address(); // Replace with the expected owner's address
    // const tokenId = {
    //     creator: account.address().toString(),      // Address of the collection creator
    //     collection: 'MyRESTNFTCollection',      // Collection name
    //     name: 'RESTBasedNFT',                  // Token name
    // };

    // const response = await axios.get(`${NODE_URL}/accounts/${ownerAddress}/resources`);
    // const resources = response.data;

    // Filter NFT-related resources
    // const nftResources = resources.filter((resource) =>
    //     resource.type.includes("0x3::token::TokenStore")
    // );
    // console.log("NFT-related resources:", nftResources[0].data.tokens);
    // const ownerTokenBalance = await tokenClient.getToken(ownerAddress, collectionName, 'NFT #1');
    // const ownerCollectionData = await tokenClient.getCollectionData(ownerAddress, collectionName);
    // console.log('ownerCollectionData ===>', ownerCollectionData)
    // console.log('ownerTokenBalance ===>', ownerTokenBalance)
    // if (ownerTokenBalance.amount > 0) {
    //     console.log(`The address ${ownerAddress} owns the NFT.`);
    // } else {
    //     console.error(`The address ${ownerAddress} does not own the NFT.`);
    // }

    // await transferNFTs()
    // Fetch all resources associated with the account
    // const resources = await client.getAccountResources(process.env.APTOS_PRIVATE_KEY || '0x00'/*account.address().toString()*/);

    // console.log('resources ==>', resources)
    // // Filter resources for NFTs (token and collections)
    // const collections = resources.filter((resource) =>
    //     resource.type.includes("TokenStore")
    // );

    // console.log("NFT Collections:", collections[0]);

    // await getOwnedDigitalAssets(process.env.APTOS_PRIVATE_KEY || '0x00')

    // await transferAndRetrieveNFT()
}

const transferNFT = async (fromPrivateKey, toAddress, collectionName, tokenName, tokenPropertyVersion = 0, amount = 1) => {
    try {
        // Step 1: Initialize Aptos client and accounts
        const client = new AptosClient(NODE_URL);
        const tokenClient = new TokenClient(client);

        // Load sender's account from private key
        const senderAccount = new AptosAccount(HexString.ensure(fromPrivateKey).toUint8Array());
        console.log("Sender Address:", senderAccount.address().toString());

        // Step 2: Create an offer for the NFT
        const offerTxn = await tokenClient.offerToken(
            senderAccount,        // Sender's account
            toAddress,            // Receiver's wallet address
            senderAccount.address(), // Creator's address (default to sender)
            collectionName,       // Collection name
            tokenName,            // Token name
            amount,               // Number of tokens to transfer
            tokenPropertyVersion  // Property version (default is 0)
        );
        console.log("Offer Transaction Hash:", offerTxn);
        await client.waitForTransaction(offerTxn);

        console.log(`Offered ${amount} of "${tokenName}" from collection "${collectionName}" to ${toAddress}.`);

        // Step 3: Claim the token from the receiver's wallet
        console.log("Waiting for receiver to claim the token...");
        // Note: Receiver must sign this part of the transaction with their private key

        return {
            success: true,
            message: `NFT transfer offer created. Receiver must claim the token manually.`,
            offerTransactionHash: offerTxn,
        };
    } catch (error) {
        console.error("Error during NFT transfer:", error);
        return { success: false, error: error.message };
    }
};

// Example Usage
const transferNFTs = async () => {
    const fromPrivateKey = process.env.APTOS_PRIVATE_KEY_2; // Sender's private key
    const toAddress = process.env.APTOS_REAL_WALLET_ADDRESS; // Receiver's wallet address
    const collectionName = "MyRESTNFTCollection6";           // Name of the collection
    const tokenName = "NFT #1";                      // Name of the NFT
    const amount = 1;                                // Number of NFTs to transfer
    const tokenPropertyVersion = 0;                  // Property version (default is 0)

    const result = await transferNFT(fromPrivateKey, toAddress, collectionName, tokenName, tokenPropertyVersion, amount);

    console.log('transferNFTs =>', result);

    const toPrivateKey = process.env.APTOS_PRIVATE_KEY;
    const senderAccount = new AptosAccount(HexString.ensure(fromPrivateKey).toUint8Array());
    await claimNFT(toPrivateKey, senderAccount, collectionName, tokenName, tokenPropertyVersion)
}

const claimNFT = async (toPrivateKey, creatorAddress, collectionName, tokenName, tokenPropertyVersion = 0) => {
    try {
        const client = new AptosClient(NODE_URL);
        const tokenClient = new TokenClient(client);

        // Load receiver's account from private key
        const receiverAccount = new AptosAccount(HexString.ensure(toPrivateKey).toUint8Array());
        console.log("Receiver Address:", receiverAccount.address().toString());
        // console.log('creator Address:', creatorAddress)
        // Claim the token
        const claimTxn = await tokenClient.claimToken(
            receiverAccount,       // Receiver's account
            creatorAddress.address(),       // Sender's account
            creatorAddress.address(),        // Creator's address
            collectionName,        // Collection name
            tokenName,             // Token name
            tokenPropertyVersion   // Property version
        );
        console.log("Claim Transaction Hash:", claimTxn);
        await client.waitForTransaction(claimTxn);

        console.log(`Successfully claimed "${tokenName}" from collection "${collectionName}".`);
    } catch (error) {
        console.error("Error during claiming NFT:", error);
    }
};

const getOwnedDigitalAssets = async (accountAddress) => {
    const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));
    const digitalAsset = await aptos.getOwnedDigitalAssets({
        ownerAddress: accountAddress,
        minimumLedgerVersion: 1
    });
    console.log('getOwnedDigitalAssets ==>', digitalAsset);
    return digitalAsset;
};

const transferAndRetrieveNFT = async () => {
    try {
        // Configure Aptos client (use testnet or mainnet as needed)
        const config = new AptosConfig({ network: Network.DEVNET });
        const aptos = new Aptos(config);

        // Setup sender and receiver accounts
        // IMPORTANT: Replace these with your actual private keys
        const privateKeyHex = process.env.APTOS_PRIVATE_KEY_2 || '0x00'; // Full private key hex string
        console.log('privateKeyHex', privateKeyHex)
        const senderAccount = Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(privateKeyHex)
        });

        // console.log('senderAccount ==>', senderAccount)
        const receiverAddress = process.env.APTOS_REAL_WALLET_ADDRESS || '0x00';

        // NFT Transfer Parameters
        const collectionName = "MyRESTNFTCollection6";
        const tokenName = "NFT #1";

        // Prepare the transaction
        const transaction = await aptos.transaction.build.simple({
            sender: senderAccount.accountAddress,
            data: {
                function: "0x4::token::transfer",
                typeArguments: [],
                functionArguments: [
                    senderAccount.accountAddress, // from
                    receiverAddress, // to
                    collectionName,
                    tokenName,
                    "1" // amount (typically 1 for NFTs)
                ]
            }
        });

        // Sign the transaction
        const senderAuthenticator = aptos.transaction.sign({
            signer: senderAccount,
            transaction
        });

        // Submit the transaction
        const pendingTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator
        });

        // Wait for the transaction to complete
        const response = await aptos.transaction.wait.forTransaction({
            transactionHash: pendingTransaction.hash
        });

        console.log("NFT Transfer Successful!");
        console.log("Transaction Hash:", pendingTransaction.hash);

        // Attempt to retrieve NFTs (Note: this might require a custom indexer or API)
        console.log("Verifying NFT ownership...");

        // This part might need adjustment based on your specific NFT collection
        const nftQuery = await aptos.queryIndexer({
            query: {
                where: {
                    owner_address: { _eq: receiverAddress },
                    current_token_data: {
                        collection_name: { _eq: collectionName }
                    }
                }
            }
        });

        console.log("Receiver's NFTs:", JSON.stringify(nftQuery, null, 2));

    } catch (error) {
        console.error("Error transferring or retrieving NFT:", error);
    }
}

main().catch((err) => console.error(err));
