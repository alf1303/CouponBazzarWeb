const wvs = 1e8 
let dAppAddress = '3Muxd5JEAQz655DDi2yiZxSQ63jVJJHrQyV';
describe('test Coupon Bazaar', () => {
    // before(async() => {
    //     await setupAccounts({foo: 1 * wvs, bar: 2 * wvs})
    // })
    let dataJson = {
        title: "Item1 namtr",
        price: 1000000,
        description: "First item ever"
    }
      
    it('test add item succsess', async () => {
        let ts = invokeScript({
            dApp: dAppAddress,
            fee: 900000,
            call: {
                function: 'createItem',
                args: [
                    {type: 'string', value: dataJson.title},
                    {type: 'integer', value: dataJson.price},
                    {type: 'string', value: dataJson.description}
                ]
            },
            payment: []
        }, '');
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })

        it('test add item existed', async () => {
        let ts = invokeScript({
            dApp: dAppAddress,
            fee: 900000,
            call: {
                function: 'createItem',
                args: [
                    {type: 'string', value: dataJson.title},
                    {type: 'integer', value: dataJson.price},
                    {type: 'string', value: dataJson.description}
                ]
            },
            payment: []
        }, '');
        await expect(broadcast(ts)).rejectedWith('Item already exists')
    })

    it('test delete item succsess', async () => {
        let ts = invokeScript({
            dApp: dAppAddress,
            fee: 900000,
            call: {
                function: 'deleteItem',
                args: [
                    {type: 'string', value: dataJson.title}
                ]
            }
        }, '');
        await broadcast(ts);
        await waitForTx(ts.id);
    })

        it('test delete item no exists', async () => {
        let ts = invokeScript({
            dApp: dAppAddress,
            fee: 900000,
            call: {
                function: 'deleteItem',
                args: [
                    {type: 'string', value: dataJson.title}
                ]
            }
        }, '');
        await expect(broadcast(ts)).rejectedWith('No such item present')
    })

    
})