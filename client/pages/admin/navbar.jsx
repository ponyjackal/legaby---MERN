'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const ClassNames = require('classnames');
const Actions = require('./users/search/actions');

const Link = ReactRouter.Link;
const propTypes = {
    location: PropTypes.object
};


class Navbar extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            navBarOpen: false
        };
    }

    componentWillReceiveProps() {

        this.setState({ navBarOpen: false });
    }

    classForPath(pathPattern) {

        return ClassNames({
            active: this.props.location.pathname.match(pathPattern)
        });
    }

    toggleMenu() {

        this.setState({ navBarOpen: !this.state.navBarOpen });
    }

    signout(event) {

      Actions.logout();
    }

    render() {

        const navBarCollapse = ClassNames({
            'navbar-collapse': true,
            'pt-10': true,
            collapse: !this.state.navBarOpen
        });

        return (
          <div className="navbar navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <Link className="navbar-brand" to="/admin/users">
                  <img className="navbar-logo" src="/public/media/logo@2x.png" />
                  {/*<span className="navbar-brand-label">Aqua</span>*/}
                </Link>
                <button className="navbar-toggle collapsed" onClick={this.toggleMenu.bind(this)}>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
              </div>
              <div className={navBarCollapse}>
                <ul className="nav navbar-nav">
                  <li className={this.classForPath(/^\/admin\/users/)}>
                    <Link to="/admin/users">Users</Link>
                  </li>
                  <li className={this.classForPath(/^\/admin\/users/)}>
                    <Link to="/admin/export">Export</Link>
                  </li>
                  <li className={this.classForPath(/^\/admin\/users/)}>
                    <Link to="/admin/change-password">Change Password</Link>
                  </li>
                  {/* link for xml feed page
                  <li className={this.classForPath(/^\/admin\/users/)}>
                    <Link to="/admin/feeds">Feeds</Link>
                  </li>*/}
                </ul>
                  <ul className="nav navbar-nav navbar-right">
                    <li>
                      <a onClick={this.signout.bind(this)}><i className="fa fa-sign-out"></i>Sign Out</a>
                    {/* <a href="/login/logout">Sign out</a>*/}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        );
    }
}

Navbar.propTypes = propTypes;


module.exports = Navbar;
