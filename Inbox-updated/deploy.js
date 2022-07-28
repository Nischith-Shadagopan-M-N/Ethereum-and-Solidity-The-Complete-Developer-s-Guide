const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3');
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
    'polar infant sound liquid faint fix sheriff retire say obscure submit soldier', 
    'https://rinkeby.infura.io/v3/1a4af15237cf43089080644d2da1c1cd'
);

const web3 = new Web3(provider)

const deploy = async ()=>{
    // Get a list of all accounts
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0])
    // Use one of the accounts to deploy the contract
    const result = await new web3.eth.Contract(abi)
        .deploy({data:evm.bytecode.object, arguments:['hello there']})
        .send({from:accounts[0], gas:'1000000'});

    console.log('Contract deployed to', result.options.address);

    provider.engine.stop();
};
deploy();
