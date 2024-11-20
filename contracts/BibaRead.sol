// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./AssignRole.sol";
import "./Case.sol";
///@title allows user to read an existing evidence
contract BibaRead is AssignRole, Case {
    event ReadAllowed(string, address, bytes32); // event for blockchain
    ///@notice checks if user is authorised to read evidence and if yes then allows user to read evidence and event is logged
    function read_allowed(
        bytes32 key,
        address ad_user,
        uint case_num
    ) private returns (bool) {
        require(
            is_authorized(ad_user, case_num) == true,
            "Cannot interact with this evidence"
        ); // checking DAC
        require(
            is_level_assigned(case_num, key) == true,
            "Evidence cannot be interacted with , it has not been assigned a level"
        ); // unassigned levels
        uint L = return_level(case_num, key);
        uint R = returnRole(ad_user);
        bool val = (R <= L);
        require(val == true, "User is not authorized to read evidence");
        emit ReadAllowed("User has read evidence", ad_user, key);
        return true;
    }
}
