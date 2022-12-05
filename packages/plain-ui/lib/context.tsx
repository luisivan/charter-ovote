import { createContext, ReactNode, useContext, useState } from "react";
import { providers } from "ethers";
import {
  buildCensus,
  generateWallets,
  getNullifier,
  getProof,
  getVoteSignature,
} from "./logic";

const BASE_STRING =
  "This message will be used to generate derived Baby JubJub wallets";
const CHARTER_CONTENT = "This is a charter";
const CHAIN_ID = 0;
const PROPOSAL_ID = BigInt(0);

// Exported types and data models
type UiContext = {
  step: FormSteps;
  provider?: providers.Web3Provider;
  signer?: providers.JsonRpcSigner;
  signerAddress: string;
  charterAccepted: boolean;
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
  SEND_CENSUS_ROOT = 4,
  COMPUTE_VOTE_PROOF = 5,
  SUBMIT_VOTE_PROOF = 6,
  RESULT = 7,
}

const UiContext = createContext<UiContext>({
  step: FormSteps.ACCEPT_CHARTER,
  provider: undefined,
  signer: undefined,
  signerAddress: "",
  charterAccepted: false,
  methods: {
    nextStep: () => {},
    setCharterAccepted: () => {},
  },
});

export function UiContextProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(FormSteps.ACCEPT_CHARTER);
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [signer, setSigner] = useState<providers.JsonRpcSigner>();
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [charterAccepted, setCharterAccepted] = useState(false);

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
      Promise.resolve().then(() => generateHezWallets());
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

  const generateHezWallets = async () => {
    // Generate 5 wallets by signing one message and deriving new keys
    if (!signer) throw new Error("Not connected");

    // Generate wallets
    const seedText = await signer.signMessage(BASE_STRING);
    const bjjWallets = generateWallets(seedText);

    // Build census
    const censusTree = await buildCensus(bjjWallets);

    // Get proof
    const voterIdx = 0;
    const myWallet = bjjWallets[voterIdx];
    const myProof = await getProof(censusTree, voterIdx);

    debugger;

    // Generate signature over vote + charter hash
    const myVote = 1;
    const signature = getVoteSignature(myVote, CHARTER_CONTENT, myWallet);

    // Compute nullifier
    const nullifier = getNullifier(CHAIN_ID, PROPOSAL_ID, myWallet);

    //
  };

  const value: UiContext = {
    step,
    provider,
    signer,
    signerAddress,
    charterAccepted,
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
