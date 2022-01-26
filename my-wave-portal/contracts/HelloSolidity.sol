// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.10 and less than 0.9.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract HelloSolidity {
    // state variable
    string public text = "Hello Universe!!";
    uint public count = 10;

    function getCount() public view returns (uint) {
        return count;
    }

    function inc() public {
        count += 1;
    }
    function dec() public {
        count -= 1;
    }

    function test() public view returns (address) {
        address sender = msg.sender;
        return sender;
    }

    // Using up all of the gas that you send causes your transaction to fail.
    // State changes are undone.
    // Gas spent are not refunded.
    function forever() public {
        // Here we run a loop until all of the gas are spent
        // and the transaction fails
        while (true) {
            count += 1;
        }
        // will throw this error: 
        // TransactionExecutionError: Transaction ran out of gas
    }

    function ifElse() public pure returns (string memory) {
        // string memory result = 4 % 2 == 0 ? "yes" : "no";
        return 4 % 2 == 0 ? "yes" : "no";
    }

}
