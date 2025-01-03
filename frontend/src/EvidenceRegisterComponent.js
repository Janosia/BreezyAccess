import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EvidenceAbi from './contracts/BibaAppend.json';
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
  // const[CaseContract,setCaseContract] =useState(null);
  const [file, setFile] = useState(null);
  const [evidenceHash, setEvidenceHash] = useState('');
  const [evidenceLevel, setEvidenceLevel] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [message, setMessage] = useState('');
  // const[Rolecontract,setRolecontract]=useState(null);
  const[userAddress,setUserAddress]=useState("");
  const aont = new AONT();
  // "21ee47ad54d9db80a922";
  // "dfca70cec69ba419903c1179778db959feafb1ebd75b115563d9b87e01bf5299"
  const PINATA_API_KEY = "4a7861d0478a1ee8ba5f";
  const PINATA_API_SECRET = "5ec920966e991b3ea5c495f7a14426432a79f09d5f68a74caa36bbdfcae15fcd";

  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template() {
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      const deployedEvidenceNetwork = EvidenceAbi.networks[networkId];

      const contractEvidence = new web3.eth.Contract(EvidenceAbi.abi, deployedEvidenceNetwork.address);
      
      setWeb3(web3);
      setEvidenceContract(contractEvidence);

      await provider.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setUserAddress(accounts[0]);}
    provider && template();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    console.log("File selected:", selectedFile);
  };
  
  const uploadFile = async () => {
    try {
      if (!file) {
        setMessage(
          "Error: Please wait for the blockchain to initialize and select a document."
        );
        return;
      }
      const caseNum = parseInt(caseNumber, 10); 
      // const caseNum =document.querySelector(caseNumber).value;
      const gasLimit = 200000;
      const val =await evidenceContract.methods.register_evi(caseNum).send({
        from: userAddress,
        gas: gasLimit,
      });    

      if(!val){
        setMessage(
          "Error: You are not authorised to register evidence."
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
        // const KC = web3.utils.keccak256(cid);
        // console.log(KC);
        setEvidenceHash(cid); // Set the CID as evidence hash
        const val2 =await evidenceContract.methods.add_evidence(caseNum, userAddress,cid).send({
          from: userAddress,
          gas: gasLimit,
        });
        const events = val2.events;
        console.log(events);
        if (events) {
          const kc = events.returnValues.kc; // KC from the event
          console.log("KC value:", kc);
        }
        console.log(val2); 
        setMessage("File uploaded and encrypted successfully!");
      } else {
        throw new Error("Failed to upload file to Pinata.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please check the console for details.");
    }
  };

  const assignLevel = async () => {
    try {
      console.log(evidenceHash);
      const evidenceLvl = parseInt(evidenceLevel,10);
      const caseNum = parseInt(caseNumber, 10);
      const transaction=await evidenceContract.methods.assign_inl(caseNum,evidenceHash,evidenceLvl).send({
        from: userAddress,
        gas: 200000, 
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
        <input type="file" onChange={handleFileChange} />
      </div>
      <div>
        <label> Evidence Hash :</label>
        <input
          type="text"
          placeholder="Evidence Hash"
          value={evidenceHash}
          // onChange={(e) => setEvidenceHash(e.target.value)} // Allow input change
          readOnly
        />
      </div>
      
      <div>
        <label>Integrity Level</label>
        <input
          type="number"
          placeholder="Level"
          value={evidenceLevel}
          onChange={(e) => setEvidenceLevel(e.target.value)} // Allow input change
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

      <button onClick={uploadFile}>Register Evidence</button>
      <button onClick={assignLevel}>Assign Level</button>

      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default EvidenceComponent;
