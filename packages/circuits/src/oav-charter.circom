//
// CM-OAV: Charter Member Onchain Anonymous Voting, using the OVOTE census
// =======================================================================
//
// This file is a fork from OAV circuit: https://github.com/aragonzkresearch/ovote/blob/07f50f5f170d7052f6ceb7eb6b9db62187658c49/circuits/src/oav.circom
// OAV: Onchain Anonymous Voting, uses the OVOTE census.
// The OAV follows the same design done in the Vochain
// https://github.com/vocdoni/zk-franchise-proof-circuit but adapted to the
// OVOTE census data structure.
//
// For LICENSE check https://github.com/aragonzkresearch/ovote/blob/master/LICENSE
//
// The CM-OAV circuit checks:
// - user proves that owns a key which is in the Census MerkleTree
// - user signs their vote + the Charter hash
// - user computs their nullifier, which is used by the smart contract to ensure that the same user does not vote twice
//
// 

pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";


// OAV: Onchain Anonymous Voting
template oav(nLevels) {
    var circomNLevels = nLevels+1;

    /////
    // public inputs
    signal input chainID; // hardcoded in contract deployment
    signal input processID; // determined by process creation
    signal input censusRoot; // determined by process creation
    signal input weight;
    signal input nullifier; // = H(chainID, processID, pubKx, pubKy)
    signal input vote;
    signal input charterHash;

    /////
    // private inputs
    signal input index; // index of user's public key in the census merkletree
    signal input pubKx; // user babyjubjub public key
    signal input pubKy;
    signal input s;
    signal input rx;
    signal input ry;
    signal input siblings[circomNLevels];

    component toSign = Poseidon(2);
    toSign.inputs[0] <== vote;
    toSign.inputs[1] <== charterHash;

    // check charter & vote hash signature
    component voteAndCharterSigVerifier = EdDSAPoseidonVerifier();
    voteAndCharterSigVerifier.enabled <== 1;
    voteAndCharterSigVerifier.Ax <== pubKx;
    voteAndCharterSigVerifier.Ay <== pubKy;
    voteAndCharterSigVerifier.S <== s;
    voteAndCharterSigVerifier.R8x <== rx;
    voteAndCharterSigVerifier.R8y <== ry;
    voteAndCharterSigVerifier.M <== toSign.out;

    // check CensusProof
    component pkHash = Poseidon(3);
    pkHash.inputs[0] <== pubKx;
    pkHash.inputs[1] <== pubKy;
    pkHash.inputs[2] <== weight;
    
    component censusProofCheck = SMTVerifier(circomNLevels);
    censusProofCheck.enabled <== 1;
    censusProofCheck.fnc <== 0; // 0 as is to verify inclusion
    censusProofCheck.root <== censusRoot;
    for (var i=0; i<circomNLevels; i++) {
	censusProofCheck.siblings[i] <== siblings[i];
    }
    censusProofCheck.oldKey <== 0;
    censusProofCheck.oldValue <== 0;
    censusProofCheck.isOld0 <== 0;
    censusProofCheck.key <== index;
    censusProofCheck.value <== pkHash.out;

    // check nullifier
    component computedNullifier = Poseidon(4);
    computedNullifier.inputs[0] <== chainID;
    computedNullifier.inputs[1] <== processID;
    computedNullifier.inputs[2] <== pubKx;
    computedNullifier.inputs[3] <== pubKy;
    component checkNullifier = ForceEqualIfEnabled();
    checkNullifier.enabled <== 1;
    checkNullifier.in[0] <== computedNullifier.out;
    checkNullifier.in[1] <== nullifier;
}
