var GameContract = artifacts.require('./EggsGameContract');

module.exports = async function(_deployer) {
  // Use deployer to state migration tasks.
  await _deployer.deploy(GameContract, "", "");
};
