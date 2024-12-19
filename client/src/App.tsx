import { useEffect, useState } from 'react';
import { createWallet, fundWallet, getBalance, getOwnedDigitalAssets, transferFunds } from './aptosUtils';
import { Account, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';
import { Button, Input, message, Spin, Typography } from 'antd';
import { AptosWalletAdapterProvider, useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletConnector } from '@aptos-labs/wallet-adapter-mui-design';

function App() {
  const [wallet1, setWallet1] = useState<Account | null>(null);
  const [wallet2, setWallet2] = useState<Account | null>(null);
  const [wallet1Balance, setWallet1Balance] = useState(0);
  const [wallet2Balance, setWallet2Balance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [nftsW1, setNftsW1] = useState([]);
  const [nftsW2, setNftsW2] = useState([]);
  const { Text } = Typography;

  useEffect(() => {
    const setup = async () => {
      // const w1 = await createWallet();
      const w1 = Account.fromPrivateKey({
        // privateKey: new Ed25519PrivateKey('0xa133315a30fedd7af0c15909202052880375cb158cc3d90c9c1fbb7e2e162a0b')
        privateKey: new Ed25519PrivateKey('0x2a2743ebce792ac71896b6dcf041bbbadffd63a257d5d8bce1e1b3d47651edf4')
      });
      // const w2 = await createWallet();
      const w2 = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey('0x87d30f7be88a86183d9321ee922238b328617138eb4b33ed8fcfc332c96e3bc7')
      });
      // console.log('w1 ==>', w1);
      // console.log('w1.privatekey ==>', w1.privateKey.toString());
      // console.log('w2.privatekey ==>', w2.privateKey.toString());

      // await fundWallet(w1.accountAddress.toString(), 20); // Fund wallet1

      setWallet1(w1);
      setWallet2(w2);

      setWallet1Balance(await getBalance(w1.accountAddress.toString()));
      setWallet2Balance(await getBalance(w2.accountAddress.toString()));

      const assets1 = await getOwnedDigitalAssets(w1.accountAddress.toString(), Network.DEVNET);
      const processedNFTs1 = assets1?.map((asset: any, index: number) => {
        return {
          id: asset.current_token_data.token_data_id || index,
          name: asset.current_token_data.token_name || 'Unnamed NFT',
          description: asset.current_token_data.description || 'No description available',
          uri: asset.current_token_data.token_uri?.replace('ipfs://', 'https://ipfs.io/ipfs/')
        };
      });
      setNftsW1(processedNFTs1);

      const assets2 = await getOwnedDigitalAssets(w2.accountAddress.toString(), Network.DEVNET);
      const processedNFTs2 = assets2?.map((asset: any, index: number) => {
        return {
          id: asset.current_token_data.token_data_id || index,
          name: asset.current_token_data.token_name || 'Unnamed NFT',
          description: asset.current_token_data.description || 'No description available',
          uri: asset.current_token_data.token_uri?.replace('ipfs://', 'https://ipfs.io/ipfs/')
        };
      });
      setNftsW2(processedNFTs2);
    };
    setup();
  }, []);

  const handleTransfer = async () => {
    if (!wallet1 || !wallet2) return;
    if (!transferAmount) {
      message.error('Transfer amount cannot be empty');
      return;
    }

    console.log('wallet1Balance', wallet1Balance);
    const amount = parseFloat(transferAmount) * 10 ** 8; // Convert APT to Octas
    if ((amount || 0) > wallet1Balance) {
      message.error(`Insufficient of wallet 1`);
      return;
    }

    setLoading(true);
    console.log('amount before transfer', amount);
    const hashResult = await transferFunds(wallet1, wallet2.accountAddress.toString(), amount || 0);

    console.log('hashResult =>', hashResult.hash);
    setWallet1Balance(await getBalance(wallet1.accountAddress.toString()));
    setWallet2Balance(await getBalance(wallet2.accountAddress.toString()));
    setLoading(false);
    message.success(`Transfer ${transferAmount || 0} APT successfully.`);
  };

  function WalletContent() {
    const { connected, account, disconnect, wallet } = useWallet();
    // State to store additional account details
    const [accountBalance, setAccountBalance] = useState(0);
    const [nfts, setNfts] = useState([]);

    // Effect to fetch account balance or other details when connected
    useEffect(() => {
      const fetchAccountDetails = async () => {
        if (connected && account) {
          // console.log('account ==>', account);
          try {
            // Example of how you might fetch account balance
            // You'll need to use the Aptos SDK or appropriate method to get balance
            // This is a placeholder - replace with actual balance fetching logic
            // console.log('Connected Account:', account);
            const assets = await getOwnedDigitalAssets(account.address, Network.DEVNET);
            // console.log('asset =>', assets);
            const processedNFTs = assets?.map((asset: any, index: number) => {
              return {
                id: asset.current_token_data.token_data_id || index,
                name: asset.current_token_data.token_name || 'Unnamed NFT',
                description: asset.current_token_data.description || 'No description available',
                uri: asset.current_token_data.token_uri?.replace('ipfs://', 'https://ipfs.io/ipfs/')
              };
            });
            setNfts(processedNFTs);
            console.log('processedNFTs', processedNFTs);

            console.log('Balance', setAccountBalance(await getBalance(account.address)));
            // setAccountBalance(/* fetch balance here */);
          } catch (error) {
            console.error('Error fetching account details:', error);
          }
        }
      };

      fetchAccountDetails();
    }, [connected, account]);

    // console.log('nfts =>', nfts);
    return (
      <div>
        <WalletConnector networkSupport='' />
        {connected && account && (
          <div>
            <p>Connected Wallet: {wallet?.name}</p>
            <p>Account Address: {account.address}</p>
            {accountBalance && <p>Account Balance: {accountBalance / 10 ** 8} APT</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              {nfts.length > 0 ? (
                nfts.map((nft) => (
                  <div
                    key={nft.id}
                    style={{
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '1rem',
                      maxWidth: '200px'
                    }}>
                    <img
                      src={nft.uri}
                      alt={nft.name}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png'; // Fallback image
                      }}
                    />
                    <h3>{nft.name}</h3>
                    <p>{nft.description}</p>
                  </div>
                ))
              ) : (
                <p>No NFTs found for this address.</p>
              )}
            </div>
            <Button type='default' onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        )}
        <p>{connected ? 'Wallet connected successfully!' : 'Connect to your Aptos wallet to see your balance and transfer APT.'}</p>
      </div>
    );
  }

  // const optInWallets = ['Continue with Google'];
  const optInWallets = ['Petra'];

  const DisplayNFTs = (ntfsData: any) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        {ntfsData.length > 0 ? (
          ntfsData.map((nft) => (
            <div
              key={nft.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                maxWidth: '200px'
              }}>
              <img
                src={nft.uri}
                alt={nft.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png'; // Fallback image
                }}
              />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
            </div>
          ))
        ) : (
          <p>No NFTs found for this address.</p>
        )}
      </div>
    );
  };
  return (
    <>
      <div style={{ color: 'white' }}>
        <div>
          <p>
            <Text style={{ color: 'white' }}>Aptos Wallet</Text>
          </p>
          <AptosWalletAdapterProvider autoConnect={true} optInWallets={optInWallets}>
            {/* <WalletConnector /> */}
            <WalletContent />
          </AptosWalletAdapterProvider>
        </div>
      </div>
      <Spin tip='Loading...' spinning={loading}>
        <div style={{ padding: '20px', width: '100%', height: '100%' }}>
          <h1>Aptos Wallet Transfer</h1>
          <div>
            <h2>Wallet 1</h2>
            <p>Address: {wallet1?.accountAddress.toString()}</p>
            <p style={{ color: 'green' }}>Balance: {wallet1Balance / 10 ** 8} APT</p>
          </div>
          {DisplayNFTs(nftsW1)}

          <div>
            <h2>Wallet 2</h2>
            <p>Address: {wallet2?.accountAddress.toString()}</p>
            <p style={{ color: 'green' }}>Balance: {wallet2Balance / 10 ** 8} APT</p>
          </div>
          {DisplayNFTs(nftsW2)}
          {loading && <p>Transfering . . .</p>}
          {!loading && (
            <div>
              <h3>Transfer</h3>
              <Input
                type='number'
                style={{ width: '170px', marginRight: '1rem' }}
                placeholder='Amount to Transfer'
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <Button type='primary' onClick={handleTransfer}>
                Transfer
              </Button>
            </div>
          )}
        </div>
      </Spin>
    </>
  );
}

export default App;
