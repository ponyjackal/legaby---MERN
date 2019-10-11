'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');


const Link = ReactRouter.Link;
const propTypes = {
    data: PropTypes.array
};


class Results extends React.Component {

    render() {
        const rows = this.props.data.map((record) => {
            record.isActive = record.status === 1 ? 'Yes' : 'No';
            return (
                <tr key={record._id}>
                    <td>
                        <Link
                            className="btn btn-default"
                            to={`/admin/users/${record._id}`}>
                            Edit
                        </Link>
                    </td>
                    <td>{record.email}</td>
                    <td>{record.first_name}</td>
                    <td>{record.last_name}</td>
                    <td>{record.isActive}</td>
                    <td className="nowrap">{record.is_bar_id_valid}</td>
                    {/*<td className="nowrap">{record._id}</td>*/}
                </tr>
            );
        });

        return (
            <div className="table-responsive">
                <table className="table table-striped table-results">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Email</th>
                            <th >First Name</th>
                            <th>Last Name</th>
                            <th>Active</th>
                            <th>Bar Id Valid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}

Results.propTypes = propTypes;


module.exports = Results;
