import { Contract, providers, utils, Wallet } from "ethers";
import { arrayify, toUtf8Bytes } from "ethers/lib/utils";
import { ABI } from "../lib/constants";

export type HezWallet = any;

// TODO: Set the right value
const CONTRACT_ADDRESS = "0x1234";

let JsBundle: any = {};
if (typeof window !== "undefined") {
  // Note: Dirty hack to access NodeJS-only Hermez library that only works bundled with through Browserify
  //       Will only work on browsers after the <script> tag is loaded
  //       Real solution is to rewrite the zk libraries in pure JS that runs universally

  // @ts-ignore
  JsBundle = window.getBundle();
}
const { newMemEmptyTrie, buildEddsa, buildPoseidonReference } = JsBundle;
// eddsa = await buildEddsa();

function getConnectedContract(provider: providers.Web3Provider): Contract {
  const contract = new Contract(CONTRACT_ADDRESS, ABI, provider.getSigner());
  return contract.connect(provider);
}

export function generateBabyJubJubSkArray(seed: string): Uint8Array[] {
  const privKeys: Uint8Array[] = [];

  for (let i = 0; i < 5; i++) {
    // Using the private signature as the salt
    const hexSk = utils.keccak256(toUtf8Bytes("Wallet " + i + ": " + seed));
    const bytes = hexToBytes(hexSk);
    privKeys.push(bytes);
  }
  return privKeys;
}

// export function toHezWallets(wallets: Wallet[]): HezWallet[] {
//   if (!wallets) return [];
//   return wallets.map((w) => HermezWallet.createWalletFromEtherAccount(w));
// }

/*
export const newVote = async (provider: providers.Web3Provider) => {
  if (!provider) return alert("Not connected");

  const contract = getConnectedContract(provider);

  // TODO: create several wallets
  const hWallet = await getHermezWallet();

  // TODO: generate census

  // TODO: send create vote TX

  const tx = await contract.functions.newProcess(
    txHash,
    censusRoot,
    censusSize,
    resPubStartBlock,
    resPubWindow,
    minParticipation,
    typ,
  );

  await tx.wait();

  alert("Created");
};

export const handleVote = async (approveValue: boolean) => {
  if (!provider || !account) return alert("Not connected");

  const hermezWallet = await getHermezWallet();
  const hermezWalletAddress = hermezWallet?.hermezEthereumAddress;
  setHermezWalletAddress(hermezWalletAddress);

  // TODO: Get the available wallets

  // Generate proofs locally

  // Store payloads locally

  // Aggregate proofs
};

const signPayload = async () => {
};

const submitResults = async (pid: string, hWallets: any[]) => {
  // TODO: sign/vote with the available wallets

  // TODO: Aggregate the results

  // TODO: Submit the results
  const tx = await contract.functions.publishResult(
    receiptsRoot,
    result,
    nVotes,
    a,
    b,
    c,
  );

  await tx.wait();

  alert("Created");
};

const getHermezWallet = async function (provider: providers.JsonRpcProvider) {
  if (!provider) return alert("Not connected");

  const signer = provider.getSigner();
  return HermezWallet.createWalletFromEtherAccount(
    signer,
  );
};
*/

export function hexToBytes(hexString: string): Uint8Array {
  if (!/^(0x)?[0-9a-fA-F]+$/.test(hexString)) {
    throw new Error("Invalid hex string");
  } else if (hexString.length % 2 !== 0) {
    throw new Error("The hex string has an odd length");
  }

  hexString = strip0x(hexString);
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(
      parseInt(hexString.substring(i, i + 2), 16),
    );
  }
  return Uint8Array.from(bytes);
}

export function ensure0x(value: string): string {
  return value.startsWith("0x") ? value : "0x" + value;
}

export function strip0x(value: string): string {
  return value.startsWith("0x") ? value.substring(2) : value;
}
