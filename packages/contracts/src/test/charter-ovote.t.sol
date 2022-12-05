// SPDX-License-Identifier: GPL-3.0-or-later
// pragma solidity 0.8.10;
pragma solidity ^0.6.11;

import "ds-test/test.sol";
import "src/charter-ovote.sol";

interface CheatCodes {
    function roll(uint256) external;
    function expectRevert(bytes calldata) external;
}

contract OVOTETest is DSTest {
    CharterOVOTE charterovote;

    function setUp() public {
        charterovote = new CharterOVOTE(HEVM_ADDRESS);
    }

    function testNewProcess() public {
        // create a 1st process
        uint256 id = charterovote.newProcess(1234, 4321);
        assertEq(id, 1);

        { // scope for process 1, avoids stack too deep errors
        // get the process with id=1
        (address _creator, uint256 _censusRoot, uint256 _charterHash, uint256 _result) =
            charterovote.processes(1);

        assertEq(_creator, 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496); // address of creator
        assertEq(_censusRoot, 1234);
        assertEq(_charterHash, 4321);
        assertEq(_result, 0);
        }


        // create a 2nd process with the exact same parameters
        id = charterovote.newProcess(1234, 4321);
        assertEq(id, 2);
        // get the process with id=2
        { // scope for process 2, avoids stack too deep errors
        (address _creator, uint256 _censusRoot,
         uint256 _charterHash, uint256 _result) = charterovote.processes(2);

        assertEq(_creator, 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        assertEq(_censusRoot, 1234);
        assertEq(_charterHash, 4321);
        assertEq(_result, 0);
        }
    }

    // NOTE: to run this test, need to disable the line of
    // charter-ovote.sol#103 (to prevent the contract from verifying the snark)
    function testvote() public {
        CheatCodes cheats = CheatCodes(HEVM_ADDRESS);

        // create a 1st process
        uint256 id = charterovote.newProcess(1234, 4321);
        assertEq(id, 1);

        (address _creator, uint256 _censusRoot, uint256 _charterHash, uint256 _result) =
            charterovote.processes(id);

        assertEq(_creator, 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496); // address of creator
        assertEq(_censusRoot, 1234);
        assertEq(_charterHash, 4321);
        assertEq(_result, 0);

        // fake snark proof
        uint256[2] memory a = [uint256(1),2];
        uint256[2] memory b1 = [uint256(3),4];
        uint256[2] memory b2 = [uint256(5),6];
        uint256[2] memory c = [uint256(7),8];
        charterovote.vote(id, 1111, 1, 5, a, [b1, b2], c);

        // check that now result includes the vote
        (_creator, _censusRoot, _charterHash, _result) =
            charterovote.processes(1);
        assertEq(_result, 5); // vote weight=5

        // try to vote again reusing the same nullifier
        cheats.expectRevert(bytes("nullifier already used"));
        charterovote.vote(id, 1111, 1, 5, a, [b1, b2], c);

        // now again with a different nullifier
        charterovote.vote(id, 1112, 1, 5, a, [b1, b2], c);

        // check that now result includes the two votes
        (_creator, _censusRoot, _charterHash, _result) =
            charterovote.processes(1);
        assertEq(_result, 10); // 10 = 2 * 5 (weights)

        // create a 2nd process
        id = charterovote.newProcess(1234, 4321);
        assertEq(id, 2);
        // vote in this new process, with the nullifier used in the previous
        // process, which has not been used in this one
        charterovote.vote(id, 1111, 1, 5, a, [b1, b2], c);
        // try to vote again reusing the same nullifier in this process
        cheats.expectRevert(bytes("nullifier already used"));
        charterovote.vote(id, 1111, 1, 5, a, [b1, b2], c);

        // vote using votevalue=0
        charterovote.vote(id, 1112, 0, 5, a, [b1, b2], c);

        // try to vote with a votevalue !={0,1]
        cheats.expectRevert(bytes("invalid votevalue"));
        charterovote.vote(id, 1113, 2, 5, a, [b1, b2], c);
    }
}
