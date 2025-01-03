import React, { useState, useEffect } from "react";
import Web3 from "web3";
// import AssignRoleAbi from "./contracts/AssignRole.json";
import "./index.css"
import CaseAbi from './contracts/BibaAppend.json';

function AssignRoleComponent() {
  const [web3, setWeb3] = useState(null);
  // const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const [Casecontract, setcaseContract] = useState(null);

  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

    async function initializeWeb3() {
      const web3 = new Web3(provider);
      setWeb3(web3);      
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CaseAbi.networks[networkId];
      const contractRegister = new web3.eth.Contract(CaseAbi.abi, deployedNetwork.address);
      
      // const deployedNetworkRole = AssignRoleAbi.networks[networkId];
      
      // const contractRole = new web3Instance.eth.Contract(
      //   AssignRoleAbi.abi,
      //   deployedNetworkRole.address
      // );
      
      
      // Accounts now exposed
      const accounts = await web3.eth.getAccounts();
      setUserAddress(accounts[0]);
     
      // setWeb3(web3);
      // setContract(contractRole);
      setcaseContract(contractRegister);  
    }
    provider && initializeWeb3();
  }, []);
  
    const handleSetRole = async () => {
      try {
        const gasLimit = 200000;
        const designation=document.querySelector("#value1").value;
        // const val = await contract.methods.users(0).call();
        // console.log(val);
        // const isRegistered = await contract.methods.RegisteredUsers(val).call();
        // console.log("Registered status for sender:", isRegistered);
        const transaction=await Casecontract.methods.setRole(designation).send({
          from: userAddress,
          gas: gasLimit,
        });
        const transactionHash = transaction.transactionHash;
        setOutputMessage("successfully registered");
        console.log("Transaction Hash:", transactionHash);
        console.log("Timestamp:", new Date().toLocaleString());
      } catch (error) {
        console.error("Error setting role:", error);
        if (error.message.includes("User Already Registered")) {
          setOutputMessage("User already exists");
          console.log("User already exists");
        } else {
          setOutputMessage("Error registering");
        }
      }
    };
    

  return (
    <div className="BibaAppend">
      <h2 className="Append-Heading"> User Registration </h2>
      <div className = "AppendContent">
       
        <label  className="Text-BibaAppend">Enter Designation</label>
        <input
          type="text"
          id="value1"
          
        ></input>
        <button className="Final-Append-Button" onClick={handleSetRole}>Register</button>
      </div>
      <div>{outputMessage}</div>
    
    </div>
  );
}

export default AssignRoleComponent;
