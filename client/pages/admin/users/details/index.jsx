'use strict';
const Actions = require('./actions');
const DeleteForm = require('../../../../../client/pages/admin/components/delete-form.jsx');
const DetailsForm = require('./details-form.jsx');
const PasswordForm = require('./password-form.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const RolesForm = require('./roles-form.jsx');
const Store = require('./store');
const Loader = require('../../../../components/loader.jsx');

const Link = ReactRouter.Link;
const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object
};


class DetailsPage extends React.Component {
    constructor(props) {

        super(props);

        Actions.getDetails(this.props.match.params.id);

        this.state = Store.getState();
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    onStoreChange() {

        this.setState(Store.getState());
    }

    render() {

        if (!this.state.details.hydrated) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/admin/users">Users</Link>
                    </h1>
                    <Loader loading={!this.state.details.hydrated} > </Loader>
                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/admin/users">Users</Link> / Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        const id = this.state.details._id;
        const firstName = this.state.details.first_name;
        const lastName = this.state.details.last_name;
        const email = this.state.details.email;

        return (
            <section className="container">
                <h1 className="page-header">
                    <Link to="/admin/users">Users</Link> / {email} - {firstName} {lastName}
                </h1>
                <div className="row">
                    <div className="col-sm-8">
                        <DetailsForm {...this.state.details} />
                        {/*<RolesForm {...this.state.details.role} />
                        <PasswordForm {...this.state.password} />
                        <DeleteForm
                            {...this.state.delete}
                            action={Actions.delete.bind(Actions, id, this.props.history)}
                        />*/}
                    </div>
                </div>
            </section>
        );
    }
}

DetailsPage.propTypes = propTypes;


module.exports = DetailsPage;
