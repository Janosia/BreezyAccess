// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./AssignRole.sol";
import "./Case.sol";
///@title allows additional information/supporting material to be added to an existing evidence
contract BibaAppend is AssignRole, Case {
    mapping(bytes32 => mapping(uint => bytes32)) private AppendedEvidence; 
    mapping(bytes32 => uint) private TrackerMapping; 
    event AppendAllowed(string, address, string,bytes32); 
    
    function returnTimes(bytes32 key) private view returns (uint) {
        return TrackerMapping[key];
    }

    ///@notice checks if user is allowed to append to an existing evidence anf if yes, then append is completed 
    function append_allowed(
        bytes32 key,
        address ad_user,
        uint case_num,
        string memory cid
    ) public returns (bool){
        require(
            is_authorized(ad_user, case_num) == true,
            "Cannot interact with this evidence"
        );
        uint L = return_level(case_num, key);
        uint R = returnRole(ad_user);
        bool val = (R >= L);
        require(val == true, "User is not authorized to append to evidence");
        emit AppendAllowed("User", ad_user,"can append to evidence",key);
        if(val == true){
            add_evidence(case_num, msg.sender, cid);
            bytes32 KC = keccak256(abi.encodePacked(cid));
            uint times = returnTimes(key); 
            uint ntime = times + 1;
            TrackerMapping[key] = ntime; 
            AppendedEvidence[key][ntime] = KC;
        }
        return true;
    }
}
