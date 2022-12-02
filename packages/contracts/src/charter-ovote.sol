// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.10;

import './verifier.sol';


// Charter-OAV (OnchainAnonymousVoting) contract.
// Fork from https://github.com/aragonzkresearch/ovote/tree/main/contracts
// WARNING: This code is WIP, in early stages.
/// @title charterovote
/// @author Aragon  
contract CharterOVOTE {
	SNARKVerifier    Verifier;

	struct Process {
		address creator; // the sender of the tx that created the process
		uint256 transactionHash;
		uint256 censusRoot;
		uint256 charterHash;

		// next 7 values are grouped and they use 217 bits, so they fit
		// in a single 256 storage slot
		uint64 resPubStartBlock; // results publishing start block
		uint64 resPubWindow; // results publishing window
		uint8 minParticipation; // number of votes
		bool closed;
	}
	struct Result {
		address publisher;
		uint256 receiptsRoot;
		uint64 result;
		uint64 nVotes;
	}

	uint256 public lastProcessID; // initialized at 0
	// TODO change Process ID to uint64
	mapping(uint256 => Process) public processes;
	mapping(uint256 => Result) public results;


	// Events used to synchronize the ovote-node when scanning the blocks

	event EventProcessCreated(address creator, uint256 id, uint256
				  transactionHash,  uint256 censusRoot, uint256 charterHash, uint64 resPubStartBlock, uint64
				  resPubWindow, uint8 minParticipation);

	event EventVote(address publisher, uint256 id, uint256
				   votevalue, uint64 weight);

	event EventProcessClosed(address caller, uint256 id, bool success);

	constructor( address _verifierContractAddr) public {
		verifier = SNARKVerifier(_verifierContractAddr);
	}


	/// @notice stores a new Process into the processes mapping
	/// @param transactionHash keccak256 hash of the transaction that will be executed if the process succeeds
	/// @param censusRoot MerkleRoot of the CensusTree used for the process, which will be used to verify the zkSNARK proofs of the results
	/// @param charterHash Number of leaves in the CensusTree used for the process
	/// @param resPubStartBlock Block number where the results publishing phase starts
	/// @param resPubWindow Window of time (in number of blocks) of the results publishing phase
	/// @param minParticipation Threshold of minimum number of votes over the total users in the census (over CensusSize)
	/// @return id assigned to the created process
	function newProcess(
		uint256 transactionHash,
		uint256 censusRoot,
		uint256 charterHash,
		uint64 resPubStartBlock,
		uint64 resPubWindow,
		uint8 minParticipation
	) public returns (uint256) {
		processes[lastProcessID +1] = Process(msg.sender, transactionHash,
				censusRoot, charterHash, resPubStartBlock, resPubWindow,
				minParticipation, false);

		// assume that we use solidity versiont >=0.8, which prevents
		// overflow with normal addition
		lastProcessID += 1;

		emit EventProcessCreated(msg.sender, lastProcessID, transactionHash,
					 censusRoot, charterHash, resPubStartBlock,
					 resPubWindow, minParticipation);

		return lastProcessID;
	}

	/// @notice validates the proposed result during the results-publishing
	/// phase, and if it is valid, it stores it for the process id
	/// @param id Process id
	/// @param nullifier wip
	/// @param votevalue wip
	/// @param weight wip
	// /// @param a Groth16 proof G1 point
	// /// @param b Groth16 proof G2 point
	// /// @param c Groth16 proof G1 point
	function vote(uint256 id,
		uint256 nullifier,
		uint64 votevalue,
		uint64 weight,
		uint[2] memory a, uint[2][2] memory b, uint[2] memory c
        ) public {
		// check that id has a process
		require(id<=lastProcessID, "process id does not exist");

		Process storage process = processes[id];
		require(process.closed == false, "process already closed");

		// check that resPubStartBlock has been reached
		require(block.number >= processes[id].resPubStartBlock,
			"nVotes >= process.resPubStartBlock");

		// check that ResultsPublishingWindow is not over
		require(block.number < processes[id].resPubStartBlock + processes[id].resPubWindow,
			"nVotes < process.resPubStartBlock + process.resPubWindow");

		// TODO check that the nullifier has not been already used
		// TODO store the nullifier

		// build inputs array (using Process parameters from processes mapping)
		uint256[6] memory inputs = [
			42, // TODO chainid
			id,
			process[id].censusRoot,
			weight,
			nullifier,
			votevalue,
			process[id].charterHash
		];
		// call zk snark verification here when ready
		require(verifier.verifyProof(a, b, c, inputs), "zkProof vote could not be verified");



		emit EventVote(msg.sender, id, votevalue, weight);

		process.closed = true;
		emit EventProcessClosed(msg.sender, id, true);
	}

	// @notice closes the process for the given id
	// @param id Process id
	function closeProcess(uint256 id) public {
		// get process by id
		Process storage process = processes[id];

		require(process.closed == false, "process already closed");

		// get result by process id
		Result storage result;
		result = results[id];

		require(block.number >= process.resPubStartBlock + process.resPubWindow,
			"process.resPubStartBlock not reached yet");

		// TODO check result>50% of positive votes
		// and if ok, then call the tx of the transactionHash

		// close process (in storage)
		process.closed = true;

		emit EventProcessClosed(msg.sender, id, true);
	} 
}
