const dAppAddress = '3Muxd5JEAQz655DDi2yiZxSQ63jVJJHrQyV';


function getTxData(funcName, param1) {
    let txData = {
        dApp: dAppAddress,
        call: {
            function: funcName,
            args: [
                {
                    "type":"string",
                    "value":param1
                }
            ]
        }
    }
    return txData;
}

function getCallTxData(funcName, param1) {
    let txData = getTxData(funcName, param1);
    let tx = {
        type: 16,
        data: {
            dApp: txData.dApp,
            call: txData.call,
            fee: {
                assetId: "WAVES",
                tokens: "0.005"
              },
              payment: [],
        }
    }
    return tx;
}

    export { getTxData, getCallTxData };

    // 
  