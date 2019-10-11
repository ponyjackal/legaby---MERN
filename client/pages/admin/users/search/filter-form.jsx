'use strict';
const FilterFormHoc = require('../../../../pages/admin/components/filter-form-hoc.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const SelectControl = require('../../../../components/form/select-control.jsx');
const TextControl = require('../../../../components/form/text-control.jsx');


const propTypes = {
    linkInputState: PropTypes.func,
    linkSelectState: PropTypes.func,
    loading: PropTypes.bool,
    state: PropTypes.object
};
const defaultValues = {
    email: '',
    sort: 'status',
    limit: '20',
    page: '1'
};


class FilterForm extends React.Component {
    render() {

        return (
            <div className="row">
                <div className="col-sm-3">
                    <TextControl
                        name="email"
                        label="Email Search"
                        value={this.props.state.email}
                        onChange={this.props.linkInputState}
                        disabled={this.props.loading}
                    />
                </div>
                <div className="col-sm-2">
                   <SelectControl
                        name="status"
                        label="Active"
                        value={this.props.state.status}
                        onChange={this.props.linkSelectState}
                        disabled={this.props.loading}>

                        <option value="111">-- choose--</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </SelectControl>
                </div>
                <div className="col-sm-2">
                    <SelectControl
                        name="is_bar_id_valid"
                        label="Valid"
                        value={this.props.state.is_bar_id_valid}
                        onChange={this.props.linkSelectState}
                        disabled={this.props.loading}>

                        <option value="">-- choose--</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </SelectControl>
                </div>
                <div className="col-sm-3">
                    <SelectControl
                        name="sort"
                        label="Sort by"
                        value={this.props.state.sort}
                        onChange={this.props.linkSelectState}
                        disabled={this.props.loading}>

                        <option value="status">Active &#9650;</option>
                        <option value="-status">Active &#9660;</option>
                        <option value="is_bar_id_valid">Valid &#9650;</option>
                        <option value="-is_bar_id_valid">Valid &#9660;</option>
                        <option value="first_name">first_name &#9650;</option>
                        <option value="-first_name">first_name &#9660;</option>
                        <option value="last_name">last_name &#9650;</option>
                        <option value="-last_name">last_name &#9660;</option>
                    </SelectControl>
                </div>
                <div className="col-sm-2">
                    <SelectControl
                        name="limit"
                        label="Display"
                        value={this.props.state.limit}
                        onChange={this.props.linkSelectState}
                        disabled={this.props.loading}>

                        <option value="5">5 items</option>
                        <option value="10">10 items</option>
                        <option value="20">20 items</option>
                        <option value="50">50 items</option>
                        <option value="100">100 items</option>
                    </SelectControl>
                </div>
            </div>
        );
    }
}

FilterForm.propTypes = propTypes;


module.exports = FilterFormHoc(FilterForm, defaultValues);
