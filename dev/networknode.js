const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const Blockchain = require('./blockchain');
const rq = require('request-promise');
var tcpp = require('tcp-ping');
const { send } = require('process');

const bitcoin = new Blockchain(); 
const nodeAddress = uuid.v4().split('-').join('');
const app = express();
const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/',function(req,res){
    res.send(JSON.stringify(bitcoin.getLastBlock()));
});

app.get('/blockchain',function(req,res){
    res.send(bitcoin);
});
app.post('/transaction',function(req,res){
    const lastBlockIndex = bitcoin.addTransactionToPendingTransactions(req.body);
    res.send({note:`Transanction will be added in block ${lastBlockIndex}`});
});

app.post('/transaction/broadcast',function(req,res){
    const {amount,sender,recipient} = req.body;
    const newTransaction = bitcoin.createNewTransaction(amount,sender,recipient);
    const requestPromises = [];

    bitcoin.addTransactionToPendingTransactions(newTransaction);

    bitcoin.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri:networkNodeUrl+'/transaction',
            method:"POST",
            body:newTransaction,
            json:true
        };
        requestPromises.push(rq(requestOptions));
    });

    Promise.all(requestPromises).then(data=>{
        res.send({note:"Transanction created and broadcasted successfully."});
    });
    
});

app.get('/mine',function(req,res){
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const requestPromises = [];
    const currentBlockData = {
        transactions:bitcoin.pendingTransactions,
        index:lastBlock.index+1
    };
    const [nonce,hash] = bitcoin.proofOfWork(previousBlockHash,currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce);
    
    const newBlock = bitcoin.createNewBlock(nonce,previousBlockHash,blockHash);

    bitcoin.networkNodes.forEach(nodeUrl=>{
        const requestOptions = {
            uri:nodeUrl+"/receive-new-block",
            method:"POST",
            body:{newBlock:newBlock},
            json:true
        };
        requestPromises.push(rq(requestOptions));
    })

    Promise.all(requestPromises).then(data=>{
        const requestOptions = {
            uri:bitcoin.nodeUrl+"/transaction/broadcast",
            method:"POST",
            body:{
                amount:12.5,
                sender:"00",
                recipient:nodeAddress
            },
            json:true
        };
        return rq(requestOptions);

    }).then(data=>{
        res.json({
            note:"New block mined and broadcast successfully.",
            block:newBlock,
            frash:hash,
            srash:blockHash,
            nonce:nonce
        });
    });
    
});

app.post("/receive-new-block",function(req,res){
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = newBlock.previousBlockHash === lastBlock.hash;
    const correctIndex = newBlock.index === lastBlock.index + 1;
    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.send({
            note:"New block received and accepted.",
            newBlock:newBlock
        })
    }else{
        res.send({
            note:"New block rejected",
            newBlock:newBlock
        })
    }
});

//register a node and broadcast it the network
app.post("/register-and-broadcast-node",(req,res)=>{
    const regNodesPromise = [];
    const q = new URL(req.body.newNodeUrl);

    tcpp.probe(q.hostname,q.port,(err, available)=>{
        if(available){
            if(bitcoin.networkNodes.indexOf(q.origin) === -1 && bitcoin.nodeUrl !== q.origin){
                bitcoin.networkNodes.push(q.origin);
            }

            bitcoin.networkNodes.forEach(nodeUrl => {
                //register node
                const requestOptions = {
                    uri:nodeUrl+"/register-node",
                    method:"POST",
                    body:{newNodeUrl:q.origin},
                    json:true
                };
                regNodesPromise.push(rq(requestOptions));
            });
        
            Promise.all(regNodesPromise).then(data=>{
                //use the data
                const bulkRegisterOptions = {
                    uri:q.origin+"/register-nodes-bulk",
                    method:"POST",
                    body:{allNetworkNodes:[...bitcoin.networkNodes,bitcoin.nodeUrl]},
                    json:true
                }
                return rq(bulkRegisterOptions);
            }).then(data =>{
                res.send({note:"New node registered with network successfully"})
            }).catch((err)=>{
                res.send({error:err});
            })
        }else{
            res.send({note:`Address ${q.origin} not available.`});
        }
    })
})

//register a node with the network
app.post("/register-node",(req,res)=>{
    const newNodeUrl = req.body.newNodeUrl;
    if(bitcoin.networkNodes.indexOf(newNodeUrl) === -1 && bitcoin.nodeUrl !== newNodeUrl){
        bitcoin.networkNodes.push(newNodeUrl);
    }
    res.send({note:"New node registered successfully within node."});
})

//register multiple nodes at once
app.post("/register-nodes-bulk",(req,res)=>{
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(nodeUrl=>{
        if(!bitcoin.networkNodes.includes(nodeUrl) && bitcoin.nodeUrl !== nodeUrl){
            bitcoin.networkNodes.push(nodeUrl);
        }
    });
    res.send({note:"Bulk registration successfull."})
})

app.get("/consensus",function(req,res){
    const requestPromises = [];
    bitcoin.networkNodes.forEach(nodeUrl=>{
        const requestOptions = {
            uri:nodeUrl+"/blockchain",
            method:"GET",
            json:true
        };
        requestPromises.push(rq(requestOptions));
    });
    Promise.all(requestPromises).then(blockchains=>{
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        for(const chain of blockchains){
            if(chain.chain.length > maxChainLength){
                maxChainLength = chain.chain.length;
                newLongestChain = chain.chain;
                newPendingTransactions = chain.pendingTransactions;
            }
        }

        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
            res.send({
                note:"Current chain has not been replaced",
                chain:bitcoin.chain
            });
        }else{
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
            res.send({
                note:"This chain has been replaced.",
                chain:bitcoin.chain
            })
        }
    });
})

app.get("/block/:blockHash",function(req,res){
    res.send({
        block:bitcoin.getBlock(req.params.blockHash)
    })
})

app.get("/transaction/:transactionId",function(req,res){
    res.send(bitcoin.getTransaction(req.params.transactionId));
})

app.get("/address/:address",function(req,res){
    res.send(bitcoin.getAddressData(req.params.address));
})

app.get("/block-explorer",function(req,res){
    res.sendFile(__dirname + "/block-explorer/index.html");
})

app.listen(port,()=>{
    console.log(`Listen on port ${port}`);
});