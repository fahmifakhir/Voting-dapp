//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract VoterDataMerkle {

    mapping(uint => bytes32) public votingToRoot;
    mapping(uint => bytes32[]) public votingToLeaves;
    mapping(address => bytes32) public addressToLeave;
    mapping(address => uint) public ownedLeaf;
    


    function addLeaf(uint _votingId, bytes32 _leaf, bytes32 _newRoot, address _voter) external {
        bool result = checkLeaf(_votingId,_leaf,_voter);
        require(result, "leaf and address cant be used twice");
        votingToLeaves[_votingId].push(_leaf);
        addressToLeave[_voter] = _leaf;
        setRoot(_votingId, _newRoot);
        ownedLeaf[_voter] ++;
    }
    function checkLeaf (uint _votingId, bytes32 _leaf, address _voter) public view returns(bool){
        bool result;
        bytes32[] memory leaves = votingToLeaves[_votingId];
        uint length = leaves.length;
        if(length == 0) {
            result = true;
        }else {
           for(uint i; i < length; i++) {
            if(leaves[i] != _leaf && ownedLeaf[_voter] == 0 ) {
              result = true;
                }
            }
        }
        return result;
    }

    function setRoot(uint _votingId, bytes32 _root) public {
        votingToRoot[_votingId] = _root;
    }

   function getLeaves(address _voter) external view returns(bytes32) {
        bytes32 voter = addressToLeave[_voter];
        return voter;
   }
   
    function verify(uint _votingId, bytes32[] calldata proof, bytes32 leaf) external view returns(bool){
        bytes32 root = votingToRoot[_votingId];
        return MerkleProof.verify(proof, root, leaf);
    }
    
}
