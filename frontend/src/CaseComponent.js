import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CaseAbi from './contracts/Case.json';
import AssignRoleAbi from "./contracts/AssignRole.json";
import AONT from './AONT';
function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState("");
  const[Rolecontract,setroleContract]=useState(null);
  const [Casecontract, setcaseContract] = useState(null);
  const [aesKey, setAesKey] = useState(null);
  const [message, setMessage] = useState('');
  const aont = new AONT();
  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template() {
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CaseAbi.networks[networkId];

      const contractRegister = new web3.eth.Contract(CaseAbi.abi, deployedNetwork.address);
      
      const deployedNetworkRole = AssignRoleAbi.networks[networkId];
      const contractRole = new web3.eth.Contract(
        AssignRoleAbi.abi,
        deployedNetworkRole.address
      );
      setroleContract(contractRole);
      await provider.request({ method: "eth_requestAccounts" });
          // Accounts now exposed
          const accs = await web3.eth.getAccounts();
          setAccounts(accs[0]);
      setWeb3(web3);
      setcaseContract(contractRegister);    
    }
    provider && template();
  }, []);
  const generateAesKey = async () => {
    const key = await aont.generateKey();
    setAesKey(key);
    console.log('Generated AES Key:', key);
  };  
 
  
  const createCase = async () => {
    try {
      const caseName=document.querySelector("#value1").value;
      const caseNumber=document.querySelector("#value2").value;
      const gasLimit = 500000;
      // const publiDoes= await Rolecontract.methods.publicDoesUserExists(accounts);
      // if (!aesKey) {
      //   setMessage('Please generate the AES key first.');
      //   return;
      // }
      // if(publiDoes){
      //   console.log("public does user exists working");
      // }
      // const publicreturnr=await Rolecontract.methods.publicreturnRole(accounts);
      // if(publicreturnr===1){
      //   console.log("return role working");
      // }
      // const caseexists= await Casecontract.methods.does_case_exists(caseNumber);
      // if(!caseexists){
      //   console.log("case does not exists");
      // }
      const transaction=await Casecontract.methods.createcase(caseName, caseNumber, aesKey.toString()).send({ from: accounts, gas: gasLimit, });
      setMessage('Case created successfully!');
      const transactionHash = transaction.transactionHash;
      console.log("Transaction Hash:", transactionHash);
      console.log("Timestamp:", new Date().toLocaleString());
    } catch (error) {
      if (error.message.includes('Case is already created')) {
        setMessage('Error: Case is already created');
      } else if (error.message.includes('Only Head Investigator can create cases')) {
        setMessage('Error: Only Head Investigator can create cases');
      } else {
        console.error('Error creating case:', error);
        setMessage(`Error creating case: ${error.message}`);
      }
    }
  };
  const caseDetails = async()=>{
    try{
      const caseNumber=document.querySelector("#value2").value;
      await Casecontract.methods.getCaseDetails(caseNumber).call();
      console.log('Case Details:', caseDetails);
    }
    catch(error){
      console.error('error showing details',error);
    }
  };


  const addInvestigator = async () => {
    try {
      const gasLimit = 200000;
      const caseNumber=document.querySelector("#value2").value;
      const investigatorAddress=document.querySelector("#value3").value;
      const transaction=await Casecontract.methods.add_investigator(investigatorAddress, parseInt(caseNumber, 10)).send({ from: accounts,gas: gasLimit, });
      setMessage('Investigator added successfully!');
      const transactionHash = transaction.transactionHash;
      console.log("Transaction Hash:", transactionHash);
      console.log("Timestamp:", new Date().toLocaleString());
    } catch (error) {
      if (error.message.includes('User is not registered')) {
        setMessage('Error: Investigator is not registered');
      } else {
        console.error('Error adding investigator:', error);
        setMessage('Error adding investigator. Please check the console for details.');
      }
    }
  };


  return (
    <div>
    <h1>Case Management System</h1>
      <div>
        <label>Case Name:</label>
        <input
          type="text"
          placeholder="Enter case name"
          id="value1"
        />
      </div>

      <div>
        <label>Case Number:</label>
        <input
          type="number"
          placeholder="Enter case number"
          id="value2"
        />
      </div>

      <button onClick={createCase}>Create Case</button>

      <div>
        <label>Investigator Address:</label>
        <input
          type="text"
          placeholder="Enter investigator address"
          id="value3"
        />
      </div>

      <button onClick={addInvestigator}>Add Investigator</button>


      <div>
        <button onClick={caseDetails}>view details</button>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default App;
