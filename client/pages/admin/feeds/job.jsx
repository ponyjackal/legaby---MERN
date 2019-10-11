const React = require('react');
const ReactRouter = require('react-router-dom');
const LazyLoad = require('react-lazyload');
const PropTypes = require('prop-types');

const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object
};

class Job extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
      isReady: true,
      count: 1,
      selectJob: false,
      checkedJobs: []
    };
    this.onSelect = this.onSelect.bind(this);
    this.changeAllJobStatus = this.changeAllJobStatus.bind(this);
  }

  componentDidMount() {
  	let checkedJobs = this.state.checkedJobs;
  	if (checkedJobs[this.props.id] === undefined) {
  		checkedJobs[this.props.id] = false;
  	}
  	else {
  		checkedJobs[index] = !checkedJobs[index];
  	}
  	this.setState({
  		checkedJobs: checkedJobs
  	});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id && this.props.id) {
      this.setState({
        isReady: false
      });

      setTimeout(() => {
        this.setState({
          isReady: true,
          count: this.state.count + 1
        });
      }, 500);
    } else {
      this.setState({
        isReady: true
      });
    }
  }

  onSelect(index) {
  	let checkedJobs = this.state.checkedJobs;
  	if (checkedJobs[index] === undefined) {
  		checkedJobs[index] = true;
  	} else {
  		checkedJobs[index] = !checkedJobs[index];
  	}
  	this.setState({
  		checkedJobs: checkedJobs
  	});
  	this.props.linkSelectState(this.props.id, checkedJobs[index]);
  }

  changeAllJobStatus(value) {
  	console.log(value)

  }

  render() {
    return this.state.isReady ? (
      <div className="widget">
        {this.props.data ? (
          <div className="row table-row">
            <div className="col-sm-1 text-center">
              <input type="checkbox" name="allJobs" defaultChecked={false} checked={this.state.checkedJobs[this.props.id]} onChange={this.onSelect.bind(this, this.props.id)}/>
	          </div>
	          <div className="col-sm-3">
	              <label>Job Headline</label>
	              <label>{this.props.data['Job Headline']}</label>
	          </div>
	          <div className="col-sm-3">
	              <label>{this.props.data['Status']}</label>
	          </div>
	          <div className="col-sm-3">
	              <label>{this.props.data['Practice Areas']}</label>
	          </div>
          </div>
        ) : ''
      }
      </div>
    ) : (
      <div className="widget loading">
        loading...
      </div>
    );
  }
}

Job.propTypes = propTypes;
module.exports = Job;
