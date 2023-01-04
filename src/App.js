import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import About from "./About";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import AppHome from "./AppHome";
import AppProfile from "./AppProfile";

import keccak256 from "keccak256";
import Merkletree from "merkletreejs";
import VotingRoom from "./VotingRoom";
import CreateVoting from "./CreateVoting";
import RegisterVoting from "./RegisterVoting";

function App() {
  const [account, setAccount] = useState([]);
  const [app, setApp] = useState(false);
  
  return (
    <div className="App vh-100">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Navbar
                app={app}
                setApp={setApp}
                account={account}
                setAccount={setAccount}
              />
            }
          >
            <Route index element={<Home app={app} setApp={setApp} />} />
            <Route path="about" element={<About app={app} setApp={setApp} />} />
            <Route path="/app/">
              <Route
                index
                element={
                  <AppHome
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="profile"
                element={
                  <AppProfile
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="voting/:roomId"
                element={
                  <VotingRoom
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <CreateVoting
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="register"
                element={
                  <RegisterVoting
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-center" closeOnClick={false} />
    </div>
  );
}

export default App;