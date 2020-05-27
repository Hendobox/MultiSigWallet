const { expectRevert } = require('@openzeppelin/test-helpers');

const MultiSigWallet = artifacts.require('MultiSigWallet');

contract('MultiSigWallet', (accounts) => {
	let wallet = null;
	before(async () => {
		multiSigWallet = await MultiSigWallet.deployed();
	});

	it('Should create transfer', async () => {
		await multiSigWallet.createTransfer(1000, accounts[6], {from: accounts[0]});
		const transfer = await multiSigWallet.transfers(0);
		assert(transfer.id.toNumber() === 0);
		assert(transfer.amount.toNumber() === 1000);
	}); 

	it('Should NOT create transfer', async () => {
		await expectRevert(
			multiSigWallet.createTransfer(
				1000, 
				accounts[6], 
				{from: accounts[9]}
			),
			'only approver can call this function'
		);
	}); 

	it('Should NOT send transfer if quorum not reached', async () => {
		const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[7]));
		await multiSigWallet.createTransfer(1000, accounts[7], {from: accounts[0]});
		await multiSigWallet.sendTransfer(1, {from: accounts[1]});
		const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[7]));
		assert(balanceAfter.sub(balanceBefore).isZero());
	});

	it('Should send transfer if quorum is reached', async () => {
		const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[7]));
		await multiSigWallet.createTransfer(1000, accounts[7], {from: accounts[0]});
		await multiSigWallet.sendTransfer(2, {from: accounts[1]});
		await multiSigWallet.sendTransfer(2, {from: accounts[2]});
		await multiSigWallet.sendTransfer(2, {from: accounts[3]});
		const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[7]));
		assert(balanceAfter.sub(balanceBefore).toNumber() === 1000);
	});
});