'use strict';
const Actions = require('./actions');
const Alert = require('../../../../components/alert.jsx');
const Button = require('../../../../components/form/button.jsx');
const ControlGroup = require('../../../../components/form/control-group.jsx');
const LinkState = require('../../../../helpers/link-state');
const PropTypes = require('prop-types');
const React = require('react');
const SelectControl = require('../../../../components/form/select-control.jsx');
const Spinner = require('../../../../components/form/spinner.jsx');
const TextControl = require('../../../../components/form/text-control.jsx');
const ReactRouter = require('react-router-dom');
const Link = ReactRouter.Link;
const Loader = require('../../../../components/loader.jsx');


const propTypes = {
    _id: PropTypes.string,
    email: PropTypes.string,
    error: PropTypes.string,
    hasError: PropTypes.object,
    help: PropTypes.object,
    status: PropTypes.number,
    loading: PropTypes.bool,
    showSaveSuccess: PropTypes.bool,
    first_name: PropTypes.string,
    is_bar_id_valid: PropTypes.string,
    freeze_activity: PropTypes.bool
};


class DetailsForm extends React.Component {
    constructor(props) {

        super(props);
        this.state = {
            status: props.status,
            is_bar_id_valid: props.is_bar_id_valid,
            prev_is_bar_id_valid: props.is_bar_id_valid,
            email: props.email,
            freeze_activity: props.freeze_activity,
            flag: false
        };
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            status: nextProps.status,
            is_bar_id_valid: nextProps.is_bar_id_valid,
            prev_is_bar_id_valid: nextProps.is_bar_id_valid,
            email: nextProps.email,
            freeze_activity: nextProps.freeze_activity,
            flag: false
        });
    }

    changeJobStatus(){
      this.setState({ freeze_activity: !this.state.freeze_activity, flag: true });
    }

    handleSubmit(event) {

        event.preventDefault();
        event.stopPropagation();
        const id = this.props._id;
        let data = {
            email: this.state.email,
            status: Number(this.state.status),
            is_bar_id_valid: this.state.is_bar_id_valid,
            prev_is_bar_id_valid: this.state.prev_is_bar_id_valid
        };
        if (this.state.flag) {
            data.freeze_activity = this.state.freeze_activity;
        }
        Actions.saveDetails(id, data);
    }

    render() {

        const alerts = [];

        if (this.props.showSaveSuccess) {
            alerts.push(<Alert
                key="success"
                type="success"
                onClose={Actions.hideDetailsSaveSuccess}
                message="Success. Changes have been saved."
            />);
        }

        if (this.props.error) {
            alerts.push(<Alert
                key="danger"
                type="danger"
                message={this.props.error}
            />);
        }

        const formElements = <fieldset>
            {alerts}
            <SelectControl
                name="status"
                label="Active"
                value={this.state.status}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.status}
                help={this.props.help.status}
                disabled={this.props.loading}>

                <option value="1">Yes</option>
                <option value="0">No</option>
            </SelectControl>
            <SelectControl
                name="is_bar_id_valid"
                label="Valid"
                value={this.state.is_bar_id_valid}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.is_bar_id_valid}
                help={this.props.help.is_bar_id_valid}
                disabled={this.props.loading}>

                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </SelectControl>
            {this.state.is_bar_id_valid == "No" ?
              <label>
                <input type="checkbox" name="resetJobs" checked={this.state.freeze_activity} onChange={this.changeJobStatus.bind(this)}/>
                <span className="pmd-checkbox-label">&nbsp;</span>Freeze activity on all active applied jobs
               </label>
              : ''
            }
            <ControlGroup hideLabel={true} hideHelp={true}>
                <Link
                    className="btn btn-default mr-10"
                    to='/admin/users'>

                    Cancel
                </Link>
                <Button
                    type="submit"
                    inputClasses={{ 'btn-primary': true }}
                    value="submit"
                    disabled={this.props.loading}>

                    Save changes
                </Button>
            </ControlGroup>
            <Loader loading={this.props.loading} > </Loader>
        </fieldset>;

        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                {formElements}
            </form>
        );
    }
}

DetailsForm.propTypes = propTypes;


module.exports = DetailsForm;
