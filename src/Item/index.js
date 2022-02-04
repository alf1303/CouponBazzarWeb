import { prop } from '@waves/waves-transactions/dist/validators';
import React from 'react';

export class Item extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log("UserStatus: " + this.props.userStatus.length);
        // console.log(this.props.item.owner);
        let button;
        let mainClass = 'mb-2 border border-primary rounded';
        let buttonLabel = 'Sold Out';
        if(this.props.userStatus.length == 0) buttonLabel = "Login Please"
        if(this.props.item.soldOut == 0) {
            if(this.props.user != this.props.item.owner && this.props.userStatus != 'SUPPLIER') {
                button = <button onClick={() => this.props.purchaseItem(this.props.item)} className="btn btn-primary btn-sm mr-2 mb-1">Purchase </button>  
            } else {
                button = <button onClick={() => this.props.deleteItem(this.props.item)} className="btn btn-danger btn-sm mr-2 mb-1">Delete </button>  
            }
        }
        if(this.props.item.soldOut == 1 || this.props.userStatus == "") {
            mainClass = 'mb-2 border border-primary rounded bg-secondary'
            button = <button className="btn btn-danger btn-sm mr-2 mb-1">{buttonLabel} </button>  
        }
        return ( 
            <div className={mainClass}>
                <div className="row no-gutters py-2">
                    <div className="col-sm-6 p-2">
                        <h5 className="mb-1">Title: {this.props.item.title}</h5>
                    </div>
                    {/* <div className="col-sm-2 p-2 text-center ">
                        <p className="mb-0">Qty: {this.props.item.count}</p>
                    </div> */}
                    <div className="col-sm-2 p-2 text-center ">
                        <p className="mb-0">Price: {this.props.item.price}</p>
                    </div>
                    <div className="col-sm-4 p-2 text-right">
                        {button}                   
                    </div>
                </div>
                <div className="p-2 text-left ">
                        <p className="mb-2">Owner: {this.props.item.owner}</p>
                </div>
                <div className="p-2 text-left ">
                        <p className="mb-2">Description: {this.props.item.description}</p>
                </div>
            </div>
         );
    }
}

export default Item;