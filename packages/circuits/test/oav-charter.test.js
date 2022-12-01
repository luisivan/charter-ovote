const path = require("path");
const fs = require("fs");

const { assert, expect } = require("chai");

// const c_tester = require("circom_tester").c;
const wasm_tester = require("circom_tester").wasm;

const { newMemEmptyTrie, buildPoseidonReference, buildEddsa } = require("circomlibjs");

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


describe("oav-charter 4 lvls", function () {
    this.timeout(100000);

    const nLevels = 4;

    let cir;
    before(async () => {
	const circuitPath = path.join(__dirname, "circuits", "oav-charter-test.circom");
	const circuitCode = `
	    pragma circom 2.0.0;
	    include "../../src/oav-charter.circom";
	    component main {public [chainID, processID, censusRoot, weight, nullifier, vote, charterHash]}= oav(${nLevels-1});
	`;
	fs.writeFileSync(circuitPath, circuitCode, "utf8");

	// cir = await c_tester(circuitPath);
	cir = await wasm_tester(circuitPath);

	await cir.loadConstraints();
	console.log("n_constraints", cir.constraints.length);

	eddsa = await buildEddsa();
	poseidon = await buildPoseidonReference();
    });

    it ("simple flow", async () => {
	const F = poseidon.F;

	const chainID = 0n;
	const processID = 0n;

	// voter key generation
	const privateKey = fromHexString("0001020304050607080900010203040506070809000102030405060708090001");
        const publicKey = eddsa.prv2pub(privateKey);


	// build the census tree add public keys to the tree
	let index = 1;
	let weight = 1;
	const leafValue = poseidon([publicKey[0], publicKey[1], weight]);
	let tree = await newMemEmptyTrie();
	await tree.insert(index, leafValue);
	// add fake voters simulating a more fully census
	await tree.insert(2, 2);
	await tree.insert(3, 3);


	// voter gets the siblings (merkleproof)
	const res = await tree.find(index);
	assert(res.found);
	let siblings = res.siblings;
	for (let i=0; i<siblings.length; i++) {
	    siblings[i] = F.toObject(siblings[i]).toString();
	}
	while (siblings.length < nLevels) siblings.push(0);


	let vote = 1;
	let charterHash = 12345;

	// user signs vote & charter
	const toSign = poseidon([vote, charterHash]);
	const signature = eddsa.signPoseidon(privateKey, toSign);

	const nullifier = poseidon([chainID, processID, publicKey[0], publicKey[1]]);


	// set the inputs
	const inputs = {
	    chainID: chainID, // public inputs
	    processID: processID,
	    censusRoot: F.toObject(tree.root).toString(),
	    weight: weight,
	    nullifier: F.toObject(nullifier).toString(),
	    vote: vote,
	    charterHash: charterHash,
	    index: index, // private inputs
	    pubKx: F.toObject(publicKey[0]).toString(),
	    pubKy: F.toObject(publicKey[1]).toString(),
	    s: signature.S,
	    rx: F.toObject(signature.R8[0]).toString(),
	    ry: F.toObject(signature.R8[1]).toString(),
	    siblings: siblings,
	};
	console.log(inputs);

	const witness = await cir.calculateWitness(inputs, true);
	await cir.checkConstraints(witness);
    });

});
