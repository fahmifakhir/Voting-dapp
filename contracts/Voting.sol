//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    struct Candidate {
        uint candidateId;
        bytes32 candidate;
        uint votes;
    }

    struct Detail {
        bytes32 title;
        uint duration;
        Candidate[] candidates;
        uint startTime;
        uint roomId;
        address proposer;
    }

    struct History {
        address voter;
        uint candidateId;
        uint timeStamp;
    }

    struct voterHistory {
        uint roomId;
        uint candidateId;
        uint timeStamp;
    }


    uint public votingCount = 1;
    mapping(uint => uint) public indexToRoomId;
    mapping(uint => Detail) public votingDetails;
    mapping(uint => History[]) public votingHistory;
    mapping(uint => address[]) public voterVerified;
    mapping(address => voterHistory[]) public voterToHistory;


    function createVoting(bytes32 _title, uint _duration, uint _startTime, uint _roomId, bytes32[] calldata _candidates) external onlyOwner {
        Detail storage details = votingDetails[votingCount];
        details.title = _title;
        details.duration = _duration;
        uint length = _candidates.length;
        for(uint i; i < length; ++i) {
            bytes32 candidate = _candidates[i];
            details.candidates.push(Candidate(i + 1, candidate, 0));
        }
        details.startTime = (_startTime * 1 hours) + block.timestamp;
        details.roomId = _roomId;
        details.proposer = msg.sender;
        indexToRoomId[votingCount] = _roomId; 
        votingCount ++;
    }

    function vote(uint _votingId, address _voter, uint _candidate) external {
        Detail memory details = votingDetails[_votingId];
        bool verified = checkVerifiedVoter(_votingId, _voter);
        bool voted = checkVoterVote(_votingId, _voter);
        uint startTime = details.startTime;
        uint duration = details.duration;
        uint totalDuration = startTime + (duration * 1 hours);

        require(verified == true, "You are not verified");
        require(voted == false, "You already voted to one of the candidates");
        require(startTime < block.timestamp, "Voting session has not started");
        require(totalDuration > block.timestamp, "Duration of the voting session is over");
        uint index = getCandidateIndex(_votingId, _candidate);
       
        Candidate[] storage  candidates= votingDetails[_votingId].candidates;
        candidates[index].votes = candidates[index].votes + 1;
        votingHistory[_votingId].push(History(_voter, _candidate, block.timestamp*1000));
        uint _roomId = indexToRoomId[_votingId]; 
        voterToHistory[_voter].push(voterHistory(_roomId , _candidate, block.timestamp*1000));

    }


    function getCandidateIndex(uint _votingId, uint _candidate) internal view returns(uint index) {
        Candidate[] memory  candidates= votingDetails[_votingId].candidates;
        uint length = candidates.length;
        for(uint i; i < length; ++i) {
            uint candidate = candidates[i].candidateId;
            if(candidate == _candidate) {
                index = i;
            }
        }  
    }

    function getCandidates(uint _votingId) external view returns(Candidate[] memory candidates) {
        candidates = votingDetails[_votingId].candidates;
    }

    function getHistory(uint _votingId) external view returns(History[] memory history) {
        history = votingHistory[_votingId];
    }

    function getVoterHistory(address _voter) external view returns( voterHistory[] memory) {
         voterHistory[] memory addressToHistory = voterToHistory[_voter];
         return addressToHistory; 
    }

    function checkVerifiedVoter(uint _votingId, address _voter) internal view returns(bool result) {
        address[] memory verified = voterVerified[_votingId];
        uint length = verified.length;
        for(uint i; i < length; ++i) {
            address _verified = verified[i];
            if(_verified ==_voter) {
                result = true;
            } else {
                result = false;
            }
        }
    }
    
    function checkVoterVote(uint _votingId, address _voter) internal view returns(bool result) {
        History[] memory votes = votingHistory[_votingId];
        uint length = votes.length;
        for(uint i; i < length; i++){
            address voter = votes[i].voter;
            if(voter == _voter){
                result = true;
            } else {
                result = false;
            }
        }
    }

    function verifyVoter(uint _votingId, bool _isVerified) external{
        bool verified = checkVerifiedVoter(_votingId, msg.sender);
        require(_isVerified, "You are not a verified voter");
        require(!verified, "You are already verified");
        voterVerified[_votingId].push(msg.sender);
    }

}
