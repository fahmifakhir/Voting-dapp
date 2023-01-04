import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VotingABI from "./abi/Voting.json";
import DataABI from "./abi/VoterDataMerkle.json";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import NotConnected from "./NotConnected";
import { fromUnixTime, getTime, set } from "date-fns";

import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "react-toastify";
import { is } from "date-fns/locale";

import data1 from "../src/data/voterdata1.json";
import data2 from "../src/data/voterdata2.json";

const whitelist = [data1, data2];
let finalArray;

const VotingContract = "0x463651Ae5b82a16ee90E1BC384c5A0461043a653";

const VoterContract = "0x9bA779077768AfD239705C9aceAc88135C91ff02";

const VotingRoom = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const { roomId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [details, setDetails] = useState();
  const [history, setHistory] = useState();
  const [selected, setSelected] = useState(0);
  const [proof, setProof] = useState("");
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const votingContract = new ethers.Contract(
    VotingContract,
    VotingABI.abi,
    signer
  );
  const voterContract = new ethers.Contract(VoterContract, DataABI.abi, signer);
  
  async function getVotingDetails(){

    const history = await votingContract.getHistory(roomId);
    const details = await votingContract.votingDetails(roomId);
    const candidates = await votingContract.getCandidates(roomId);
    
    setCandidates(candidates);
    setDetails(details);
    setHistory(history);
    getStatus(details);
  }

  async function getStatus(details) {
    const timeNow = getTime(new Date());
    const duration = details.duration * 3600000;
    const timeStart = details.startTime * 1000;
    const totalDuration = timeStart+duration;

    if (timeNow > timeStart && timeNow < totalDuration) {
      setStatus("Started");
    } else if (timeStart > timeNow) {
      setStatus("Not Started");
    } else {
      setStatus("Session Ended");
    }

  }
  async function vote() {
    setSending(true);
    try {
      await votingContract.vote(roomId, signer.getAddress(), selected).then(
        (response) => {
          toast
            .promise(provider.waitForTransaction(response.hash), {
              pending: "🗳️ Sending voting data...",
              success: "Successfully voted for Candidate " + selected,
              error: "Transaction Failed",
            })
            .then(
              () => {
                setSending(false);
                getVotingDetails();
              },
              (error) => {
                setSending(false);
              }
            );
        },
        (error) => {
          setSending(false);
          toast.error(error.message, {
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            progress: undefined,
          });
        },
        (error) => {
          setSending(false);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  const onRadioChange = (event) => {
    setSelected(event.target.value);
    console.log(selected);
  };

  const onProofChange = (event) => {
    const proof = event.target.value;
    setProof(proof);
  };

  async function sendProof() {
    setSending(true);
    const votingLength = await votingContract.votingCount() - 1;

    for (let i = 0; i < votingLength; i++) {
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
    
    const voterAddress = await signer.getAddress();
    const leafBytes = await voterContract.getLeaves(voterAddress);
    const hexProof = WhitelistTree.getHexProof(leafBytes);
    
    
    const rootHash = await voterContract.votingToRoot(votingLength);
    const isVerified = WhitelistTree.verify(hexProof, leafBytes, rootHash);
    WhitelistTree.verify(hexProof, leafBytes, rootHash);

    console.log(isVerified);
    
    if(isVerified === true){
      setVerified(isVerified);
      try {
      await votingContract.verifyVoter(roomId, isVerified).then(
        (response) => {
          toast
            .promise(provider.waitForTransaction(response.hash), {
              pending: "🗳️ Validating your data...",
              success: "Validation Success!",
              error: "Transaction Failed",
            })
            .then(() => {
              setSending(false);
              getVotingDetails();
            });
        },
        (error) => {
          setSending(false);
        }
      );
    } catch (error) {
      console.log(error);
    }
  } else {
    setSending(false);
    toast.error("Your not a verified voter", {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      progress: undefined,
    });
  }
}
    

  useEffect(() => {
    getVotingDetails();
    setApp(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        window.location.reload();
      }
    });

    window.ethereum.on("accountsChanged", function (accounts) {
      window.location.reload();
    });
  }, [isConnected]);

  return (
    <div className="container-fluid h-100 w-75">
      {isConnected ? (
        verified ? (
          <>
            <div className="row justify-content-center">
              <h2 id="voting-title" className="text-center col-12">
                {ethers.utils.parseBytes32String(details.title)}
              </h2>
              <div className="col-12 d-flex justify-content-between">
                <h5 id="voting-status" className="p-2 px-3 rounded-pill">
                  {status}
                </h5>
                <h5 id="voting-proposed" className="p-2 rounded-pill">
                  Proposed by {details.proposer.slice(0, 10)}...
                </h5>
              </div>
            </div>

            <div className="row justify-content-center">
              {candidates.map((candidate, index) => (
                <div id="candidates-card" key={index} className="col p-3 m-2">
                  <h5 id="candidate">
                    {ethers.utils.parseBytes32String(candidate.candidate)}
                  </h5>
                  <h6 id="votes">{candidate.votes.toString()}</h6>
                </div>
              ))}
            </div>
            <div className="row justify-content-between h-50">
              <div id="vote-history-card" className="col-4 m-2 p-0">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center fw-normal">
                        Address
                      </th>
                      <th scope="col" className="text-center fw-normal">
                        Candidate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((hist, index) => (
                      <tr>
                        <td className="text-center">
                          {hist.voter.slice(0, 12)}...
                        </td>
                        <td className="text-center">
                          {hist.candidateId.toString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div id="vote-candidates-card" className="col m-2">
                <h3 id="title" className="text-center p-3">
                  Vote for the Candidates
                </h3>
                <div className="row justify-content-center">
                  {candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="col d-flex flex-column align-items-center"
                    >
                      <img src="" alt="candidates" />
                      <h6 className="p-2 text-center">
                        {ethers.utils.parseBytes32String(candidate.candidate)}
                      </h6>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="exampleRadios"
                          id="exampleRadios1"
                          value={candidate.candidateId.toString()}
                          onChange={onRadioChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row justify-content-center">
                  <div className="col-4 text-center">
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
                      <button
                        id="voting-submit"
                        className="btn rounded-pill px-4"
                        onClick={vote}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            id="voter-verify"
            className="vh-100 vw-100 d-flex flex-column justify-content-center align-items-center"
          >
            <h2 id="verify" className="p-3">
              Verify Your Data
            </h2>
            <div>
              <h6>{account[0]}</h6>
              <div
                id="form-text"
                className="form-text text-center"
                placeholder="identifier-your name-birthdate"
              >
                Please make sure the address is correct
              </div>
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
              <button id="find-button" className="btn px-3" onClick={sendProof}>
                Verify
              </button>
            )}
          </div>
        )
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default VotingRoom;
