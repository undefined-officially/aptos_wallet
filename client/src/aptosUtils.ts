// import { AptosClient, AptosAccount, FaucetClient } from '@aptos-labs/ts-sdk';
import { Account, Aptos, AptosConfig, Ed25519Account, Network } from '@aptos-labs/ts-sdk';
import { AptosClient } from 'aptos';

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

export const createWallet = async (): Promise<Ed25519Account> => {
  const wallet = Account.generate();
  return wallet;
};

export const fundWallet = async (address: string, amount: number) => {
  try {
    for (let i = 1; i < amount; i++) {
      const fundResult = await aptos.fundAccount({
        accountAddress: address,
        amount: 100_000_000
      });
      console.log('fundResult =>', fundResult);
    }
  } catch (error) {
    console.log('fundWallet error ==>', error);
  }
};

export const getBalance = async (address: string): Promise<number> => {
  return await aptos.getAccountAPTAmount({
    accountAddress: address
  });
};

export const transferFunds = async (sender: Account, recipient: string, amount: number) => {
  const rawtransaction = await aptos.transferCoinTransaction({
    sender: sender.accountAddress,
    recipient: recipient,
    amount: amount
  });

  const transaction = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction: rawtransaction
  });

  const hashResult = await aptos.waitForTransaction({
    transactionHash: transaction.hash
  });

  console.log('hashResult =>', hashResult);
  return hashResult;
};

export const getOwnedDigitalAssets = async (accountAddress: string, network: Network = Network.MAINNET) => {
  const aptos = new Aptos(new AptosConfig({ network: network }));
  const digitalAsset = await aptos.getOwnedDigitalAssets({
    ownerAddress: accountAddress,
    minimumLedgerVersion: 1
  });
  console.log('getOwnedDigitalAssets ==>', network, accountAddress, digitalAsset);

  return digitalAsset;
};
