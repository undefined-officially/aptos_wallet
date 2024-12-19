import { AptosAccount, AptosClient, HexString } from "aptos";
import dotenv from 'dotenv';
dotenv.config();

const DEVNET_NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
const client = new AptosClient(DEVNET_NODE_URL);

// Load private key from .env
const privateKeyHex = process.env.PETRA_PRIVATE_KEY_DEVNET || '0x00';
console.log('privateKeyHex ==>', privateKeyHex)
if (!privateKeyHex) {
    throw new Error('Private key not found in .env file');
}

// Create an Aptos account from the private key
const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
console.log('Account address:', account.address().hex());

/**
 * Create a new collection on the Aptos blockchain.
 */
async function createCollection () {
    const collectionName = 'UDF Avatar';
    const description = 'UDF Avatar';
    const uri = 'ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4'; // Link to collection metadata

    const payload = {
        type: 'entry_function_payload',
        function: '0x3::token::create_collection_script',
        arguments: [collectionName, description, uri, false], // `false` for not mutable
        type_arguments: [],
    };

    try {
        const txnRequest = await client.generateTransaction(account.address(), payload);
        const signedTxn = await client.signTransaction(account, txnRequest);
        const txnHash = await client.submitTransaction(signedTxn);
        await client.waitForTransaction(txnHash.hash);

        console.log(`Collection "${collectionName}" created with transaction hash: ${txnHash.hash}`);
        return collectionName;
    } catch (error) {
        console.error('Error creating collection:', error);
    }
}

/**
 * Create a new token in the collection.
 */
async function createToken (collectionName) {
    const tokenName = 'JEERA #1';
    const description = 'JEERA A unique image NFT';
    const supply = 1; // Fixed supply for a 1/1 NFT
    const uri = 'ipfs://bafkreieyjarcmzmekblzfu5k4522vhlxvn74moiskaltc6fcd56rwdz4b4'; // Link to NFT image or metadata

    const payload = {
        type: 'entry_function_payload',
        function: '0x3::token::create_token_script',
        arguments: [
            collectionName,
            tokenName,
            description,
            supply,
            uri,
            account.address(), // Royalty payee
            0,                 // Royalty amount (0%)
            0,                 // Royalty points denominator
            [],                // Property keys
            [],                // Property values
            [],                // Property types
            false,             // Mutable metadata
            false,             // Mutable properties
        ],
        type_arguments: [],
    };

    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const txnHash = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(txnHash.hash);

    console.log(`Token "${tokenName}" created in collection "${collectionName}" with transaction hash: ${txnHash.hash}`);
    return tokenName;
}

/**
 * Main function to create collection and mint token.
 */
async function main () {
    try {
        console.log('Creating collection...');
        const collectionName = await createCollection();

        console.log('Minting token...');
        await createToken(collectionName);

        console.log('NFT Minting process completed!');
    } catch (error) {
        console.error('Error during minting process:', error);
    }
}

main();

// Add this if you want to export functions
export { createCollection, createToken, main };
