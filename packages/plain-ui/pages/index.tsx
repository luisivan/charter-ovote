import { FC, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { providers } from "ethers";
import { ABI } from "../lib/constants";

let Hermez: any;
if (typeof window !== "undefined") {
  // @ts-ignore
  Hermez = window.getVocdoni();
}

const Index: FC = () => {
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [account, setAccount] = useState<string>();
  const [hermezWalletAddress, setHermezWalletAddress] = useState<string>();

  const connect = async () => {
    if (!window.ethereum?.request) {
      alert("MetaMask is not installed!");
      return;
    }

    const provider = new providers.Web3Provider(window.ethereum);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setProvider(provider);
    setAccount(accounts[0]);
  };

  // const getBalance = async () => {
  //   if (provider && account) {
  //     const signerBalance = await provider.getSigner().getBalance();
  //     const balance = ethers.utils.formatUnits(signerBalance, 18);
  //     setSignerBalance(balance);
  //   }
  // };

  const createHermezWallet = async function createWallet() {
    if (provider && account) {
      const signer = provider.getSigner();
      const hermezWallet = Hermez.HermezWallet.createWalletFromEtherAccount(
        signer,
      );
      return hermezWallet;
    }
  };

  const setHermezAddress = async () => {
    if (provider && account) {
      const hermezWalletAndAddress = await createHermezWallet();
      const hermezWalletAddress = hermezWalletAndAddress?.hermezEthereumAddress;
      setHermezWalletAddress(hermezWalletAddress);
    }
  };

  return (
    <>
      <Head>
        <script src="./static/main.js"></script>
        <title>Charter sign app</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <main className={styles.main}>
          <img src="/aragon.png" className={styles.logo} />
          <div className={styles.header}>
            <img src="/fight-for-freedom.svg" className={styles.fff} />
          </div>

          <iframe
            className={styles.iframe}
            src="https://linked.md/v?u=https://linked.md/api/github/luisivan/charter-ovote/main/Charter.linked.md"
          >
          </iframe>

          <div style={{ height: 50 }} />
          <label>
            <input type="checkbox" name="accept" value="true" />
            &nbsp; I have read and accept the terms outlined above by joining
            the Aragon DAO
          </label>
          <div style={{ height: 30 }} />

          {!account && <button onClick={connect}>Connect</button>}
          {account && <p>Account: {account}</p>}

          <div style={{ height: 30 }} />

          {(provider && account) &&
            <button onClick={setHermezAddress}>Sign Charter</button>}
          {hermezWalletAddress && <p>Hermez address: {hermezWalletAddress}</p>}
        </main>
      </div>
    </>
  );
};

export default Index;
