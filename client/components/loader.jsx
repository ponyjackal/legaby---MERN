'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const ClassNames = require('classnames');

const propTypes = {
    loading: PropTypes.bool
};


class Loader extends React.Component {
  render() {

    const loaderClasses = ClassNames({
      'fade-layer': true,
      'hide': !this.props.loading
    });

    return (
      <div id="legably_loader" className={loaderClasses}>
        <div className="loader"></div>
      </div>
    );
  }
}

Loader.propTypes = propTypes;

module.exports = Loader;
