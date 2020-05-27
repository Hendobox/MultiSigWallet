const EtherWallet = artifacts.require("EtherWallet");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(MultiSigWallet, [accounts[0], accounts[1], accounts[2], accounts[3]], 3, {value:2000});
};