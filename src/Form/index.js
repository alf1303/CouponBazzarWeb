import React from 'react';

export class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.itemData.title,
      // count: props.itemData.count,
      price: props.itemData.price,
      description: props.itemData.description
    }
  }
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Item Title</label>
          <input className="form-control" id="title" value={this.props.itemData.title} onChange={this.props.onChange}/>
        </div>
        {/* <div className="form-group">
          <label htmlFor="count">Items count</label>
          <input type="number" step="1" className="form-control" id="count" value={this.props.itemData.count} onChange={this.props.onChange}/>
        </div> */}
        <div className="form-group">
          <label htmlFor="price">Items price</label>
          <input type="number" step="1" className="form-control" id="price" value={this.props.itemData.price} onChange={this.props.onChange}/>
        </div>
        <div className="form-group">
          <label htmlFor="count">Item description</label>
          <input className="form-control" id="description" value={this.props.itemData.description} onChange={this.props.onChange}/>
        </div>
        <div className="form-group">
          <button className="form-control btn btn-primary" type="submit" onClick={() => {setTimeout(() => this.props.closeModal(), 2000)}}>
            Submit
          </button>
        </div>
      </form>
    );
  }
}
export default Form;
