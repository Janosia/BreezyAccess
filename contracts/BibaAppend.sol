// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./AssignRole.sol";
import "./Case.sol";
///@title allows additional information/supporting material to be added to an existing evidence
contract BibaAppend is AssignRole, Case {
    mapping(bytes32 => mapping(uint => bytes32)) private AppendedEvidence; 
    mapping(bytes32 => uint) private TrackerMapping;
    event AppendAllowed(string, address, bytes32, bytes32);
    error AppendNotAllowed(string, address, string, uint, string,uint);
    event LevelReturned(string, uint);
    event RoleReturned(string, uint);
    function returnTimes(bytes32 key) private view returns (uint) {
        return TrackerMapping[key];
    }
    ///@notice checks if user is allowed to append to an existing evidence
    function append_allowed(
        bytes32 key,
        address ad_user,
        bytes32 key_of_new,
        uint case_num
    ) public returns (bool) {
        require(
            is_authorized(ad_user, case_num) == true,
            "Cannot interact with this evidence"
        );
        uint256 level = return_level(case_num, key);
        emit LevelReturned("Level of evidence is ", level);
        uint256 role = returnRole(ad_user);
        emit RoleReturned("Level of investigator is ", role);
        bool val = (role >= level);
        require(val == true, "User does not have the authority i.e. level to assign evidence. Investigator needs to increase level");
        uint times = returnTimes(key); 
        TrackerMapping[key] = times+1; 
        register_evi(case_num, msg.sender); 
        AppendedEvidence[key][ntime] = newhash;
        emit AppendAllowed(
            "User has appended to evidence",
            ad_user,
            key,
            newhash
        );
        return true;
    }
}
