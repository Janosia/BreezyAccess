// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./AssignRole.sol";
import "./Case.sol";

contract BibaRead{
   AssignRole public  user; 
   Case public scase;

   mapping (address => bytes32) ReadEvidence;  // keep track of which user read which evidence, one user can read multiple evidences so like is this needed

   event ReadAllowed(string, address, bytes32); // event for blockchain
   
   constructor(address _assignRole, address _case){
    user = AssignRole(_assignRole);
    scase = Case(_case);
   }

   function read_allowed(bytes32 key, address ad_user, uint case_num) public payable returns (bool){
    require(scase.is_authorized(ad_user, case_num) == true, "Cannot interact with this evidence"); // checking DAC
    require(scase.is_level_assigned(case_num, key)== true, "Evidnece cannot be interacted with , it has not been assigned a level"); // unassigned levels 
    uint L = scase.return_level(case_num, key);
    uint R = user.returnRole(ad_user);

    bool val = (R<=L);
    require(val == true, "User is not authorized to read evidence");
    emit ReadAllowed("User has read evidence", ad_user, key);
    return true;
   }

}