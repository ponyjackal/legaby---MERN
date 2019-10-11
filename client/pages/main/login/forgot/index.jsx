'use strict';
const Actions = require('../actions');
const Button = require('../../../../components/form/button.jsx');
const ControlGroup = require('../../../../components/form/control-group.jsx');
const React = require('react');
const ReactHelmet = require('react-helmet');
const ReactRouter = require('react-router-dom');
const Spinner = require('../../../../components/form/spinner.jsx');
const Store = require('./store');
const TextControl = require('../../../../components/form/text-control.jsx');
const Loader = require('../../../../components/loader.jsx');


const Helmet = ReactHelmet.Helmet;
const Link = ReactRouter.Link;


class ForgotPage extends React.Component {
    constructor(props) {

        super(props);
        this.input = {};
        this.state = {
            loading: false,
            success: false,
            error: undefined,
            hasError: {},
            help: {}
        };
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));

        if (this.input.email) {
            this.input.email.focus();
        }
    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    onStoreChange() {

        this.setState(Store.getState());
    }

    handleSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        Actions.forgot({
            email: this.input.email.value()
        });
    }

    render() {

        const alerts = [];

        if (this.state.success) {
            let email = this.input.email.value();
            alerts.push(<div key="success">
                <div className="alert alert-success">
                    An email has been sent to {email}. Please click on the link provided in the mail to reset your password.
                    In case you do not receive your password reset email shortly, please check spam folder also.
                </div>
                <Link to="/login" className="btn btn-link">Back to login</Link>
            </div>);
        }

        if (this.state.error) {
            alerts.push(<div key="danger" className="alert alert-danger">
                {this.state.error}
            </div>);
        }

        let formElements;

        if (!this.state.success) {
            formElements = <fieldset>
                <TextControl
                    ref={(c) => (this.input.email = c)}
                    name="email"
                    label="What's your email?"
                    hasError={this.state.hasError.email}
                    help={this.state.help.email}
                    disabled={this.state.loading}
                />
                <ControlGroup hideLabel={true} hideHelp={true}>
                    <Button
                        type="submit"
                        inputClasses={{ 'btn-primary': true }}
                        disabled={this.state.loading}>

                        Send reset
                    </Button>
                    <Link to="/login" className="btn btn-link">Back to login</Link>
                </ControlGroup>
                <Loader loading={this.state.loading}> </Loader>
            </fieldset>;
        }

        return (
            <section className="container">
                <Helmet>
                    <title>Request Password Reset</title>
                </Helmet>
                <div className="container">
                    <h1 className="page-header">Request Password Reset</h1>
                    <div className="row">
                        <div className="col-sm-6">
                            <legend>Please provide your registered email address to aid in the password recovery process.</legend>
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                {alerts}
                                {formElements}
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}


module.exports = ForgotPage;
