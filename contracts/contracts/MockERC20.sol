// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PriceToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // Function to mint new tokens (owner only)
    function mint(address to, uint256 amount) external  {
        _mint(to, amount);
    }

    // Function to burn tokens (owner only)
    function burn(address from, uint256 amount) external  {
        _burn(from, amount);
    }
}
