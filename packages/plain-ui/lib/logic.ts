import { Contract, providers, utils, Wallet } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ABI } from "../lib/constants";

export type SecretKey = Uint8Array;
export type PublicKey = [Uint8Array, Uint8Array];
export type BjjWallet = { sk: SecretKey; pubK: PublicKey };
export type MerkleTree = any;

// TODO: Set the right value
const CONTRACT_ADDRESS = "0x1234";

const CIRCOM_CIRCUIT_LEVEL_COUNT = 7; // not used here
const CIRCUIT_LEVEL_COUNT = CIRCOM_CIRCUIT_LEVEL_COUNT + 1;

let JsBundle: any = {};
let newMemEmptyTrie: any,
  buildEddsa: Function,
  buildPoseidonReference: Function;
let eddsa: any, poseidon: any;

if (typeof window !== "undefined") {
  // Note: Dirty hack to access NodeJS-only Hermez library that only works bundled with through Browserify
  //       Will only work on browsers after the <script> tag is loaded
  //       Real solution is to rewrite the zk libraries in pure JS that runs universally

  // @ts-ignore
  JsBundle = window.getBundle();
  newMemEmptyTrie = JsBundle.newMemEmptyTrie;
  buildEddsa = JsBundle.buildEddsa;
  buildPoseidonReference = JsBundle.buildPoseidonReference;

  // Load circomlibjs artifacts
  buildEddsa().then((result: any) => {
    eddsa = result;

    return buildPoseidonReference();
  }).then((result: any) => {
    poseidon = result;
  }).catch((err: any) => {
    alert("Could not load the bundle dependencies: " + err?.message);
  });
}

function getConnectedContract(provider: providers.Web3Provider): Contract {
  const contract = new Contract(CONTRACT_ADDRESS, ABI, provider.getSigner());
  return contract.connect(provider);
}

export function generateWallets(seed: string): BjjWallet[] {
  if (!eddsa) throw new Error("The EDDSA dependencies are not available");

  const privKeys: BjjWallet[] = [];

  for (let i = 0; i < 5; i++) {
    // Using the private signature as the salt
    const hexSk = utils.keccak256(toUtf8Bytes("Wallet " + i + ": " + seed));
    const skBytes = hexToBytes(hexSk);
    const pubK: PublicKey = eddsa.prv2pub(skBytes);

    privKeys.push({
      sk: skBytes,
      pubK,
    });
  }
  return privKeys;
}

export async function buildCensus(wallets: BjjWallet[]): Promise<MerkleTree> {
  if (!poseidon) throw new Error("The Poseidon dependencies are not available");
  else if (!wallets?.length) throw new Error("Empty census");

  // build the census tree add public keys to the tree
  let weight = 1;
  const tree = await newMemEmptyTrie();

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    const leaf = poseidon([w.pubK[0], w.pubK[1], weight]);
    await tree.insert(i, leaf);
  }
  return tree;
}

export async function getProof(
  tree: MerkleTree,
  index: number,
): Promise<bigint[]> {
  if (!poseidon?.F) {
    throw new Error("The Poseidon dependencies are not available");
  }

  const F = poseidon.F;

  // voter gets the siblings (merkleproof)
  const res = await tree.find(index);

  if (!res.found) throw new Error("Index not found");

  let siblings = res.siblings;
  for (let i = 0; i < siblings.length; i++) {
    siblings[i] = F.toObject(siblings[i]).toString();
  }
  while (siblings.length < CIRCUIT_LEVEL_COUNT) siblings.push(0);

  return siblings;
}

export function getCharterHash(contents: string): bigint {
  // CUT TO 253 bits when using the real value
  const hexHash = utils.keccak256(toUtf8Bytes(contents));
  const bytes = hexToBytes(hexHash);
  const hash = bufferToBigInt(bytes);
  return hash % (BigInt(1) << BigInt(253));

  // return BigInt("1234567890123456789");
}

export function getVoteSignature(
  voteValue: number,
  charterContent: string,
  wallet: BjjWallet,
) {
  if (!poseidon) throw new Error("The Poseidon dependencies are not available");
  else if (!eddsa) throw new Error("The EDDSA dependencies are not available");
  else if (!charterContent) throw new Error("The charter cannot be empty");

  const charterHash = getCharterHash(charterContent);

  // user signs vote & charter
  const toSign = poseidon([voteValue, charterHash]);
  return eddsa.signPoseidon(wallet.sk, toSign);
}

export function getNullifier(
  chainId: 0,
  proposalId: bigint,
  wallet: BjjWallet,
) {
  return poseidon([
    chainId,
    proposalId,
    wallet.pubK[0],
    wallet.pubK[1],
  ]);
}

// HELPERS

export function bufferToBigInt(bytes: Buffer | Uint8Array): bigint {
  // Ensure that it is a buffer
  bytes = Buffer.from(bytes);
  return BigInt(with0x(bytes.toString("hex")));
}

export function hexToBytes(hexString: string): Uint8Array {
  if (!/^(0x)?[0-9a-fA-F]+$/.test(hexString)) {
    throw new Error("Invalid hex string");
  } else if (hexString.length % 2 !== 0) {
    throw new Error("The hex string has an odd length");
  }

  hexString = without0x(hexString);
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(
      parseInt(hexString.substring(i, i + 2), 16),
    );
  }
  return Uint8Array.from(bytes);
}

export function with0x(value: string): string {
  return value.startsWith("0x") ? value : "0x" + value;
}

export function without0x(value: string): string {
  return value.startsWith("0x") ? value.substring(2) : value;
}

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
