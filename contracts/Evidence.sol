// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./Case.sol";
///@title contract to register a fresh evidence not linked to any other evidence or supporting information to any other pre-existing evidence
contract Evidence is Case {
    ///@notice allows an user to add evidence
    function _register_evidence(
        string calldata evidence,
        uint case_number
    ) public payable {
        // check authorization
        register_evi(case_number, evidence, msg.sender);
    }
    ///@notice allows an user to assign level to evidence
    function level_assignment(
        string calldata evidence,
        uint case_number, uint level
    ) public payable {
        require(
            msg.sender == returnHI(case_number),
            "only Head Investigator of requested case can assign integrity level"
        );
        assign_inl(case_number, evidence, level);
    }
}
