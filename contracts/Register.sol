// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./AssignRole.sol";

contract Register is AssignRole{
    
    function register_user(string calldata designation) public {  
        publicsetRole(designation, msg.sender);
    }
    // Register public register;
}