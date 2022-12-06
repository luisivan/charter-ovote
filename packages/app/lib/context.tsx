import { createContext, ReactNode, useContext, useState } from "react";
import { providers } from "ethers";
import { BASE_STRING, CHAIN_ID, CHARTER_CONTENT, VOTE } from "../lib/constants";
import {
  BjjWallet,
  buildCensus,
  generateWallets,
  generateZkProof,
  getCharterHash,
  MerkleTree,
  newProposal,
  vote,
} from "./logic";

// Exported types and data models
type UiContext = {
  step: FormSteps;
  provider?: providers.Web3Provider;
  signer?: providers.JsonRpcSigner;
  signerAddress: string;

  charterAccepted: boolean;
  wallets: BjjWallet[];
  methods: {
    nextStep: () => void;
    setCharterAccepted: (v: boolean) => void;
  };
};

export enum FormSteps {
  ACCEPT_CHARTER = 0,
  CONNECTING_WALLET = 1,
  GENERATE_BJJ_WALLETS = 2,
  GENERATING_BJJ_WALLETS = 3,
  COMPUTE_VOTE_PROOF = 6,
  COMPUTING_VOTE_PROOF = 7,
  SUBMITTING_VOTE = 8,
  SUCCESS = 9,
  FAILURE = 10,
}

const UiContext = createContext<UiContext>({
  step: FormSteps.ACCEPT_CHARTER,
  provider: undefined,
  signer: undefined,
  signerAddress: "",
  charterAccepted: false,
  wallets: [],
  methods: {
    nextStep: () => {},
    setCharterAccepted: () => {},
  },
});

export function UiContextProvider({ children }: { children: ReactNode }) {
  // Exposed
  const [step, setStep] = useState(FormSteps.ACCEPT_CHARTER);
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [signer, setSigner] = useState<providers.JsonRpcSigner>();
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [charterAccepted, setCharterAccepted] = useState(false);

  // Not exposed
  const [wallets, setWallets] = useState<BjjWallet[]>([]);
  const [censusTree, setCensustree] = useState<MerkleTree>();

  // Methods
  const nextStep = async () => {
    if (step === FormSteps.ACCEPT_CHARTER) {
      if (!charterAccepted) {
        return alert("Please, accept the charter before you continue");
      }
      setStep(FormSteps.CONNECTING_WALLET);
      await connectWallet();
    } else if (step === FormSteps.CONNECTING_WALLET) {
      // Nop
    } else if (step === FormSteps.GENERATE_BJJ_WALLETS) {
      setStep(FormSteps.GENERATING_BJJ_WALLETS);

      // Generate wallets after UI painted
      Promise.resolve().then(() => generateBjjWallets());
    } else if (step === FormSteps.COMPUTE_VOTE_PROOF) {
      setStep(FormSteps.COMPUTING_VOTE_PROOF);

      // Generate a vote proof and submit it on-chain
      Promise.resolve().then(() => submitVote());
    } else {
      alert("An unexpected internal error occurred");
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum?.request) return alert("MetaMask is not available");

    const provider = new providers.Web3Provider(window.ethereum);
    if (!provider) return alert("Metamask provider not available");

    const signer = provider.getSigner();
    if (!signer) return alert("Metamask signer not available");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts?.length) return alert("No accounts available");
    console.log("Connected to", accounts[0]);

    setProvider(provider);
    setSigner(signer);

    signer.getAddress().then((addr) => {
      setSignerAddress(addr);
      setStep(FormSteps.GENERATE_BJJ_WALLETS);
    }).catch((err) => {
      setStep(FormSteps.ACCEPT_CHARTER);
      alert("Could not read the wallet address: " + err?.message);
    });
  };

  const generateBjjWallets = async () => {
    // Generate 5 wallets by signing one message and deriving new keys
    if (!signer) throw new Error("Not connected");

    // Generate wallets
    const seedText = await signer.signMessage(BASE_STRING);
    const bjjWallets = generateWallets(seedText);

    // Build census
    const census = await buildCensus(bjjWallets);
    if (!census) throw new Error("Could not compute the census");

    setWallets(bjjWallets);
    setCensustree(census);

    setStep(FormSteps.COMPUTE_VOTE_PROOF);
  };

  const submitVote = async () => {
    if (!provider) throw new Error("Not connected");

    try {
      // Get proof
      const voterIdx = 0;
      const myWallet = wallets[voterIdx];

      const charterHash = getCharterHash(CHARTER_CONTENT);

      console.log("Creating proposal");
      const proposalId = await newProposal(censusTree, charterHash, provider);

      // ZK Proof
      const zkProof = await generateZkProof(
        CHAIN_ID,
        proposalId,
        censusTree,
        VOTE,
        CHARTER_CONTENT,
        voterIdx,
        myWallet,
      );
      // const { proof, publicSignals } = zkProof;

      setStep(FormSteps.SUBMITTING_VOTE);

      // Voting
      const success = await vote(
        CHAIN_ID,
        proposalId,
        VOTE,
        provider,
        myWallet,
        zkProof.proof,
      );
      if (!success) throw new Error();

      setStep(FormSteps.SUCCESS);
    } catch (err) {
      setStep(FormSteps.FAILURE);
    }
  };

  const value: UiContext = {
    step,
    provider,
    signer,
    signerAddress,
    charterAccepted,
    wallets,
    methods: {
      nextStep,
      setCharterAccepted,
    },
  };
  return (
    <UiContext.Provider value={value}>
      {children}
    </UiContext.Provider>
  );
}

export function useUiContext() {
  return useContext(UiContext);
}
