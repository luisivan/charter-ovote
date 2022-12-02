// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.10;

import "ds-test/test.sol";
import "src/charter-ovote.sol";

interface CheatCodes {
    function roll(uint256) external;
    function expectRevert(bytes calldata) external;
}

contract OVOTETest is DSTest {
    CharterOVOTE charterovote;

    function setUp() public {
        charterovote = new CharterOVOTE();
    }

    function testNewProcessReferendum() public {
        // create a 1st process
        uint256 id = charterovote.newProcess(2222, 1111, 1000, 100, 10, 1);
        assertEq(id, 1);

        { // scope for process 1, avoids stack too deep errors
        // get the process with id=1
        (address _creator, uint256 _transactionHash, uint256 _censusRoot,
         uint256 _charterHash, uint64 _ethEndBlockNum, uint64
         _resultsPublishingWindow, uint8 _minParticipation, uint8 _typ, bool
         _closed) = charterovote.processes(1);

        assertEq(_creator, 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84); // address of creator
        assertEq(_transactionHash, 2222);
        assertEq(_censusRoot, 1111);
        assertEq(_ethEndBlockNum, 1000);
        assertEq(_resultsPublishingWindow, 100);
        assertEq(_minParticipation, 10);
        assertEq(_typ, 1);
        assertTrue(!_closed);
        }


        // create a 2nd process with the exact same parameters
        id = charterovote.newProcess(2222, 1111, 1000, 1000, 100, 10, 1);
        assertEq(id, 2);
        // get the process with id=2
        { // scope for process 2, avoids stack too deep errors
        (address _creator, uint256 _transactionHash, uint256 _censusRoot,
         uint256 _charterHash, uint64 _ethEndBlockNum, uint64
         _resultsPublishingWindow, uint8 _minParticipation, uint8 _typ, bool
         _closed) = charterovote.processes(2);

        assertEq(_creator, 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84);
        assertEq(_transactionHash, 2222);
        assertEq(_censusRoot, 1111);
        assertEq(_ethEndBlockNum, 1000);
        assertEq(_resultsPublishingWindow, 100);
        assertEq(_minParticipation, 10);
        assertEq(_typ, 1);
        assertTrue(!_closed);
        }
    }

    function testPublishResultReferendum() public {
        CheatCodes cheats = CheatCodes(HEVM_ADDRESS);

        // create a 1st process
        uint256 id = charterovote.newProcess(2222, 1111, 1000, 1000, 100, 10, 1);

        cheats.roll(1000);

        // publish result
        charterovote.publishResult(id, 3333, 204, 250);
        // publish another result containing more votes
        charterovote.publishResult(id, 3333, 204, 300);

        // expect revert when trying to publish a result with same amount of
        // votes than the last accepted one
        cheats.expectRevert(bytes("nVotes > results[id].nVotes"));
        charterovote.publishResult(id, 3333, 204, 300);

        // expect revert when trying to publish a result with more votes than
        // censusSize
        // cheats.expectRevert(bytes("nVotes <= processes[id].censusSize"));
        // charterovote.publishResult(id, 3333, 204, 1001);

        // expect revert when trying to publish a result for a process that does not exist
        cheats.expectRevert(bytes("process id does not exist"));
        charterovote.publishResult(2, 3333, 204, 300);
    }

    function testPublishResultMultisig() public {
        CheatCodes cheats = CheatCodes(HEVM_ADDRESS);

        // create a 1st process
        uint256 id = charterovote.newProcess(2222, 1111, 1000, 1000, 100, 10, 0);

        cheats.roll(1000);

        // expect error when trying to close a process of type multisig
        cheats.expectRevert(bytes("can not close multisig type, is closed through publishResult call"));
        charterovote.closeProcess(id);

        // publish result
        charterovote.publishResult(id, 3333, 204, 250);
        // publish another result containing more votes, expect revert, as in
        // multisig mode, the previous result has been already accepted
        cheats.expectRevert(bytes("process already closed"));
        charterovote.publishResult(id, 3333, 204, 300);

        // expect the process being closed
        (,,,,,,,, bool _closed) = charterovote.processes(1);
        assertTrue(_closed);

        // expect error when trying to close a process, as it has been already
        // closed by the publishResult call, as it's a multisig type process
        cheats.expectRevert(bytes("process already closed"));
        charterovote.closeProcess(id);
    }

    function testCloseProcessReferendum() public {
        CheatCodes cheats = CheatCodes(HEVM_ADDRESS);

        // create a 1st process
        uint256 id = charterovote.newProcess(2222, 1111, 1000, 1000, 100, 10, 1);
        assertEq(id, 1);

        // publish result
        cheats.roll(1000);
        charterovote.publishResult(id, 3333, 204, 300);

        // try to close process, but expect revert
        cheats.roll(1099);
        cheats.expectRevert(bytes("process.resPubStartBlock not reached yet"));
        charterovote.closeProcess(1);

        (,,,,,,,, bool _closed) = charterovote.processes(1);
        assertTrue(!_closed);

        // close process
        cheats.roll(1100);
        charterovote.closeProcess(1);

        (,,,,,,,, _closed) = charterovote.processes(1);
        assertTrue(_closed);
    }
}
