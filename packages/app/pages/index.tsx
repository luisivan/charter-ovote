import { FC } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { FormSteps, UiContextProvider, useUiContext } from "../lib/context";

const Index: FC = () => {
  return (
    <UiContextProvider>
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

          <div className={styles.mainBody}>
            <FormStepMux />
          </div>

          <VSpace />
          <VSpace />

          <iframe
            className={styles.iframe}
            src="https://linked.md/v?u=https://linked.md/api/github/luisivan/charter-ovote/main/Charter.linked.md"
          >
          </iframe>
        </main>
      </div>
    </UiContextProvider>
  );
};

const FormStepMux: FC = () => {
  const { step } = useUiContext();

  switch (step) {
    case FormSteps.ACCEPT_CHARTER:
      return <StepAccept />;
    case FormSteps.CONNECTING_WALLET:
      return <StepConnectingWallet />;
    case FormSteps.GENERATE_BJJ_WALLETS:
      return <StepGenerateBabyJubJubWallets />;
    case FormSteps.GENERATING_BJJ_WALLETS:
      return <StepGeneratingBabyJubJubWallets />;
    case FormSteps.COMPUTE_VOTE_PROOF:
      return <StepComputeVote />;
    case FormSteps.COMPUTING_VOTE_PROOF:
      return <StepComputingVoteProof />;
    case FormSteps.SUBMITTING_VOTE:
      return <StepSubmittingVote />;
    case FormSteps.SUCCESS:
      return <StepSuccess />;
    case FormSteps.FAILURE:
      return <StepFailure />;
  }

  return <p>(not implemented)</p>;
};

const StepAccept: FC = () => {
  const {
    charterAccepted,
    methods,
  } = useUiContext();

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={charterAccepted}
          onChange={() => methods.setCharterAccepted(!charterAccepted)}
        />
        &nbsp; I have read and accept the terms outlined above by joining the
        Aragon DAO
      </label>

      <VSpace />

      <button className={styles.button} onClick={methods.nextStep}>
        Continue
      </button>
    </>
  );
};

const StepConnectingWallet: FC = () => {
  return <p>Connecting to Metamask...</p>;
};

const StepGenerateBabyJubJubWallets: FC = () => {
  const { methods } = useUiContext();

  return (
    <>
      <p>
        Click continue to generate the Baby Jub Jub wallets and compute the
        census for the vote
      </p>

      <VSpace />

      <button className={styles.button} onClick={methods.nextStep}>
        Continue
      </button>
    </>
  );
};

const StepGeneratingBabyJubJubWallets: FC = () => {
  return (
    <>
      <p>
        Generating the wallets and creating the census, please wait...
      </p>
    </>
  );
};

const StepComputeVote: FC = () => {
  const { wallets, methods } = useUiContext();

  const pubK = wallets?.[0]?.pubK;

  return (
    <>
      <p>
        Created a census with 5 wallets.
      </p>
      <p>
        Your Baby Jub Jub public key is <br />
        <code>{bytesToHex(pubK[0])}</code> -
        <code>{bytesToHex(pubK[1])}</code>
      </p>
      <p>You can finally compute your vote proof and submit it on-chain.</p>

      <VSpace />

      <button className={styles.button} onClick={methods.nextStep}>
        Continue
      </button>
    </>
  );
};

const StepComputingVoteProof: FC = () => {
  return <p>Generating the vote proof, please wait...</p>;
};
const StepSubmittingVote: FC = () => {
  return <p>Submitting your vote, please wait...</p>;
};
const StepSuccess: FC = () => {
  return <p>Your vote has been validated successfully!</p>;
};
const StepFailure: FC = () => {
  return <p>Your vote could not be delivered</p>;
};

const VSpace = () => <div style={{ height: 30 }} />;
const HSpace = () => <span style={{ marginLeft: 20 }} />;

// helpers
function bytesToHex(buff: Uint8Array, prepend0x?: boolean): string {
  const bytes: string[] = [];
  for (let i = 0; i < buff.length; i++) {
    if (buff[i] >= 16) bytes.push(buff[i].toString(16));
    else bytes.push("0" + buff[i].toString(16));
  }
  if (prepend0x) return "0x" + bytes.join("");
  return bytes.join("");
}

export default Index;
