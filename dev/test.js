const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();
const chain = {"chain":[{"index":1,"timestamp":1621107123327,"nonce":0,"transactions":[],"hash":'0',"previousBlockHash":"0"},{"index":2,"timestamp":1621107162480,"transactions":[],"nonce":18140,"hash":"0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100","previousBlockHash":"0"},{"index":3,"timestamp":1621107208038,"transactions":[{"amount":12.5,"sender":"00","recipient":"a2e9ce9d51c74854b281e2a924c9b510","transactionId":"2d020f0b2878450a8705b41206308bdd"},{"amount":10,"sender":"tinitsapp@gmail.com","recipient":"almeidadesouzam@yahoo.com.br","transactionId":"91d397bdf3f84262982e7d35015426c8"},{"amount":20,"sender":"tinitsapp@gmail.com","recipient":"almeidadesouzam@yahoo.com.br","transactionId":"f86a3287fde44453b57054f9fb34d5d4"},{"amount":30,"sender":"tinitsapp@gmail.com","recipient":"almeidadesouzam@yahoo.com.br","transactionId":"e0f8a40153a64b8c9bfb0f614c0c488f"}],"nonce":36753,"hash":"000030b717297753051a37521eacbff8faf0196b214ce4ae09038f53d85841a4","previousBlockHash":"0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"},{"index":4,"timestamp":1621107225484,"transactions":[{"amount":12.5,"sender":"00","recipient":"a2e9ce9d51c74854b281e2a924c9b510","transactionId":"ce777011dfca4f6cb4981233e988c098"},{"amount":40,"sender":"tinitsapp@gmail.com","recipient":"almeidadesouzam@yahoo.com.br","transactionId":"42c08f10f07b4114a751666f628942ae"},{"amount":50,"sender":"tinitsapp@gmail.com","recipient":"almeidadesouzam@yahoo.com.br","transactionId":"276b60b8014b4ad2b05c9f9a0d24d68e"}],"nonce":41150,"hash":"00008083c4035f32d3d89fa97e93f57bd815c76a00e934c3294628ba8b066d9a","previousBlockHash":"000030b717297753051a37521eacbff8faf0196b214ce4ae09038f53d85841a4"},{"index":5,"timestamp":1621107229304,"transactions":[{"amount":12.5,"sender":"00","recipient":"a2e9ce9d51c74854b281e2a924c9b510","transactionId":"0ce110cef03e4a3ca7357a4644702adf"}],"nonce":30900,"hash":"00006b11d1dc40727ad2552fe94db2bf327e155d3878adb290a853ab2e493488","previousBlockHash":"00008083c4035f32d3d89fa97e93f57bd815c76a00e934c3294628ba8b066d9a"},{"index":6,"timestamp":1621107238556,"transactions":[{"amount":12.5,"sender":"00","recipient":"a2e9ce9d51c74854b281e2a924c9b510","transactionId":"e12f7fce66ff4a5c9e8356595e2a3055"},{"amount":50,"sender":"tinitsapp@gmail.com","recipient":"almeidadesouzam@yahoo.com.br","transactionId":"19d7081165eb4241b196b8a096bc2520"}],"nonce":94494,"hash":"0000c48baaaf3b6c88213ad036c6c89987cbf2077001d3d3e3599120c3d9e8d0","previousBlockHash":"00006b11d1dc40727ad2552fe94db2bf327e155d3878adb290a853ab2e493488"}],"pendingTransactions":[{"amount":12.5,"sender":"00","recipient":"a2e9ce9d51c74854b281e2a924c9b510","transactionId":"b5c21c0585d84497b743ed1beaafc66e"}],"nodeUrl":"http://localhost:3001","networkNodes":[]};
console.log(bitcoin.chainIsValid(chain.chain));