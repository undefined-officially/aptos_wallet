const axios = require("axios");
const { AptosAccount, AptosClient, TokenClient, HexString, Network } = require("aptos");
require("dotenv").config();

const { Account, Ed25519PrivateKey, Aptos, AptosConfig } = require('@aptos-labs/ts-sdk');

const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

async function main () {
    // Step 1: Initialize Aptos Account and Client
    // const privateKeyHex = process.env.PETRA_PRIVATE_KEY_DEVNET;
    const privateKeyHex = process.env.APTOS_PRIVATE_KEY_TEST;
    if (!privateKeyHex) throw new Error("Private key not found in .env file");

    const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
    const client = new AptosClient(NODE_URL);
    const tokenClient = new TokenClient(client);
    const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));
    // const wallet = Account.generate();
    // console.log('wallet create ===>', wallet.privateKey.toString())
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

    console.log('Transaction finalized:', createCollectionTxn);
    const resultCollection = await client.waitForTransaction(createCollectionTxn);
    console.log('result createCollection', resultCollection)

    const nfts = [
        {
            name: "JEERA #1",
            description: "First NFT in the collection Name's JEERA #1",
            uri: "ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4",
        },
        // {
        //     name: "JEERA #2",
        //     description: "First NFT in the collection Name's JEERA #2",
        //     uri: "ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4",
        // },
        // {
        //     name: "JEERA #3",
        //     description: "First NFT in the collection Name's JEERA #3",
        //     uri: "ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4",
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
    }

    console.log("Minted all NFTs successfully!");
}

main();
