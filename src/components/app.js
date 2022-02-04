import ReactDOM from "react-dom";
import React from 'react';
import '../index.css';
import { Container } from '../Container';
import { Item } from '../Item';
import { Signer } from '@waves/signer';
import { ProviderCloud } from '@waves.exchange/provider-cloud';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { broadcast, invokeScript, nodeInteraction } from "@waves/waves-transactions"
import { getTxData, getCallTxData, getSupplNameKey, getCustomerNameKey } from "../helper";

const LOGGEDBY = {keeper: "KEEPER", seed: "SEED", email: "EMAIL"};

const nodeUrl = 'https://nodes-testnet.wavesnodes.com';
const dAppAddress = '3Muxd5JEAQz655DDi2yiZxSQ63jVJJHrQyV';
const wavesExchangeSite = 'https://testnet.waves.exchange/signer';
// const dAppAddress = '3MpniGh4Ab64nzX6AXtoL5tzeC5EwSyHuaq';
const signer = new Signer({
    NODE_URL: nodeUrl
});

let nullItem = {
    title: "title",
    price: 10000,
    // count: 5,
    description: "simple desc",
    owner: "",
    soldOut: 0
} 

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: "None",
            publicKey: "None",
            error: "None",
            recipient: "",
            userStatus: "",
            logger: "",
            itemData: nullItem       
        };
        this.authFuncKeeper = this.authFuncKeeper.bind(this);
        this.authFuncSigner = this.authFuncSigner.bind(this);
        this.authFuncSignerSeed = this.authFuncSignerSeed.bind(this);
        this.onChange = this.onChange.bind(this);
        this.loadItems = this.loadItems.bind(this);
        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
        this.resetItem = this.resetItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.purchaseItem = this.purchaseItem.bind(this);
    }

    async componentDidMount() {
        await this.loadItems();
    }

    resetItem() {
        this.state.itemData = nullItem
        }

    // handle changes on item creation form
    onChange = e => {
        const {id, value} = e.target;

        this.setState(prevState => {
            let ntr = Object.assign({}, prevState.itemData);
            ntr[id] = value;
            prevState.itemData = ntr
            return { prevState };
        })
        console.log(this.state.itemData);
    }

    // hamdle submit on item creation form
    onSubmit = async (event) => {
        event.preventDefault(event);
        console.log("Add item to dApp storage");
        this.state.itemData.owner = this.state.address;
        let tx = getCallTxData("createItem", this.state.itemData.title, this.state.itemData.price, JSON.stringify(this.state.itemData));
        let txData = getTxData("createItem", this.state.itemData.title, this.state.itemData.price, JSON.stringify(this.state.itemData));
        await this.makeInvokeTransaction(tx, txData);
        this.resetItem();
      };

    async loadItems() {
        let keys = await nodeInteraction.accountData(dAppAddress, nodeUrl);
        // console.warn(keys);
        let items = [];
        let rege = RegExp('^item.*data$');
        for (let k in keys) {
            if(k.match(rege)) {
                // console.log(k);
                items.push(JSON.parse(keys[k].value));
                // console.log(keys[k].value);
            }
        }
        this.setState(state => ({
            items: items
        }))
    }

    async deleteItem(item) {
        console.log("Delete item");
        console.log("Item: " + item.title);
        let tx = getCallTxData("deleteItem", item.title);
        let txData = getTxData("deleteItem", item.title);
        await this.makeInvokeTransaction(tx, txData);
    }

    async purchaseItem(item) {
        console.log("Purchase item");
        console.log("Item: " + item.title);
        let copy = Object.assign({}, item);
        copy.owner = this.state.address;
        copy.soldOut = 1;
        let tx = getCallTxData("purchase", item.title, item.owner, JSON.stringify(copy));
        let txData = getTxData("purchase", item.title, item.owner, JSON.stringify(copy));
        txData.payment = [
            {amount: item.price,
            assetId: null
            }
        ]
        await this.makeInvokeTransaction(tx, txData);
    }

    async makeInvokeTransaction(tx, txData) {
        if(this.state.logger == LOGGEDBY.keeper) {
            WavesKeeper.signAndPublishTransaction(tx).then(data => console.log(data)).catch(err => console.warn(err));
        } else if(this.state.logger == LOGGEDBY.seed) {
           let ttx = await signer.invoke(txData).broadcast();
            signer.waitTxConfirm(ttx, 0).then((tx) => {
                console.log(tx);
                console.log("Refreshing...");
                this.setUserStatus(this.state.address)
            }).catch((err) => console.error(err));
        }
        setTimeout(async () => {
            console.log("Refreshing...");
            this.setUserStatus(this.state.address);
            await this.loadItems();
        }, 7000);
    }

    async register(flag) {
        console.log("Registering... flag:" + flag);
        console.log("PubKey: " + this.state.publicKey);
        if(flag) var dataStr = 'SUPPLIER'; else var dataStr = "CUSTOMER";
        let tx = getCallTxData("register", dataStr);
        let txData = getTxData("register", dataStr);
        console.log("Bef Logger: " + this.state.logger);
        await this.makeInvokeTransaction(tx, txData);
    }

    async unregister() {
        console.log("Unregistering....");
        var dataStr = this.state.userStatus;
        let tx = getCallTxData("unregister", dataStr);
        let txData = getTxData("unregister", dataStr);
        await this.makeInvokeTransaction(tx, txData);
    }

    async setUserStatus (addr) {
        console.log("Setting user status: " + addr);
        let supplierName = null;
        let customerName = null;
        supplierName = await nodeInteraction.accountDataByKey(getSupplNameKey(addr), dAppAddress, nodeUrl);
        customerName = await nodeInteraction.accountDataByKey(getCustomerNameKey(addr), dAppAddress, nodeUrl);
        let userStatus = "";
        let userName = "";
        if(supplierName != null) {
            userStatus = "SUPPLIER";
            userName = supplierName.value;
        } else if(customerName != null) {
            userStatus = "CUSTOMER";
            userName = customerName.value;
        } else {
            userStatus = "UNKNOWN";
            userName = "UNKNOWN";
        }
        this.setState(state => ({
            userStatus: userStatus,
            userName: userName
        }));
        console.log("Logger: " + this.state.logger);
        console.log("userStatus: " + userStatus + ", userName: " + userName);
    }

    async authFuncKeeper() {
        console.log("Keeper");
        const authData = {data: "Auth on my site"};
        if(WavesKeeper) {
            WavesKeeper.auth( authData )
            .then(auth => {
                console.log(auth);
                this.state.logger = LOGGEDBY.keeper;
                this.setUserStatus(auth.address).then(res => {});
                this.setState(state => ({
                    address: auth.address,
                    publicKey: auth.publicKey
                }))
            }).catch(error => {
                console.log(error);
                this.setState(state => ({
                    error: error.message
                }))
            });
        } else {
            alert("To Auth WavesKeeper should be installed");
        }
        await this.loadItems();
    }

    async authFuncSigner() {
        signer.setProvider(new ProviderCloud(wa));
        const user = await signer.login();
        console.log(user);
        
        if(user != null) {
            this.setState(state => ({
                address: user.address,
                publicKey: user.publicKey
            }))
        }
    }

    async authFuncSignerSeed() {
        console.log("Signer Seed");
        signer.setProvider(new ProviderWeb(wavesExchangeSite));
        const user = await signer.login();
        this.state.logger = LOGGEDBY.seed;
        this.setUserStatus(user.address).then(res => {});
        console.log(user);
        if(user != null) {
            this.setState(state => ({
                address: user.address,
                publicKey: user.publicKey,
                signer: signer
            }))
        }
        await this.loadItems();
    }

    render() {
        let isSupplier = this.state.userStatus == 'SUPPLIER' ? true : false;
        let isCustomer = this.state.userStatus == 'CUSTOMER' ? true : false;
        let isUnknown = this.state.userStatus == 'UNKNOWN' ? true : false;
        let isLogged = this.state.userStatus == '' ? false : true;
        let itemsLoaded = this.state.items != undefined && this.state.items.length > 0;
        console.log("UserStatus: " + this.state.userStatus);
        let userStat = "";
        if(isSupplier) userStat = "Supplier";
        if(isCustomer) userStat = "Customer";
        const renderWelcome = () => {
            if(isLogged && !isUnknown) {
                return <span className="mx-2 border border-muted rounded text-muted">Welcome {userStat} {this.state.userName}</span>
            }
        }
        const renderUserButtons = () => {
            if(isSupplier) {
                return <div>
                    {/* <button className="btn btn-secondary" onClick={this.addItem}>AddItem</button> */}
                    <Container triggerText="Add Item" onSubmit={this.onSubmit} itemData={this.state.itemData} onChange={this.onChange}/>
                    <button className="btn btn-warning mx-2" onClick={() => this.unregister()}>Unregister</button> 
                </div>
            }
            if(isCustomer) {
                return <div>
                     <button className="btn btn-warning mx-2" onClick={() => this.unregister()}>Unregister</button> 
                </div>
            }
            if(isUnknown) {
                return <div>
                    <button className="btn btn-secondary mx-2" onClick={() => this.register(false)}>Reg As Customer</button>
                    <button className="btn btn-secondary" onClick={() => this.register(true)}>Reg As Supplier</button>
                </div>
            }
        }
        const renderList = () => {
            if(itemsLoaded) {
                return this.state.items.map((ele) => <Item item={ele} user={this.state.address} userStatus={this.state.userStatus} purchaseItem={this.purchaseItem} deleteItem={this.deleteItem}/>)
            }
        }
        const renderLoadButton = () => {
            if(true) {
                return <div>
                <button className="btn btn-primary bg-opacity-50 mx-2" onClick={this.loadItems}>LoadItems</button>
            </div>
            }
        }
        return (
            <div>
                <div className="container">
                    <div>
                    <h1 className="display-4 text-center text-info">Welcome to CouponBazaar</h1>
                    <h4 className="display-10 text-center text-info">(Waves Testnet)</h4>
                    </div>
                    <div className="btn-toolbar">
                        <button className="btn btn-primary mx-2" onClick={this.authFuncKeeper}>Login with Keeper</button>
                        <button className="btn btn-primary mx-2" onClick={this.authFuncSignerSeed}>Login with Seed</button>
                        {renderUserButtons()}
                    </div>
                    <div>
                    {renderWelcome()}
                </div>
                </div>
                <hr/>
                <div className="container">
                    {renderLoadButton()}
                </div>
                <hr/>
                <div className="container">
                    {renderList()}
                </div>
            </div>
        )
    }
}

const app = document.getElementById('app');
if(app) {
    ReactDOM.render(<App/>, app);
}