// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./AssignRole.sol";
import "./Case.sol";

///@title allows additional information/supporting material to be added to an existing evidence
contract BibaAppend is AssignRole, Case {
    mapping(bytes32 => mapping(uint => bytes32)) private AppendedEvidence; // keep track of which evidence was appended to, but an evidence can be appended to multiple times
    mapping(bytes32 => uint) private TrackerMapping; // keep track of how many times and evidence was appended to

    //Evidence public evidence;
    event AppendAllowed(string, address, bytes32, bytes32); // event for blockchain

    function returnTimes(bytes32 key) private view returns (uint) {
        // return number of times an evidence was appended to
        return TrackerMapping[key];
    }

    function append_allowed(
        bytes32 key,
        address ad_user,
        bytes32 key_of_new,
        uint case_num
    ) private returns (bool) {
        require(
            is_authorized(ad_user, case_num) == true,
            "Cannot interact with this evidence"
        );
        uint L = return_level(case_num, key);
        uint R = returnRole(ad_user);
        bool val = (R >= L);

        require(val == true, "User is not authorized to append to evidence");

        uint times = returnTimes(key); // find number of times the original evidence was appended to
        uint ntime = times + 1;
        TrackerMapping[key] = ntime; // update times the original evidenece was appended to

        // Take input from user; this is placeholder

        bytes32 newhash = keccak256(abi.encodePacked(key, key_of_new)); // calculate new hash
        string memory str = "Hell";
        register_evi(case_num, str, msg.sender); // create a new evidence with new founf evidence related to og evidence

        AppendedEvidence[key][ntime] = newhash; // finally add the appended evidence in the nested mapping
        emit AppendAllowed(
            "User has appended to evidence",
            ad_user,
            key,
            newhash
        );

        return true;
    }
}
