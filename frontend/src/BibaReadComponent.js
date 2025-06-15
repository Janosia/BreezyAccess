import React, { useState, useEffect } from "react";
import Web3 from "web3";

// import AssignRoleABI from "./contracts/AssignRole.json";
import BibaReadABI from "./contracts/BibaAppend.json"
// import CaseABI from "./contracts/Case.json";




function BibaReadComponent() {
  const [web3, setWeb3] = useState(null);
  const [bibaReadContract, setBibaReadContract] = useState(null);
  // const [assignRoleContract, setAssignRoleContract] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  // const [CaseContract,setCaseContract]=useState(null);
  const [outputMessage, setOutputMessage] = useState("");

  useEffect(()=>{
    const provider=new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    async function template(){
      const web3=new Web3(provider);
      //we need abi and contract address
      const networkId= await web3.eth.net.getId();
      
      setWeb3(web3);
      await provider.request({ method: "eth_requestAccounts" });
          // Accounts now exposed
          const accounts = await web3.eth.getAccounts();
          setUserAddress(accounts[0]);

      // const deployedNetworkrole=AssignRoleABI.networks[networkId];
      // const contractrole=new web3.eth.Contract(AssignRoleABI.abi, deployedNetworkrole.address);


      
      // setAssignRoleContract(contractrole);

      const deployednetworkbiba=BibaReadABI.networks[networkId];
      const contractbiba=new web3.eth.Contract(BibaReadABI.abi,deployednetworkbiba.address);
      setBibaReadContract(contractbiba);

      // const deployedcase=CaseABI.networks[networkId];
      // const contractcase=new web3.eth.Contract(CaseABI.abi,deployedcase.address);
      // setCaseContract(contractcase);
    }
    provider && template();
  },[]);


  const handleRead = async () => {
    const key = document.querySelector("#value").value;
    // const check=await bibaReadContract.methods.does_evidence_exists(key).call();
    const caseNumber=document.querySelector('#value2').value;
      
  if(true){
  //     console.log('element does exist');
    try {
      // const L = await bibaReadContract.methods.returnLevel(caseNumber,key).call();
      // const R = await bibaReadContract.methods.returnRole(userAddress).call();
      // console.log('user level:' , R);
      // console.log('object level:' ,L);
      const val = await bibaReadContract.methods.read_allowed(key, caseNumber).send({ from: userAddress , gas: 200000,
      });
      if (val) {
        // const customEvent = new CustomEvent('ValIsTrue', { detail: {userAddress, L, R } });
        // document.dispatchEvent(customEvent);
        setOutputMessage('Successfully read evidence.');
      } else {
        setOutputMessage('User is not authorized to read evidence.');
      }
     
    } catch (error) {
      console.error("Error reading evidence:", error);
      setOutputMessage("Error reading evidence. Please check the input.");
    }
  }else{
    setOutputMessage("the element does not exist");
  }
  };

  return (
    <div>
      <h2>Read</h2>
      <div>
        <label>Evidence Key</label>
        <input
          type="text"
          id="value"></input>
      </div>
      <div>
        <label>Case Number</label>
        <input
          type="number"
          id="value2"></input>
      </div>
      <button onClick={handleRead}>Read Evidence</button>
      <div>
        <p>{outputMessage}</p>
      </div>
    </div>
  );
}

export default BibaReadComponent;
