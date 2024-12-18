import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EvidenceAbi from './contracts/Evidence.json';
import AssignRoleAbi from './contracts/AssignRole.json';
import CaseABI from './contracts/Case.json';
import AONT from './AONT';
import axios from "axios";
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file); // Read file content as ArrayBuffer
  });
};

function EvidenceComponent() {
  const [web3, setWeb3] = useState(null);
  const [evidenceContract, setEvidenceContract] = useState(null);
  const[CaseContract,setCaseContract] =useState(null);
  const [file, setFile] = useState(null);
  const [evidenceHash, setEvidenceHash] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [message, setMessage] = useState('');
  const[Rolecontract,setRolecontract]=useState(null);
  const[userAddress,setUserAddress]=useState("");
  const aont = new AONT();
  const PINATA_API_KEY = "21ee47ad54d9db80a922";
  const PINATA_API_SECRET = "dfca70cec69ba419903c1179778db959feafb1ebd75b115563d9b87e01bf5299";

  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template() {
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      const deployedEvidenceNetwork = EvidenceAbi.networks[networkId];

      const contractEvidence = new web3.eth.Contract(EvidenceAbi.abi, deployedEvidenceNetwork.address);
      const deployedRoleNetwork=AssignRoleAbi.networks[networkId];
      const contractrole= new web3.eth.Contract(
        AssignRoleAbi.abi,
        deployedRoleNetwork.address,
      );
      const deployedCaseNetwork= CaseABI.networks[networkId];
      const contractCase= new web3.eth.Contract(CaseABI.abi, deployedCaseNetwork.address);
      setCaseContract(contractCase);
      setRolecontract(contractrole);
      setWeb3(web3);
      setEvidenceContract(contractEvidence);

      await provider.request({ method: "eth_requestAccounts" });
          // Accounts now exposed
          const accounts = await web3.eth.getAccounts();
          setUserAddress(accounts[0]);
    }
    provider && template();
  }, []);
  const uploadFile = async () => {
    try {
      if (!file) {
        setMessage(
          "Error: Please wait for the blockchain to initialize and select a document."
        );
        return;
      }
  
      // Read the file as an ArrayBuffer for encryption
      const fileContent = await readFileAsArrayBuffer(file);
  
      // Encrypt the file using AONT
      const { encryptedDt, difference, nonce } = await aont.encode_aont(fileContent);
  
      // Prepare data for Pinata
      const formData = new FormData();
      formData.append("file", new Blob([encryptedDt], { type: file.type }), file.name);
  
      const metadata = JSON.stringify({
        name: file.name,
        key_difference: Array.from(difference),
        nonce: Array.from(nonce),
      });
      formData.append("pinataMetadata", metadata);
  
      // Pinata API keys
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const headers = {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      };
  
      // Upload to Pinata
      const response = await axios.post(url, formData, { headers });
  
      if (response.status === 200) {
        const cid = response.data.IpfsHash; // CID from Pinata
        setEvidenceHash(cid); // Set the CID as evidence hash
        setMessage("File uploaded and encrypted successfully!");
      } else {
        throw new Error("Failed to upload file to Pinata.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please check the console for details.");
    }
  };

  /*const onFileChange = (event) => {
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
   */

  const registerEvidence = async () => {
    try {
      if (!evidenceHash) {
        setMessage('Error: Please hash the document first.');
        return;
      }
  
      // Ensure evidenceHash is in the correct format
      //const cleanedEvidenceHash = evidenceHash.startsWith('0x') ? evidenceHash.slice(2) : evidenceHash;
  
      // Convert the evidence hash to bytes32
      //const evidenceHashBytes32 = '0x' + cleanedEvidenceHash;
  
      // Call the _register_evidence function from the contract
      const transaction=await evidenceContract.methods.level_assignment(evidenceHash,caseNumber).send({
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
      //const cleanedEvidenceHash = evidenceHash.startsWith('0x') ? evidenceHash.slice(2) : evidenceHash;
  
      // Convert the evidence hash to bytes32
      //const evidenceHashBytes32 = '0x' + cleanedEvidenceHash;
  
      const transaction=await evidenceContract.methods._register_evidence(evidenceHash,caseNumber).send({
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
        <input type="file"  />
      </div>

      <button onClick={uploadFile}>upload Document</button>

      <div>
        <label>CID:</label>
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
