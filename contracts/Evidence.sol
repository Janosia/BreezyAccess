// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Case.sol";

contract Evidence{
   
    Case public caseContract;

    constructor (address _caseContract){
        caseContract = Case(_caseContract);
    }

    function _register_evidence(string memory evidence, uint case_number) public payable{
        // check authorization
        caseContract.register_evi(case_number,evidence, msg.sender);
    }

    function level_assignment(string memory evidence, uint case_number) public payable{
        require(msg.sender == caseContract.returnHI(case_number), "only HI of related case can assign level");
        caseContract.assign_inl(case_number, evidence);
    }
}