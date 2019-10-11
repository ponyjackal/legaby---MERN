'use strict';
const Actions = require('../actions');
const Button = require('../../../../components/form/button.jsx');
const ControlGroup = require('../../../../components/form/control-group.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const ReactHelmet = require('react-helmet');
const ReactRouter = require('react-router-dom');
const Spinner = require('../../../../components/form/spinner.jsx');
const Store = require('./store');
const TextControl = require('../../../../components/form/text-control.jsx');
const Loader = require('../../../../components/loader.jsx');
const Alert = require('../../../../components/alert.jsx');
const constant = require('../../../constant.js');


const Helmet = ReactHelmet.Helmet;
const Link = ReactRouter.Link;
const propTypes = {
    match: PropTypes.object
};

class ResetPage extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            password: '',
            passwordConfirm: '',
            showNewPass : false,
            showRePass : false,
            passwordValid: false,
            cpasswordValid: false,
            success: false,
            error: undefined,
            loading: false,
            invalidLink: false,
            formErrors: {password: '', confirm_password: ''}
          }
        this.handleInputOnBlur = this.handleInputOnBlur.bind(this);
        this.handleUserInput = this.handleUserInput.bind(this);
        this.showNewPassword = this.showNewPassword.bind(this);
        this.showRePassword = this.showRePassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.init = this.init.bind(this);
    }

    init() {
      Actions.validateToken({
        email: this.props.match.params.email,
        key: this.props.match.params.key
      });
    }

    componentDidMount() {

      this.init();
      this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    componentWillUnmount() {
      this.unsubscribeStore();
    }

    onStoreChange() {

      let data = Store.getState();

      this.setState({
        error: data.error,
        loading: data.loading,
        invalidLink: data.invalidLink,
        success: data.success
      })
    }

    handleInputOnBlur(e){
      this.setState({[e.target.name]: e.target.value});
      this.validateField(e.target.name, e.target.value);
    }

    handleUserInput(e){
      this.setState({[e.target.name]: e.target.value});
    }

    showNewPassword() {
      if(this.state.showNewPass){
        document.getElementById("new-pwd").setAttribute("type", "password");
        this.setState({
          showNewPass: false
        });
      }else{
        document.getElementById("new-pwd").setAttribute("type", "text");
        this.setState({
          showNewPass: true
        });
      }
    }

    showRePassword() {
      if(this.state.showRePass){
        document.getElementById("retype-pwd").setAttribute("type", "password");
        this.setState({
          showRePass: false
        });
      }else{
        document.getElementById("retype-pwd").setAttribute("type", "text");
        this.setState({
          showRePass: true
        });
      }
    }

    validateField(fieldName, value) {
      let fieldValidationErrors = this.state.formErrors;

      switch(fieldName) {
        case 'password':
          if(value){
            if(value.length >= 8) {
              const PASSWORD_REGEXP = /^(?=.{8,})(?=.*[a-zA-Z0-9!@#$%^&*()]).*$/;
              if(PASSWORD_REGEXP.test(value)){
                var count = 1, counter = 1;
                for(var i=0; i<value.length; i++){
                  if(value[i] == value[i+1]){
                    count++;
                  }else{
                    if(Math.abs(value.charCodeAt(i+1) - value.charCodeAt(i)) === 1){
                      counter++;
                    }else{
                      this.state.passwordValid = true;
                      fieldValidationErrors.password = '';
                    }
                  }

                  if(count == value.length){
                    this.state.passwordValid = false;
                    fieldValidationErrors.password = this.state.passwordValid ? '': constant.INVALID_SINGLE_CHAR_PASS;
                  }else if(counter == value.length){
                    this.state.passwordValid = false;
                    fieldValidationErrors.password = this.state.passwordValid ? '': constant.INVALID_CONSECUTIVE_PASS;
                  }
                }
              } else {
                this.state.passwordValid = false;
                fieldValidationErrors.password = this.state.passwordValid ? '': constant.INVALID_PASS_LENGTH;
              }
            } else {
              this.state.passwordValid = false;
              fieldValidationErrors.password = this.state.passwordValid ? '': constant.INVALID_PASS_LENGTH;
            }
          } else {
            this.state.passwordValid = false;
            fieldValidationErrors.password = this.state.passwordValid ? '': constant.ENTER_NEW_PASS;
          }
          break;
        case 'passwordConfirm':
          if(value){
            this.state.cpasswordValid = (value == this.state.password ? true : false);
            fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.PASS_NOT_MATCH;
          } else {
            this.state.cpasswordValid = false;
            fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.ENTER_NEW_RETYPE_PASS;
          }
          break;
        default:
          break;
      }
      this.setState({formErrors: fieldValidationErrors,
        passwordValid: this.state.passwordValid,
        cpasswordValid: this.state.cpasswordValid,
      });
    }

    handleSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        let fieldValidationErrors = this.state.formErrors;

        if(!this.state.password) {
            this.state.passwordValid = false;
            fieldValidationErrors.password = this.state.passwordValid ? '': constant.ENTER_NEW_PASS;
        }

        if(!this.state.passwordConfirm) {
            this.state.cpasswordValid = false;
            fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.ENTER_NEW_RETYPE_PASS;
        }
        else if(this.state.password != this.state.passwordConfirm) {
            this.state.cpasswordValid = false;
            fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.PASS_NOT_MATCH;
        }

        this.setState({formErrors: fieldValidationErrors,
            passwordValid: this.state.passwordValid,
            cpasswordValid: this.state.cpasswordValid,
        });
        let formValid = this.state.passwordValid && this.state.cpasswordValid;

        if(formValid && (this.state.password == this.state.passwordConfirm)) {
            Actions.reset({
                email: this.props.match.params.email,
                key: this.props.match.params.key,
                password: this.state.password,
                passwordConfirm: this.state.passwordConfirm
            });
        }
    }

    render() {

      const alerts = [];

      if (this.state.success) {
        alerts.push(<div key="success">
          <div className="alert alert-success">
            Thanks! You have successfully reset your password.
          </div>
          <Link to="/login" className="btn btn-link">Back to login</Link>
          </div>
        );
      }

      if (this.state.invalidLink) {
        alerts.push(<div key="danger">
          <div className="alert alert-danger">
            Invalid Link or Link has been expired.
          </div>
          <Link to="/login" className="btn btn-link">Back to login</Link>
          </div>
        );
      }

      if (this.state.error && !this.state.invalidLink) {
        alerts.push(<Alert
          key="danger"
          type="danger"
          message={this.state.error}
        />);
      }

      let elem1, elem2, elem3;

      if (!this.state.success && !this.state.invalidLink) {
        elem1 =
          <div className="col-xs-12">
            <div className={this.state.formErrors.password !== '' ? 'form-group global-error' : 'form-group'}>
              <label htmlFor="new-pwd" className="control-label">New Password </label>
              <div className="pwd-wrapper">
                <input type="password" id="new-pwd" className="pswd form-control"
                  placeholder="New Password"
                  name="password"
                  value={this.state.password}
                  onBlur={this.handleInputOnBlur}
                  onChange={this.handleUserInput}>
                </input>
                <span onClick={this.showNewPassword} className="eye"><i className={this.state.showNewPass ? "fa fa-eye" : "fa fa-eye-slash"}></i></span>
              </div>
              <p><span>{this.state.formErrors.password !== '' ? this.state.formErrors.password : ''} </span> </p>
            </div>
          </div>;
        elem2 =
          <div className="col-xs-12">
            <div className={this.state.formErrors.confirm_password !== '' ? 'form-group global-error' : 'form-group'}>
              <label htmlFor="retype-pwd" className="control-label">Retype New Password</label>
              <div className="pwd-wrapper">
                <input type="password" id="retype-pwd" className="pswd form-control"
                  placeholder="Confirm Password"
                  name="passwordConfirm"
                  value={this.state.passwordConfirm}
                  onBlur={this.handleInputOnBlur}
                  onChange={this.handleUserInput} />
                <span onClick={this.showRePassword} className="eye"><i className={this.state.showRePass ? "fa fa-eye" : "fa fa-eye-slash"}></i></span>

              </div>
              <p><span>{this.state.formErrors.confirm_password !== '' ? this.state.formErrors.confirm_password : ''}</span></p>
            </div>
          </div>;
        elem3 =
          <div className="btns col-xs-12">
            <button className="btn btn-primary m-0" onClick={this.handleSubmit}> Submit</button>
            <Link to="/login" className="btn btn-link">Back to login</Link>
          </div>;
      }
        return (

          <div className="container admin-chng-pwd">
            <div className="mr-80">
              <legend>Reset your password</legend>
                {alerts}
                {elem1}
                {elem2}
                {elem3}
            </div>
            <Loader loading={this.state.loading} > </Loader>
          </div>

        );
    }
}

ResetPage.propTypes = propTypes;


module.exports = ResetPage;
