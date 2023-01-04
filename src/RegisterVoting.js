import React, { useEffect, useState } from "react";
import VotingABI from "./abi/Voting.json";
import DataABI from "./abi/VoterDataMerkle.json";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import NotConnected from "./NotConnected";
import { toast } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";

import data1 from "../src/data/voterdata1.json";
import data2 from "../src/data/voterdata2.json";
import { set } from "date-fns";

const VotingContract = "0x463651Ae5b82a16ee90E1BC384c5A0461043a653";
const VoterContract = "0x9bA779077768AfD239705C9aceAc88135C91ff02";

const whitelist = [data1, data2];
let finalArray;

const RegisterVoting = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const [roomId, setRoomId] = useState(0);
  const [data, setData] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [Birthdate, setBirthdate] = useState("");
  const [sending, setSending] = useState(false);
 

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const votingContract = new ethers.Contract(
    VotingContract,
    VotingABI.abi,
    signer
  );
  const voterContract = new ethers.Contract(VoterContract, DataABI.abi, signer);

  async function VoterCheck(result) {
    for (let i = 0; i < result; i++) {
      const object = Object.values(data1.voterData);
      finalArray = object.map(function (obj) {
        return [obj.identifier, obj.name, obj.birthdate];
      });
    }
    const WhitelistLeaves = finalArray.map((voter) =>
      keccak256(Buffer.from(voter)).toString("hex")
    );
    const WhitelistTree = new MerkleTree(WhitelistLeaves, keccak256, {
      sortPairs: true,
    });
    const ToHex = (voter) => "0x" + voter.toString("hex");
    const rootHash = WhitelistTree.getRoot();

    console.log("The Root Hash is : " + ToHex(WhitelistTree.getRoot()));

    const leaf = [identifier, name, Birthdate];
    const leafHashed = keccak256(leaf);
    const leafBytes = ToHex(leafHashed);
    const voterAddress = await signer.getAddress();
    
    console.log(leaf);
    console.log("The New Leaf is : " + leafBytes);
    console.log('voter address : '+ voterAddress);

    const hexProof = WhitelistTree.getHexProof(leafBytes);
    
    console.log(WhitelistTree.verify(hexProof, leafBytes, rootHash));
    
    if (hexProof.length > 0) {
      try {
        await voterContract.addLeaf(result, leafBytes, rootHash, voterAddress).then(
          (response) => {
            toast
              .promise(provider.waitForTransaction(response.hash), {
                pending: "🗳️ Adding your data to Room " + roomId + "...",
                success: "Data successfully added",
                error: "Transaction Failed",
              })
              .then(() => {
                setSending(false);
              });
          },
          (error) => {
            setSending(false);
          }
        );
      } catch (error) {
        console.log(error);
      }
    }else {
      setSending(false);
      toast.error("Your not eligble voter to this room", {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        progress: undefined,
      });
    }
  }

  async function enterRoom() {
    setSending(true);
    try {
      let exist;
      const votingLength = await votingContract.votingCount();
      let votingRoom;
      for (let i = 0; i < votingLength; i++) {
        votingRoom = await votingContract.votingDetails(i);
        if (votingRoom.roomId.toString() === roomId) {
          console.log("the room id :" + roomId);
          console.log("the session index :" + i);
          exist = i;
        }
      }
      if (exist !== undefined) {
        VoterCheck(exist);
      } else {
        setSending(false);
        toast.error("Voting room " + roomId + " not found", {
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const onInputChange = (event) => {
    setRoomId(event.target.value);
  };

  useEffect(() => {
    setApp(true);
  });

  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100">
      {isConnected ? (
        <>
          <div className="d-flex flex-column align-items-center justify-content-center h-75">
            <h1 id="app-title" className="text-center m-2">
              Register Your Data
            </h1>

            <div className="w-20 m-2">
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={onInputChange}
                value={roomId}
              />
              <div id="form-text" className="form-text text-center">
                Input the voting room code above
              </div>
            </div>
            <div className="w-20 m-2">
              <h6>Identifier Number</h6>
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={(e) => setIdentifier(e.target.value)}
                value={identifier}
              />
            </div>
            <div className="w-20 m-2">
              <h6>Your Name</h6>
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="w-20 m-2">
              <h6>Birthdate (dd-mm-yyyy)</h6>
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={(e) => setBirthdate(e.target.value)}
                value={Birthdate}
              />
            </div>
            {sending ? (
              <div className="w-20 m-2 d-flex flex-column justify-content-center align-items-center">
                <PuffLoader
                  id="loader"
                  color="black"
                  loading={sending}
                  speedMultiplier="1"
                  size={60}
                  className="m-3"
                />
                <h6 id="form-text">Adding your data..</h6>
              </div>
            ) : (
              <button id="find-button" className="btn px-3" onClick={enterRoom}>
                Submit
              </button>
            )}
          </div>
        </>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default RegisterVoting;
