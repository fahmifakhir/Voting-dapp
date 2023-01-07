import React, { useEffect } from "react";

const About = ({ app, setApp }) => {
  useEffect(() => {
    setApp(false);
  });
  return (
    <div className="container-fluid h-100">
      <div className="row align-items-center h-25">
        <h1 id="about-title" className="p-1 m-2 text-center">
          About the System
        </h1>
      </div>

      <div>
        <p className="middle-text indented">
          Voting is a means of reaching a collective decision. In its
          implementation there are many shortcomings, in terms of the expenses,
          fraud, and security. This website use the Implementation of blockchain
          infrastructure on the E-voting system. Our goal is to provide
          efficient online voting while still ensuring security, privacy, and
          transparency of the election.
        </p>
        <p className="middle-text indented">
          One of the key benefits of a blockchain-based voting system is that it
          eliminates the need for a trusted third party, such as a government
          agency or an election commission, to manage the vote count. Instead,
          the votes are recorded and counted directly by the network of
          computers, which are programmed to follow a set of predetermined
          rules. This makes it virtually impossible for any single entity to
          manipulate the outcome of the election.
        </p>
        <p className="middle-text indented">
          In addition to providing security and transparency, a blockchain-based
          voting system can also help to improve the efficiency of the electoral
          process. Because the system is automated, it can eliminate the need
          for manual vote counting, which can be time-consuming and prone to
          errors.
        </p>
      </div>
    </div>
  );
};

export default About;
