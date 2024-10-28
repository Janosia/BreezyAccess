import React, { useState } from "react";
import "./ContractSelector.css";
import BibaAppendComponent from "./BibaAppendComponent.js"; 
import BibaReadComponent from "./BibaReadComponent.js"; 
import EvidenceComponent from "./EvidenceRegisterComponent.js"; 
import RegisterComponent from "./AssignRoleComponent.js"; 
import CaseComponent from "./CaseComponent.js";

function ContractSelector() {
  const [selectedContract, setSelectedContract] = useState("BibaAppend");

  const handleContractChange = (event) => {
    setSelectedContract(event.target.value);
  };
     
  return (
    <div className = "titlebox">
      <div className = "title">Evidence Management System</div>
      <div className= "dropdown-for-contract">
      <label>Select Contract: </label>
      <select value={selectedContract} onChange={handleContractChange}>
        <option value="Append">Append</option>
        <option value="Read">Read</option>
        <option value="Evidence Registration">Evidence Registration</option>
        <option value="Role Registration">Role Registration</option>
        <option value="Case Registration">Case Registration</option>
        {/* Add more contract options here */}
      </select>

      {selectedContract === "Append" && <BibaAppendComponent />}
      {selectedContract === "Read" && <BibaReadComponent />}
      {selectedContract === "Evidence Registration" && <EvidenceComponent />}
      {selectedContract === "Role Registration" && <RegisterComponent />}
      {selectedContract === "Case Registration" && <CaseComponent />}
      </div>
      
    </div>
  );
}

export default ContractSelector;
