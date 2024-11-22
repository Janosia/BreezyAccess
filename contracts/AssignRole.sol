// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

///@title creation of user and role assignment
contract AssignRole {
    mapping(string => uint) internal Levels;
    mapping(address => uint) internal Roles; // each address will have a IG level storing is like address : Integrity Level 
    mapping(address => uint)  internal RegisteredUsers; // dynamic array of all registered users, to check whether they exists or not
    event UserRegistrationDone(string, address, uint);
    constructor() {
        Levels["Head Investigator"] = 1;
        Levels["Lead Investigator"] = 4;
        Levels["Team Investigator"] = 7;
    }
    ///@notice returns level of integrity based on role of user
    function getLevel(string calldata designation) internal view returns (uint) {
        return (Levels[designation]);}
    ///@notice checks if user is already existing
    function DoesUserExists(address user) internal view returns (bool) {
        if (RegisteredUsers[user] == 1) {
            return true;}
        return false;
    }
    ///@notice allows an user to create account and set role
    function setRole(string calldata designation, address user) internal {
        require(DoesUserExists(user) == false, "User Already Registered");
        require(getLevel(designation) > 0, "Invalid designation");
        Roles[user] = getLevel(designation);
        RegisteredUsers[user] = 1;
        emit UserRegistrationDone(" User Registration Completed",user,Roles[user]);
    }

    ///@notice returns role of an user 
    function returnRole(address user) internal view returns (uint) {
        require(DoesUserExists(user) == true, "User is not registered");
        return Roles[user];
    }
    
    ///@notice an interface functions used to call internal functions
    function publicsetRole(string calldata desig, address user) public {
        setRole(desig, user);
    }
    function publicreturnRole(address user) public view returns (uint) {
        uint ans = returnRole(user);
        return (ans);
    }
    function publicDoesUserExists(address user) public view returns (bool) {
        bool ans = DoesUserExists(user);
        return (ans);
    }
}
