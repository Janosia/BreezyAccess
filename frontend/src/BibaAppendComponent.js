import React, { useState, useEffect } from "react";
import Web3 from "web3";

import AssignRoleABI from "./build/contracts/AssignRole.json";
import BibaAppendABI from "./build/contracts/BibaAppend.json";
import CaseABI from "./build/contracts/Case.json";

const BibaAppendComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [file, setFile] = useState(null);
  const [bibaAppendContract, setBibaAppendContract] = useState(null);
  const [assignRoleContract, setAssignRoleContract] = useState(null);
  
  const [outputMessage, setOutputMessage] = useState("");
  const [evidenceHash, setEvidenceHash] = useState('');
  const [CaseContract, setCaseContract]=useState(null);
  const [userAddress, setUserAddress] = useState("");

  useEffect(()=>{
    const provider=new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template(){
      const web3=new Web3(provider);
      //we need abi and contract address
      const networkId= await web3.eth.net.getId();
      
      //console.log(deployedNetwork.address);
      
      setWeb3(web3);
     

      const deployedNetworkrole=AssignRoleABI.networks[networkId];
      const contractrole=new web3.eth.Contract(AssignRoleABI.abi, deployedNetworkrole.address);
      //console.log(deployedNetworkrole.address);
      setAssignRoleContract(contractrole);

      const deployednetworkbiba=BibaAppendABI.networks[networkId];
      const contractbiba=new web3.eth.Contract(BibaAppendABI.abi,deployednetworkbiba.address);
      setBibaAppendContract(contractbiba);
      const deployedcase=CaseABI.networks[networkId];
      const contractcase=new web3.eth.Contract(
        CaseABI.abi,
        deployedcase.address,
      );
      await provider.request({ method: "eth_requestAccounts" });
          // Accounts now exposed
          const accounts = await web3.eth.getAccounts();
          setUserAddress(accounts[0]);
      setCaseContract(contractcase);
    }
    provider && template();
  },[]);

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file); // Read file content as text
    });
  };
  const hashDocument = async () => {
    try {
      if (!web3 || !file) {
        setOutputMessage('Error: Please wait for the blockchain to initialize and select a document.');
        return;
      }

      // Read the content of the file and hash it
      const fileContent = await readFileContent(file);
      const documentHash = web3.utils.sha3(fileContent); // Directly hash text content

      // Update state with the hashed document
      setEvidenceHash(documentHash);
      setOutputMessage('Document hashed successfully!');
    } catch (error) {
      console.error('Error hashing document:', error);
      setOutputMessage('Error hashing document. Please check the console for details.');
    }
  };
  

  const handleAppend = async () => {
    try {
      if (!evidenceHash) {
        setOutputMessage('Error: Please hash the document first.');
        return;
      }
  
      // Ensure evidenceHash is in the correct format
      const cleanedEvidenceHash = evidenceHash.startsWith('0x') ? evidenceHash.slice(2) : evidenceHash;
      const evidenceHashBytes32 = '0x' + cleanedEvidenceHash;
      // Convert the evidence hash to bytes32
     
  
      const key = document.querySelector("#value").value;
      
      const caseNumber = document.querySelector("#value3").value;
      
      const userRole = await assignRoleContract.methods.returnRole(userAddress).call();
      const keyLevel = await CaseContract.methods.returnLevel( caseNumber,key).call();
  
      console.log('User Level:', userRole);
      console.log('Object Level:', keyLevel);
      const ifallowed=await CaseContract.methods.is_authorized(userAddress,caseNumber).call();
      if(ifallowed){
  
      
  
      // Load contracts
      
  
      if (userRole >= keyLevel) {
        // User is authorized, proceed with appending
  
        const response = await bibaAppendContract.methods
          .append_allowed(key, userAddress, evidenceHashBytes32, caseNumber)
          .send({ from: userAddress, gas: 200000 });
  
        setOutputMessage(`Append successful.`);
          const transactionHash = response.transactionHash;
      console.log("Transaction Hash:", transactionHash);
      console.log("Timestamp:", new Date().toLocaleString());
      } else {
        setOutputMessage("User is not authorized to append to this evidence.");
      }
    }
    else{
      setOutputMessage("User is not authorized to access case");
    }
    } catch (error) {
      console.error("Error appending evidence:", error);
      setOutputMessage("Error appending evidence. Please check the input.");
    }
  };
  
    
  

  return (
    <div>
      <h2>Append</h2>
      <div>
        <label>Original Evidence Key</label>
        <input
          type="text"
          id="value"></input>
      
      </div>
      <div>
        <label>Select Document:</label>
        <input type="file" onChange={onFileChange} />
      </div>

      <button onClick={hashDocument}>Hash Document</button>

      <div>
        <label> To Append:</label>
        <input
          type="text"
          placeholder="hash generated"
          value={evidenceHash}
          readOnly
        />
      </div>
      <div>
        <label>Case Number</label>
        <input
          type="text"
          id="value3"></input>
      
      </div>
      <button onClick={handleAppend}>Append Evidence</button>
      <div>
        <p>{outputMessage}</p>
      </div>
    </div>
  );
}

export default BibaAppendComponent;
