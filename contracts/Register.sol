// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./AssignRole.sol";

contract Register{
    AssignRole public roleContract;
    
    constructor (address _roleContract){
        roleContract = AssignRole(_roleContract);
    }
    function register_user(string memory designation) public {  
        roleContract.setRole(designation, msg.sender);
    }
    Register public register;
}