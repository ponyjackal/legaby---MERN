'use strict';
const React = require('react');
const Actions = require('./actions');
const Store = require('./store');
const Qs = require('qs');
const PropTypes = require('prop-types');
const Moment = require('moment');
const fileDownload = require('react-file-download');
const Spinner = require('../../../components/form/spinner.jsx');
const Button = require('../../../components/form/button.jsx');
const Loader = require('../../../components/loader.jsx');

const propTypes = {
    error: PropTypes.string,
    hasError: PropTypes.object,
    help: PropTypes.object,
    loading: PropTypes.bool,
    showSaveSuccess: PropTypes.bool
};

class ExportPage extends React.Component {
    constructor(props) {

        super(props);
        this.state = {
          results: ''
        };
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    componentWillUnmount() {

        this.unsubscribeStore();

    }

    onStoreChange() {

        this.setState(Store.getState());
        if (this.state.results.hydrated) {

            const thisMoment = Moment();
            let data = this.state.results.data;
            let key = this.state.results.key, filename = '';
            if (key == 'users') {
                filename = 'users_' + thisMoment.format('DDMMYYYY') + '_' + thisMoment.format('HHmmss')+'.csv';
            } else {
                filename = 'post_jobs_' + thisMoment.format('DDMMYYYY') + '_' + thisMoment.format('HHmmss')+'.csv';
            }
            this.setState({results: ''});
            fileDownload(data, filename);
        }
    }

    exportData (key, event) {
        event.preventDefault();
        event.stopPropagation();
    	if (key === 'users') {
    		Actions.getExoprtUserData({});
    	} else {
    		Actions.getExoprtJobsData({});
    	}
    }

    render() {
        const alerts = [];
        // if (this.state.results.showFetchFailure) {
        //     return (
        //         <section className="container">
        //             <h1 className="page-header">
        //               Error
        //             </h1>
        //             <div className="alert alert-danger">
        //                 {this.state.results.error}
        //             </div>
        //         </section>
        //     );
        // }
        if (this.props.error) {
            alerts.push(<Alert
                key="danger"
                type="danger"
                message={this.props.error}
            />);
        }

      return (
      	<div id="export" className="card-view">
         <Button
              type="submit"
              inputClasses={{ 'btn-primary': true }}
              disabled={this.state.results.loading}
              onClick={this.exportData.bind(this, 'users')}>

              Export Users
          </Button>

          <Button
              type="submit"
              inputClasses={{ 'btn-primary': true }}
              disabled={this.state.results.loading}
              onClick={this.exportData.bind(this, 'jobs')}>

              Export Post Jobs
          </Button>
          <Loader loading={this.state.results.loading} > </Loader>
	    </div>

      	)
    }
}

module.exports = ExportPage;

