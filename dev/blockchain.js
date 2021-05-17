const sha256 = require("sha256");
const nodeUrl = process.argv[3];
const uuid = require('uuid');

function Blockchain(){
    this.chain = [];
    this.pendingTransactions = [];
    this.createNewBlock(0,'0','0');
    this.nodeUrl = nodeUrl;
    this.networkNodes = [];
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash,hash){
    const newBlock = {
        index:this.chain.length + 1,
        timestamp:Date.now(),
        transactions:this.pendingTransactions,
        nonce:nonce,
        hash:hash,
        previousBlockHash:previousBlockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
}
Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}
Blockchain.prototype.createNewTransaction = function(amount,sender,recipient){
    const newTransaction = {
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId:uuid.v4().split('-').join('')
    };
    
    return newTransaction;
}
Blockchain.prototype.addTransactionToPendingTransactions = function(transaction){
    this.pendingTransactions.push(transaction);
    return this.getLastBlock().index + 1;
}
Blockchain.prototype.hashBlock = function(previousBlockHash,currentBlockData,nonce){
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}
Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData){
    var nonce = 0;
    var hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    while(hash.substring(0,4) !== '0000'){
        nonce++;
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    }
    return [nonce,hash];
}
Blockchain.prototype.chainIsValid = function(blockList){
    for(var i = 1; i < blockList.length; i++){
        const currentBlock = blockList[i];
        const previousBlock = blockList[i - 1];
        const hash = this.hashBlock(previousBlock.hash,{transactions:currentBlock.transactions,index:currentBlock.index},currentBlock.nonce);
        if(hash.substring(0,4) !== "0000")
            return false;
        if(currentBlock.previousBlockHash !== previousBlock.hash)
            return false;
    }

    const genesisBlock = blockList[0];
    const correctNonce = genesisBlock.nonce === 0;
    const correctPreviousBlockHash = genesisBlock.previousBlockHash === '0';
    const correctHash = genesisBlock.hash === '0'
    const correctTransactions = genesisBlock.transactions.length === 0;

    return correctNonce && correctPreviousBlockHash && correctHash && correctTransactions;
}

Blockchain.prototype.getBlock = function(blockHash){
    return this.chain.find(block=>{
        return block.hash === blockHash;
    })
}

Blockchain.prototype.getTransaction = function(transactionId,allTransactions=false){
    const result = {block:null,transaction:null};
    for(const block of this.chain){
        const transaction = block.transactions.find(transaction=>{return transaction.transactionId === transactionId});
        if(transaction){
            result.block = block;
            result.transaction = transaction
            if(!allTransactions) 
                result.block.transactions = [transaction];
            break
        }
    }
    return result;
}

Blockchain.prototype.getAddressData = function(address){
    const transactions = [];
    let balance = 0;
    for(const block of this.chain){
        transactions.push(...block.transactions.filter(transaction=>{
            return transaction.sender === address || transaction.recipient === address;
        }));
    }
    transactions.forEach(transaction=>{
        if(transaction.sender === address) 
            balance -= transaction.amount;
        if(transaction.recipient === address)
            balance += transaction.amount;
    });
    return {
        addressTransactions:transactions,
        addressBalance:balance
    };
}
module.exports = Blockchain;