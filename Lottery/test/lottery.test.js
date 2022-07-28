const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async ()=>{
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    // Use one of the accounts to deploy the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({data:evm.bytecode.object})
        .send({from:accounts[0], gas:'1000000'});
});

describe('Lottery', ()=>{
    it('deploys a contract', ()=>{
        assert.ok(lottery.options.address);
    });

    it('enter lottery', async ()=>{
        await lottery.methods.enter().send({from:accounts[0], value: web3.utils.toWei('0.02', 'ether')});
        const players = await lottery.methods.returnPlayers().call();
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('multiple players enter lottery', async ()=>{
        await lottery.methods.enter().send({from:accounts[0], value: web3.utils.toWei('0.02', 'ether')});
        await lottery.methods.enter().send({from:accounts[1], value: web3.utils.toWei('0.02', 'ether')});
        await lottery.methods.enter().send({from:accounts[2], value: web3.utils.toWei('0.02', 'ether')});
        const players = await lottery.methods.returnPlayers().call();
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('insufficient ether to enter', async ()=>{
        try{
            await lottery.methods.enter().send({from:accounts[0], value: web3.utils.toWei('0.001', 'ether')});
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('only manager can pick the winner', async ()=>{
        const manager = await lottery.methods.manager().call();
        try{
            await lottery.methods.pickWinner().send({from:accounts[1]});
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('money is being rewarded', async ()=>{
        await lottery.methods.enter().send({from:accounts[1], value: web3.utils.toWei('0.02', 'ether')});
        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods.pickWinner().send({from:accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[1]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('0.018', 'ether'));
        const players = await lottery.methods.returnPlayers().call();
        assert.equal(0, players.length);
    });
});