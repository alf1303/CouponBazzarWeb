import ReactDOM from "react-dom";
import React from 'react';
import '../index.css';
import { Container } from '../Container';
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
            itemData : {
                title: "title",
                price: 0,
                count: 0,
                description: "simple desc"
            }        
        };
        this.authFuncKeeper = this.authFuncKeeper.bind(this);
        this.authFuncSigner = this.authFuncSigner.bind(this);
        this.authFuncSignerSeed = this.authFuncSignerSeed.bind(this);
        this.onChange = this.onChange.bind(this);
        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
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
        let tx = getCallTxData("createItem", this.state.itemData.title, this.state.itemData.price, this.state.itemData.description);
        let txData = getTxData("createItem", this.state.itemData.title, this.state.itemData.price, this.state.itemData.description);
        await this.makeInvokeTransaction(tx, txData);
      };

    async loadItems() {

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
        setTimeout(() => {
            console.log("Refreshing...");
            this.setUserStatus(this.state.address)
        }, 10000);
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
    }

    render() {
        let isSupplier = this.state.userStatus == 'SUPPLIER' ? true : false;
        let isCustomer = this.state.userStatus == 'CUSTOMER' ? true : false;
        let isUnknown = this.state.userStatus == 'UNKNOWN' ? true : false;
        console.log("UserStatus: " + this.state.userStatus);
        const renderUserButtons = () => {
            if(isSupplier) {
                return <div>
                    {/* <button className="btn btn-secondary" onClick={this.addItem}>AddItem</button> */}
                    <Container triggerText="Add Item" onSubmit={this.onSubmit} itemData={this.state.itemData} onChange={this.onChange}/>
                    <span>Welcome Supplier {this.state.userName}</span>
                    <button className="btn btn-secondary mx-2" onClick={() => this.unregister()}>Unregister</button> 
                </div>
            }
            if(isCustomer) {
                return <div>
                     <span>Welcome Customer {this.state.userName}</span>
                     <button className="btn btn-secondary mx-2" onClick={() => this.unregister()}>Unregister</button> 
                </div>
            }
            if(isUnknown) {
                return <div>
                    <button className="btn btn-secondary mx-2" onClick={() => this.register(false)}>Reg As Customer</button>
                    <button className="btn btn-secondary" onClick={() => this.register(true)}>Reg As Supplier</button>
                </div>
            }
        }
        return (
            <div>
                <div className="container">
                    <h1 className="display-3 text-center text-info">Welcome to CouponBazaar</h1>
                    <div className="btn-toolbar">
                        <button className="btn btn-primary mx-2" onClick={this.authFuncKeeper}>Login with Keeper</button>
                        <button className="btn btn-primary mx-2" onClick={this.authFuncSignerSeed}>Login with Seed</button>
                        {renderUserButtons()}
                    </div>
                </div>
                <hr/>
                <div className="container">

                </div>
            </div>
        )
    }
}

const app = document.getElementById('app');
if(app) {
    ReactDOM.render(<App/>, app);
}