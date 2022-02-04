const dAppAddress = '3Muxd5JEAQz655DDi2yiZxSQ63jVJJHrQyV';


function getTxData(funcName, ...params) {
    console.warn(params);
    let args = [];
    params.forEach(e => {
        let typer = isNaN(e) ? "string" : "integer";
        let item = {
            "type": typer,
            "value": e.toString()
        }
        args.push(item);
    })
    console.warn(args);
    let txData = {
        dApp: dAppAddress,
        call: {
            function: funcName,
            args: args
        }
    }
    return txData;
}

function getCallTxData(funcName, ...params) {
    let txData = getTxData(funcName, ...params);
    let tx = {
        type: 16,
        data: {
            dApp: txData.dApp,
            call: txData.call,
            fee: {
                assetId: "WAVES",
                tokens: "0.009"
              },
              payment: [
              ],
        }
    }
    return tx;
}

function getSupplNameKey(val) {   return "SUPPLIER_" + val + "_name";    }

function getCustomerNameKey(val) { return "CUSTOMER_" + val + "_name"; }

    export { getTxData, getCallTxData, getSupplNameKey, getCustomerNameKey };

    // 
  