import React, { useState, useEffect } from "react";
import "./BibaAppend.css";
import Web3 from "web3";

import AssignRoleABI from "./contracts/AssignRole.json";
import BibaAppendABI from "./contracts/BibaAppend.json";
import CaseABI from "./contracts/Case.json";
import axios from "axios";
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file); // Read file content as ArrayBuffer
  });
};

class AONT {
  constructor() {
      this.CANARY_SIZE = 16;
      this.KEY_SIZE = 32;
  }

  async generateKey() {
      return crypto.getRandomValues(new Uint8Array(this.KEY_SIZE));
  }

  async encrypt(data, key, nonce) {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      const dataWithCanary = new Uint8Array(encodedData.length + this.CANARY_SIZE);
      dataWithCanary.set(encodedData);

      const cryptoKey = await crypto.subtle.importKey(
          'raw',
          key,
          { name: 'AES-GCM' },
          false,
          ['encrypt']
      );

      return crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: nonce },
          cryptoKey,
          dataWithCanary
      );
  }

  async hash(data) {
      let arrayBuffer;

      if (data instanceof ArrayBuffer) {
          arrayBuffer = data;
      } else if (data instanceof Uint8Array) {
          arrayBuffer = data.buffer;
      } else if (typeof data === 'string') {
          const encoder = new TextEncoder();
          arrayBuffer = encoder.encode(data).buffer;
      } else {
          throw new Error('Invalid data type. Expected ArrayBuffer, Uint8Array, or string.');
      }

      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      return new Uint8Array(hashBuffer);
  }

  XOR_Buffer(key, hash) {
      const result = new Uint8Array(key.length);
      for (let i = 0; i < key.length; i++) {
          result[i] = key[i] ^ hash[i];
      }
      return result;
  }

  async encode_aont(data) {
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.generateKey();

      const encryptedDt = await this.encrypt(data, key, nonce);
      const hashedData = await this.hash(encryptedDt);
      const difference = this.XOR_Buffer(key, hashedData);

      return { encryptedDt, difference, nonce };
  }

  async decode(encryptedDt, difference, nonce) {
      const hashedDt = await this.hash(encryptedDt);
      const key = this.XOR_Buffer(difference, hashedDt);

      return this.decrypt(encryptedDt, key, nonce);
  }

  async decrypt(encryptedData, key, nonce) {
      const cryptoKey = await crypto.subtle.importKey(
          'raw',
          key,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
      );

      const decryptedData = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: nonce },
          cryptoKey,
          encryptedData
      );

      return new Uint8Array(decryptedData);
  }
}

// async function main() {
//   const aont = new AONT();
//   const ogDATA = "HI I AM JANOSIA";
//   console.log("Original Data:", ogDATA);

//   const { encryptedDt, difference, nonce } = await aont.encode_aont(ogDATA);

//   const decrDt = await aont.decode(encryptedDt, difference, nonce);
//   console.log("Decrypted Data:", new TextDecoder().decode(decrDt));
// }

// main().catch(console.error);

const BibaAppendComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [file, setFile] = useState(null);
  const [bibaAppendContract, setBibaAppendContract] = useState(null);
  const [assignRoleContract, setAssignRoleContract] = useState(null);
  
  const [outputMessage, setOutputMessage] = useState("");
  const [evidenceHash, setEvidenceHash] = useState('');
  const [CaseContract, setCaseContract]=useState(null);
  const [userAddress, setUserAddress] = useState("");
  const aont = new AONT();
  const PINATA_API_KEY = "21ee47ad54d9db80a922";
  const PINATA_API_SECRET = "dfca70cec69ba419903c1179778db959feafb1ebd75b115563d9b87e01bf5299";

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

  /*const readFileContent = async (file) => {
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
  };*/
  

      const handleAppend = async () => {
        try {
          if (!evidenceHash) {
            setOutputMessage("Error: Please hash the document first.");
            return;
          }
          // Ensure evidenceHash is in the correct format
      /*const cleanedEvidenceHash = evidenceHash.startsWith('0x') ? evidenceHash.slice(2) : evidenceHash;
      const evidenceHashBytes32 = '0x' + cleanedEvidenceHash;*/
      // Convert the evidence hash to bytes32
          const key = document.querySelector("#value").value;
          const caseNumber = document.querySelector("#value3").value;
      
          // Check authorization and levels
          const DAC_check = await CaseContract.methods.is_authorized(userAddress, caseNumber).call();
          if (!DAC_check) {
            setOutputMessage("User is not authorized to access case.");
            return;
          }
      
          const L = await CaseContract.methods.return_level(caseNumber, key).send({ from: userAddress });
          const R = await assignRoleContract.methods.returnRole(userAddress).call();
          console.log("User level:", R);
          console.log("Object level:", L);
      
          // Append to contract
          const response = await bibaAppendContract.methods
            .append_allowed(key, userAddress, evidenceHash, caseNumber)
            .send({ from: userAddress, gas: 200000 });
      
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
          const responsd = await axios.post(url, formData, { headers });
      
          if (responsd.status === 200) {
            const cid = responsd.data.IpfsHash; // CID from Pinata
            setEvidenceHash(cid); // Set the CID as evidence hash
            setOutputMessage("File uploaded and encrypted successfully!");
          } else {
            throw new Error("Failed to upload file to Pinata.");
          }
      
          setOutputMessage(`Append successful.`);
          const transactionHash = response.transactionHash;
          console.log("Transaction Hash:", transactionHash);
          console.log("Timestamp:", new Date().toLocaleString());
        } catch (error) {
          console.error("Error appending evidence:", error);
          setOutputMessage("Error appending evidence. Please check the input.");
        }
      };
      
    
  

  return (
    <div className="BibaAppend">
      <div className="Append-Heading">Append Evidence</div>
      <div className = "AppendContent">
        <label className="originalevi">Original Evidence Key</label>
        <input
          type="text"
          id="value"></input>
      
      </div>
      <div className="evidence">
        <label  className="Text-BibaAppend"> Select Document </label>
       
      </div>
      <div className="Case-Number">
        <label className="Text-BibaAppend">Case Number</label>
        <input
          type="text"
          id="value3"></input>
      
      </div>

      <div className="ValueAppend">
        <label className="Text-BibaAppend"> To Append </label>
        <input
          type="text"
          placeholder="CID"
          value={evidenceHash}
          readOnly
        />
      </div>
      
      <button className="Final-Append-Button" onClick={handleAppend}>Append Evidence</button>
      <div>
        <p>{outputMessage}</p>
      </div>
    </div>
  );
}

export default BibaAppendComponent;
