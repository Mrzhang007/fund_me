// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HelloWeb3 {
    string public test = "test sepolia";
    string public name;
    uint256 public num = 10;

    constructor(string memory _name) {
        name = _name;
    }

    function sayHello() public view returns (string memory) {
        return string(abi.encodePacked("Hello, ", name, "!"));
    }
}
