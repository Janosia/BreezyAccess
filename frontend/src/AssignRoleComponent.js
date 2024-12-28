import React, { useState, useEffect } from "react";
import Web3 from "web3";
import AssignRoleAbi from "./contracts/AssignRole.json";


function AssignRoleComponent() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  
  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

    async function initializeWeb3() {
      const web3Instance = new Web3(provider);
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetworkRole = AssignRoleAbi.networks[networkId];
      const contractRole = new web3Instance.eth.Contract(
        AssignRoleAbi.abi,
        deployedNetworkRole.address
      );
      await provider.request({ method: "eth_requestAccounts" });
          // Accounts now exposed
          const accounts = await web3Instance.eth.getAccounts();
          setUserAddress(accounts[0]);

      setWeb3(web3);
      setContract(contractRole);
    }

    provider && initializeWeb3();
  }, []);
  
    const handleSetRole = async () => {
      try {
        const gasLimit = 200000;
        const designation=document.querySelector("#value1").value;
        const val = await contract.methods.users(0).call();
        console.log(val);
        const isRegistered = await contract.methods.RegisteredUsers(val).call();
        console.log("Registered status for sender:", isRegistered);
        const transaction=await contract.methods.setRole(designation, userAddress).send({
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
    <div>
      <h2>AssignRole </h2>
      <div>
       
        <label>Enter Designation</label>
        <input
          type="text"
          id="value1"
          
        ></input>
        <button onClick={handleSetRole}>Set Role</button>
      </div>
      <div>{outputMessage}</div>
    
    </div>
  );
}

export default AssignRoleComponent;
