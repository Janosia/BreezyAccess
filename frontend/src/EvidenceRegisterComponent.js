import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EvidenceAbi from './contracts/Evidence.json';
import AssignRole from './contracts/AssignRole.json';

function EvidenceComponent() {
  const [web3, setWeb3] = useState(null);
  const [evidenceContract, setEvidenceContract] = useState(null);
  const [file, setFile] = useState(null);
  const [evidenceHash, setEvidenceHash] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [message, setMessage] = useState('');
  const[Rolecontract,setRolecontract]=useState(null);
  const[userAddress,setUserAddress]=useState("");
  

  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template() {
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = EvidenceAbi.networks[networkId];

      const contractRegister = new web3.eth.Contract(EvidenceAbi.abi, deployedNetwork.address);
      const deployedrole=AssignRole.networks[networkId];
      const contractrole= new web3.eth.Contract(
        AssignRole.abi,
        deployedrole.address,
      );
      setRolecontract(contractrole);
      setWeb3(web3);
      setEvidenceContract(contractRegister);

      await provider.request({ method: "eth_requestAccounts" });
          // Accounts now exposed
          const accounts = await web3.eth.getAccounts();
          setUserAddress(accounts[0]);
    }
    provider && template();
  }, []);

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
        setMessage('Error: Please wait for the blockchain to initialize and select a document.');
        return;
      }

      // Read the content of the file and hash it
      const fileContent = await readFileContent(file);
      const documentHash = web3.utils.sha3(fileContent); // Directly hash text content

      // Update state with the hashed document
      setEvidenceHash(documentHash);
      setMessage('Document hashed successfully!');
    } catch (error) {
      console.error('Error hashing document:', error);
      setMessage('Error hashing document. Please check the console for details.');
    }
  };


  const registerEvidence = async () => {
    try {
      if (!evidenceHash) {
        setMessage('Error: Please hash the document first.');
        return;
      }
  
      // Ensure evidenceHash is in the correct format
      const cleanedEvidenceHash = evidenceHash.startsWith('0x') ? evidenceHash.slice(2) : evidenceHash;
  
      // Convert the evidence hash to bytes32
      const evidenceHashBytes32 = '0x' + cleanedEvidenceHash;
  
      // Call the _register_evidence function from the contract
      const transaction=await evidenceContract.methods.level_assignment(evidenceHashBytes32,caseNumber).send({
        from: userAddress, // Use accounts[0] as the sender
        gas: 200000, // Adjust gas limit based on your contract
      });
      const transactionHash = transaction.transactionHash;
      console.log("Transaction Hash:", transactionHash);
      console.log("Timestamp:", new Date().toLocaleString());
  
      setMessage('Evidence registered successfully!');
    } catch (error) {
      console.error('Error registering evidence:', error);
      setMessage('Error registering evidence. Please check the console for details.');
    }
  };
  

  const assignLevel = async () => {
    try {
      // Call the level_assignment function from the contract
      const cleanedEvidenceHash = evidenceHash.startsWith('0x') ? evidenceHash.slice(2) : evidenceHash;
  
      // Convert the evidence hash to bytes32
      const evidenceHashBytes32 = '0x' + cleanedEvidenceHash;
  
      const transaction=await evidenceContract.methods._register_evidence(evidenceHashBytes32,caseNumber).send({
        from: userAddress,
        gas: 200000, // Adjust gas limit based on your contract
      });
      const transactionHash = transaction.transactionHash;
      console.log("Transaction Hash:", transactionHash);
      console.log("Timestamp:", new Date().toLocaleString());

      setMessage('Level assigned successfully!');
    } catch (error) {
      console.error('Error assigning level:', error);
      setMessage('Error assigning level. Please check the console for details.');
    }
  };

  return (
    <div>
      <h1>Evidence Management System</h1>

      <div>
        <label>Select Document:</label>
        <input type="file" onChange={onFileChange} />
      </div>

      <button onClick={hashDocument}>Hash Document</button>

      <div>
        <label>Evidence Hash:</label>
        <input
          type="text"
          placeholder="Evidence Hash"
          value={evidenceHash}
          readOnly
        />
      </div>

      <div>
        <label>Case Number:</label>
        <input
          type="number"
          placeholder="Enter case number"
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
        />
      </div>

      <button onClick={registerEvidence}>Register Evidence</button>
      <button onClick={assignLevel}>Assign Level</button>

      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default EvidenceComponent;
