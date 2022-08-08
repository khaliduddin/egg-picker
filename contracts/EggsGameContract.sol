// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract EggsGameContract is ERC20 {
    address owner;
    uint256 public gamePurse;

    mapping(address => uint256) public feeCollection;
    mapping(address => bool) public gameStatus;
    mapping(address => uint256) public rewards;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
    }

    function payGameFee(address player) public payable {
      require(feeCollection[player] == 0, "Game Fee already paid!");
      require(!gameStatus[player], "Game is already enabled!");
      uint256 amount = msg.value;
      feeCollection[player] = feeCollection[player] + amount;
      gameStatus[player] = true;
      gamePurse += amount;
    }

    function playerWon(address player, uint256 winBonus) external {
      require(gameStatus[player], "Game is not valid!");
      gameStatus[player] = false;      
      rewards[player] = rewards[player] + (feeCollection[player] * winBonus);       
      feeCollection[player] -= feeCollection[player];
    }

    function playerLose(address player) public {
      require(gameStatus[player], "Game is not valid!");
      gameStatus[player] = false;      
      //payable(owner).transfer(feeCollection[player]);
      feeCollection[player] -= feeCollection[player];
    }

    function claimAllRewards() public {
      address player = msg.sender;
      uint256 rewardAmount = rewards[player];
      require(gamePurse >= rewardAmount, 'Purse is low, try again later');
      (bool sent, ) = player.call{gas :50000, value: rewardAmount}("");
      require(sent, "Rewards not sent to player");
      rewards[player] -= rewardAmount;
      gamePurse -= rewardAmount;
    }
}
