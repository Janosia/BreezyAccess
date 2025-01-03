import React, { useState, useEffect } from "react";
import "./BibaAppend.css";
import Web3 from "web3";

// import AssignRoleABI from "./contracts/AssignRole.json";
import BibaAppendABI from "./contracts/BibaAppend.json";
// import CaseABI from "./contracts/Case.json";
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

  // async generateKey() {
  //     return crypto.getRandomValues(new Uint8Array(this.KEY_SIZE));
  // }

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

  async encode_aont(data , key) {
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      // const key = await this.generateKey();

      const encryptedDt = await this.encrypt(data, key, nonce);
      const hashedData = await this.hash(encryptedDt);
      const difference = this.XOR_Buffer(key, hashedData);

      return { encryptedDt, difference, nonce };
  }

  async decode(encryptedDt, difference, nonce, key) {
      const hashedDt = await this.hash(encryptedDt);
      // const key = this.XOR_Buffer(difference, hashedDt);
      const derivedKey = this.XOR_Buffer(difference, hashedDt);
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

const BibaAppendComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [file, setFile] = useState(null);
  const [bibaAppendContract, setBibaAppendContract] = useState(null);
  const [outputMessage, setOutputMessage] = useState("");
  const [evidenceHash, setEvidenceHash] = useState('');
  const [userAddress, setUserAddress] = useState("");
  const aont = new AONT();
  // const PINATA_API_KEY = "21ee47ad54d9db80a922";
  // const PINATA_API_SECRET = "dfca70cec69ba419903c1179778db959feafb1ebd75b115563d9b87e01bf5299";
  const PINATA_API_KEY = "4a7861d0478a1ee8ba5f";
  const PINATA_API_SECRET = "5ec920966e991b3ea5c495f7a14426432a79f09d5f68a74caa36bbdfcae15fcd";
  useEffect(()=>{
    const provider=new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template(){
      const web3=new Web3(provider);
      const networkId= await web3.eth.net.getId();
      setWeb3(web3);
      const deployednetworkbiba=BibaAppendABI.networks[networkId];
      const contractbiba=new web3.eth.Contract(BibaAppendABI.abi,deployednetworkbiba.address);
      setBibaAppendContract(contractbiba);
      await provider.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setUserAddress(accounts[0]);
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
          console.log(bibaAppendContract.methods);
          const key = document.querySelector("#value").value;
          const caseNumber = document.querySelector("#value3").value;
          const response = await bibaAppendContract.methods
            .append_allowed(key,caseNumber)
            .call({ from: userAddress});
          if(!response){
            setOutputMessage(
              "Error: You are not authorised to register evidence."
            );
            return;
          }
          const fileContent = await readFileAsArrayBuffer(file);
          const AESkey = await bibaAppendContract.methods
          .returnAESkey(caseNumber)
          .call({ from: userAddress});
          // Encrypt the file using AONT
          const hex = AESkey.startsWith('0x') ? AESkey.slice(2) : AESkey;
          if (hex.length % 2 !== 0) {
              throw new Error("Hex string has an odd length");
          }
          const array = new Uint8Array(hex.length / 2);
          for (let i = 0; i < hex.length; i += 2) {
              array[i / 2] = parseInt(hex.substr(i, 2), 16);
          }
          const { encryptedDt, difference, nonce } = await aont.encode_aont(fileContent, array);
      
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
            const val2 =await bibaAppendContract.methods.add_evidence(caseNumber, userAddress,cid).send({
              from: userAddress,
              gas: 200000,
            });
            const val = await bibaAppendContract.methods.tracker(caseNumber,cid, key).send({ from: userAddress, gas: 200000 });
            const transactionHash = val.transactionHash;
            console.log("Transaction Hash:", transactionHash);
            console.log("Timestamp:", new Date().toLocaleString());
            setOutputMessage("File uploaded and encrypted successfully!");
          } else {
            throw new Error("Failed to upload file to Pinata.");
          }
          
          setOutputMessage(`Append successful.`);
          
        } catch (error) {
          console.error("Error appending evidence:", error);
          setOutputMessage("Error appending evidence. Please check the input.");
        }
      };
  return (
    <div className="BibaAppend">
      <div className="Append-Heading">Append Evidence</div>
      <div className = "AppendContent">
        <div className="Case-Number">
          <label className="Text-BibaAppend">Case Number</label>
          <input
            type="number"
            id="value3"></input>
        
        </div>
        <label className="originalevi">Original Evidence CID</label>
        <input
          type="text"
          id="value"></input>
      </div>
      <div className="evidence">
        <label className="Text-BibaAppend"> Select Document </label>
        <input type="file" onChange={onFileChange} />
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
