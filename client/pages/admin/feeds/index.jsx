'use strict';
const Actions = require('./actions');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Store = require('./store');
const Loader = require('../../../components/loader.jsx');
const SelectControl = require('../../../components/form/select-control.jsx');
//const Job = require('./Job.jsx');
import LazyLoad from 'react-lazyload';
import Job from './Job'

const Link = ReactRouter.Link;
const propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
};


class Feed extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            feedDropdown: 'indded',
            jobs: [],
            page: 1,
            limit: 10,
            selectedJobs: {},
            allJob: false,
            loading: true,
            totalJobs: 0,
            error: undefined,
            initial: true
        };

        Actions.getPostJobsDetails({limit: 10, page: 1});
        this.createFeed = this.createFeed.bind(this);
        this.downloadFeed = this.downloadFeed.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.onSelectJob = this.onSelectJob.bind(this);
        this.onDropdownChange = this.onDropdownChange.bind(this);
    }

    componentDidMount() {

        window.addEventListener("scroll", this.handleScroll);
        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight) {
            this.setState({
                loading: true
            });
            let page = this.state.page + 1;
            Actions.getPostJobsDetails({limit: this.state.limit, page: page});
        } else {
            this.setState({
                loading: false
            });
        }
      }

    onStoreChange() {
        let resData = Store.getState();
        if (resData.result.data.length > 0) {
            let jobs = this.state.jobs;
            let initial = this.state.initial;
            initial = jobs.length > 1 ? false : true;
            jobs = jobs.concat(resData.result.data);
            let page = this.state.page + 1;
            this.setState({ jobs: jobs, page: page, totalJobs: resData.result.totalJobs, error: resData.result.error, initial: initial });
        }
        this.setState({ loading: false})
    }

    onDropdownChange() {

    }

    onSelectJob(index, value) {
        if (index === 'all') {
            this.setState({
                allJob: !this.state.allJob
            });
        } else {
            let selectedJobs = this.state.selectedJobs;
            if (value) {
                selectedJobs[index] = this.state.jobs[index];
            } else {
                delete (selectedJobs[index]);
            }
            this.setState({
                selectedJobs: selectedJobs
            })
        }
    }

    createFeed() {

    }

    downloadFeed() {

    }

    render() {

        // if (!this.state.details.hydrated) {
        //     return (
        //         <section className="container">
        //             <h1 className="page-header">
        //                 <Link to="/admin/users">Users</Link>
        //             </h1>
        //             <Loader loading={!this.state.details.hydrated} > </Loader>
        //         </section>
        //     );
        // }

        if (this.state.error) {
            return (
                <section className="container">
                    <div className="alert alert-danger">
                        {this.state.error}
                    </div>
                </section>
            );
        }

        const selectedCount = Object.keys(this.state.selectedJobs).length;

        return (
            <section className="container feed-page">
                <h3 className="page-header">
                    Feed
                </h3>
                <div className="d-flex short-feeds">
                    <div className="pr-10">
                        <SelectControl
                          name="search"
                          value={this.state.feedDropdown}
                          onChange={this.onDropdownChange}
                          disabled={this.state.loading}>
                          <option value="indeed">Indeed</option>
                        </SelectControl>
                    </div>
                    <div className="pr-10">
                        <button className="btn" onClick={this.createFeed}> Create </button>
                    </div>
                    <div className="pr-10">
                        {selectedCount} of {this.state.totalJobs} selected
                    </div>
                    <div className="pr-10">
                        <button className="btn" onClick={this.downloadFeed}> Download </button>
                    </div>
                </div>
                <div className="row page-header table-header">
                    <div className="col-sm-1 text-center">
                        <input type="checkbox" name="allJobs" checked={this.state.allJob} onChange={this.onSelectJob.bind(this, 'all', '')}/>
                    </div>
                    <div className="col-sm-3">
                       <label>Job</label>
                    </div>
                    <div className="col-sm-3">
                       <label>Status</label>
                    </div>
                    <div className="col-sm-3">
                       <label>Practice Areas</label>
                    </div>
                </div>
                { this.state.jobs.length > 0 ?
                    this.state.jobs.map((job, index) => (
                        <div className="widget-wrapper" key={index}>
                          <LazyLoad height={200}>
                            <Job data={job} id={index} count={ index + 1 } initial={this.state.initial} linkSelectState={this.onSelectJob.bind(this)}/>
                          </LazyLoad>
                        </div>
                    ))
                    : ''
                }
                <Loader loading={this.state.loading} > </Loader>
            </section>
        )
    }
}
Feed.propTypes = propTypes;


module.exports = Feed;
