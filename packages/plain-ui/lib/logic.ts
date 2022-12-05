import { Contract, providers, utils, Wallet } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ABI } from "../lib/constants";

// TODO: Set the right value
const CONTRACT_ADDRESS = "0x1234";
const CIRCUIT_WASM_URL = "/static/circuit.wasm";
const CIRCUIT_ZKEY_URL = "/static/circuit.zkey";

const CIRCOM_CIRCUIT_LEVEL_COUNT = 7; // not used here
const CIRCUIT_LEVEL_COUNT = CIRCOM_CIRCUIT_LEVEL_COUNT + 1;
const VOTE_WEIGHT = 1;

export type SecretKey = Uint8Array;
export type PublicKey = [Uint8Array, Uint8Array];
export type BjjWallet = { sk: SecretKey; pubK: PublicKey };
export type Signature = { R8: [Uint8Array, Uint8Array]; S: bigint };
export type MerkleTree = any;

let JsBundle: any = {};
let newMemEmptyTrie: Function,
  buildEddsa: Function,
  buildPoseidonReference: Function,
  groth16FullProve: Function,
  groth16Verify: Function,
  zKeyExportVerificationKey: Function;
let eddsa: any, poseidon: ((p: any) => Uint8Array) | any;

if (typeof window !== "undefined") {
  // Note: Dirty hack to access NodeJS-only Hermez library that only works bundled with through Browserify
  //       Will only work on browsers after the <script> tag is loaded
  //       Real solution is to rewrite the zk libraries in pure JS that runs universally

  // @ts-ignore
  JsBundle = window.getBundle();
  newMemEmptyTrie = JsBundle.newMemEmptyTrie;
  buildEddsa = JsBundle.buildEddsa;
  buildPoseidonReference = JsBundle.buildPoseidonReference;
  groth16FullProve = JsBundle?.groth16?.fullProve;
  groth16Verify = JsBundle?.groth16?.verify;
  zKeyExportVerificationKey = JsBundle?.zKey?.exportVerificationKey;

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
  const tree = await newMemEmptyTrie();

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    const leaf = poseidon([w.pubK[0], w.pubK[1], VOTE_WEIGHT]);
    await tree.insert(i, leaf);
  }
  return tree;
}

export async function getProof(
  censusTree: MerkleTree,
  walletIndex: number,
): Promise<string[]> {
  if (!poseidon?.F) {
    throw new Error("The Poseidon dependencies are not available");
  } else if (!censusTree) {
    throw new Error("The census is empty");
  }

  const F = poseidon.F;

  // voter gets the siblings (merkleproof)
  const res = await censusTree.find(walletIndex);

  if (!res.found) throw new Error("Index not found");

  let siblings: string[] = res.siblings;
  for (let i = 0; i < siblings.length; i++) {
    siblings[i] = F.toObject(siblings[i]).toString();
  }
  while (siblings.length < CIRCUIT_LEVEL_COUNT) siblings.push("0");

  return siblings;
}

export function getCharterHash(contents: string): bigint {
  // CUT TO 253 bits when using the real value
  const hexHash = utils.keccak256(toUtf8Bytes(contents));
  const bytes = hexToBytes(hexHash);
  const hash = bufferToBigInt(bytes);

  // FIXME: hash properly
  return hash % (BigInt(1) << BigInt(251));
}

export function getVoteSignature(
  voteValue: number,
  charterHash: bigint,
  wallet: BjjWallet,
): Signature {
  if (!poseidon) throw new Error("The Poseidon dependencies are not available");
  else if (!eddsa) throw new Error("The EDDSA dependencies are not available");
  else if (!charterHash) throw new Error("The hash cannot be empty");

  // user signs vote & charter
  const toSign = poseidon([voteValue, charterHash]);
  return eddsa.signPoseidon(wallet.sk, toSign);
}

export async function generateZkProof(
  chainId: number,
  proposalId: bigint,
  censusTree: MerkleTree,
  vote: number,
  charterContent: string,
  voterIndex: number,
  wallet: BjjWallet,
) {
  if (!poseidon?.F) {
    throw new Error("The Poseidon dependencies are not available");
  } else if (!groth16FullProve) {
    throw new Error("The prover dependencies are not available");
  } else if (!censusTree) {
    throw new Error("The census is empty");
  }

  const F = poseidon.F;

  // Generate signature over vote + charter hash
  const charterHash = getCharterHash(charterContent);
  const signature = getVoteSignature(vote, charterHash, wallet);

  // Compute nullifier
  const nullifier = getNullifier(chainId, proposalId, wallet);

  const censusProof = await getProof(censusTree, voterIndex);

  const inputs = {
    // public inputs
    chainID: chainId,
    processID: proposalId,
    censusRoot: F.toObject(censusTree.root).toString(),
    weight: VOTE_WEIGHT,
    nullifier: F.toObject(nullifier).toString(),
    vote: BigInt(vote),
    charterHash,
    // private inputs
    index: voterIndex,
    pubKx: F.toObject(wallet.pubK[0]).toString(),
    pubKy: F.toObject(wallet.pubK[1]).toString(),
    s: signature.S,
    rx: F.toObject(signature.R8[0]).toString(),
    ry: F.toObject(signature.R8[1]).toString(),
    siblings: censusProof,
  };

  // Fetch the proving circuit
  // const prover = await fetchProverModule();
  const proverWasm = await fetchProver();
  const zKey = await fetchZkey();

  debugger;

  const { proof, publicSignals }: { proof: any; publicSignals: any } =
    await groth16FullProve(
      inputs,
      proverWasm,
      zKey,
      null,
    );

  const vKey = await zKeyExportVerificationKey(zKey);
  const isValid = await groth16Verify(vKey, publicSignals, proof);
  if (!isValid) throw new Error("The generated proof is not valid");

  return { proof, publicSignals };
}

export function verify() {
}

export function getNullifier(
  chainId: number,
  proposalId: bigint,
  wallet: BjjWallet,
): Uint8Array {
  return poseidon([
    chainId,
    proposalId,
    wallet.pubK[0],
    wallet.pubK[1],
  ]);
}

// HELPERS

export async function fetchProver() {
  return fetch(CIRCUIT_WASM_URL)
    .then((res) => res.arrayBuffer())
    .then((res) => new Uint8Array(res));
}

export async function fetchProverModule() {
  const wasmBytes = await fetchProver();

  const instance = await WebAssembly.instantiate(wasmBytes, {
    runtime: {
      exceptionHandler: (code: number) => {
        let errStr: string;
        switch (code) {
          case 1:
            errStr = "Signal not found.";
            break;
          case 2:
            errStr = "Too many signals set.";
            break;
          case 3:
            errStr = "Signal already set.";
            break;
          case 4:
            errStr = "Assert Failed.";
            break;
          case 5:
            errStr = "Not enough memory.";
            break;
          default:
            errStr = "Unknown error";
            break;
        }
        throw new Error(errStr + " " + getMessage());
      },
      showSharedRWMemory: () => {},
    },
  });

  return instance;

  function getMessage() {
    const getMessageChar = ((instance as any)?.exports as any).getMessageChar;
    if (!getMessageChar) return "";

    let message = "";
    let c = getMessageChar();
    while (c != 0) {
      message += String.fromCharCode(c);
      c = getMessageChar();
    }
    return message;
  }
}

export function fetchZkey() {
  return fetch(CIRCUIT_ZKEY_URL)
    .then((res) => res.arrayBuffer())
    .then((buff) => new Uint8Array(buff));
}

function bufferToBigInt(bytes: Buffer | Uint8Array): bigint {
  // Ensure that it is a buffer
  bytes = Buffer.from(bytes);
  return BigInt(with0x(bytes.toString("hex")));
}

function bigIntToBuffer(number: bigint): Uint8Array {
  let hexNumber = number.toString(16);
  while (hexNumber.length < 64) hexNumber = "0" + hexNumber;
  return hexToBytes(hexNumber);
}

function hexToBytes(hexString: string): Uint8Array {
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

function with0x(value: string): string {
  return value.startsWith("0x") ? value : "0x" + value;
}

function without0x(value: string): string {
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
