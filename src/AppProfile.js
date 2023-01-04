import React, { useEffect, useState } from "react";
import NotConnected from "./NotConnected";
import DataABI from "./abi/Voting.json";
import { ethers } from "ethers";

const VotingContract = "0x463651Ae5b82a16ee90E1BC384c5A0461043a653";

const AppProfile = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const [voterHistory, setHistory] = useState([]);

  async function getVoterData() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(VotingContract, DataABI.abi, signer);
    const setVoterHistory = await contract.getVoterHistory(signer.getAddress());
    setHistory(setVoterHistory);
  }

  useEffect(() => {
    getVoterData();
    setApp(true);
  }, [isConnected]);

  return (
    <div className="container-fluid h-100 w-75">
      {isConnected ? (
        <>
          <div className="d-flex flex-column align-items-center">
            <h1 id="profile-title" className="m-2">
              Your Profile
            </h1>
            <img
              // className="p-5 bg-primary rounded-circle"
              src="https://img.icons8.com/ios/512/user-male-circle--v1.png"
              alt="..."
              width="100px"
              height="100px"
            />
            <h6 id="profile-address" className="m-2">
              {account[0]}
            </h6>
          </div>

          <div className="d-flex align-items-center">
            <div className="col-2">
              <h6 className="m-0 p-2">Voting History</h6>
            </div>
            <div className="col-8">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col" className="text-center fw-normal">
                      RoomId
                    </th>
                    <th scope="col" className="text-center fw-normal">
                      Candidate
                    </th>
                    <th scope="col" className="text-center fw-normal">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                    {voterHistory.map((hist, index) => (
                      <tr>
                        <td className="text-center">
                          {hist.votingId.toString()}
                        </td>
                        <td className="text-center">
                          {hist.candidateId.toString()}
                        </td>
                        <td className="text-center">
                          {hist.timeStamp.toString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default AppProfile;
