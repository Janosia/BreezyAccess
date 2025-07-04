import React, { useState } from "react";
import "./ContractSelector.css";
import BibaAppendComponent from "./BibaAppendComponent.js"; 
import BibaReadComponent from "./BibaReadComponent.js"; 
import EvidenceComponent from "./EvidenceRegisterComponent.js"; 
import RegisterComponent from "./AssignRoleComponent.js"; 
import CaseComponent from "./CaseComponent.js";

function ContractSelector() {
  const [selectedContract, setSelectedContract] = useState("");

  const handleContractChange = (event) => {
    setSelectedContract(event.target.value);
  };
     
  return (
    <div className = "titlebox">
      <div className = "title">Ashtdikpala</div>
      <div className= "dropdown-for-contract">
      <label className="selectcontract">Function</label>
      <select className="labelindropdown" value={selectedContract} onChange={handleContractChange}>
        <option value="" disabled>Choose Contract</option>
        <option value="Role Registration">Role Registration</option>
        <option value="Case Registration">Case Registration</option>
        <option value="Evidence Registration">Evidence Registration</option>
        <option value="Append">Append to Evidence</option>
        <option value="Read">Read Evidence</option>
      </select>
      {selectedContract === "Role Registration" && <RegisterComponent />}
      {selectedContract === "Case Registration" && <CaseComponent />}
      {selectedContract === "Evidence Registration" && <EvidenceComponent />}
      {selectedContract === "Append" && <BibaAppendComponent />}
      {selectedContract === "Read" && <BibaReadComponent />}
      </div>
      
    </div>
  );
}

export default ContractSelector;
