import React, { useEffect } from "react";
import ReactPlayer from "react-player";

const About = ({ app, setApp }) => {
  useEffect(() => {
    setApp(false);
  });
  return (
    <div className="container-fluid h-100">
      <div className="row align-items-center">
        <h1 id="about-title" className="p-1 m-2 text-center">
          How to Use
        </h1>
      </div>

      <div>
        <div className="middle-text">
          <h4>Set up your Metamask</h4>
          <p>
            MetaMask is a software cryptocurrency wallet used to interact with
            the Ethereum blockchain. since our website is using ethereum
            blockchain, Metamask is needed to let you interact with our voting
            system.
          </p>
          <p>
            To set up your metamask on your browser,
            <ol>
              <li>
                Go to the browser web store and install metamask extension
              </li>
              <li>set up your account</li>
              <li>change your network into Goerli Test network</li>
              <li>Go to Goerli faucet to ask for ballance</li>
            </ol>
            Or you can follow this video :
          </p>
            <ReactPlayer url= "https://youtu.be/luoSbbb37Rs" controls ={true}/>
          <h4>Connect your account</h4>
          <p>Click connect button on the top right of the website, then you can
          proceed to the Application Page, you can also change your address
          wallet to your preferabble one</p>
          <h4>Register for voting session</h4>
          <p>Go to register page, input the data that needed. disclaimer : data
          inputted only can be used by one voting session and Only eligble voter
          can registered to the voting session.</p>
          <h4>Vote</h4>
          <p>Vote only can be done if you are already registered as eligble voter
          to that voting session. once the vote is already submitted, you can
          always check for the vote result from the voting room and your profile
          page</p>
          <br></br>
          <br></br>
        </div>
      </div>
    </div>
  );
};

export default About;
