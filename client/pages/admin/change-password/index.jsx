'use strict';
const React = require('react');
const Actions = require('./actions');
const Store = require('./store');
const Qs = require('qs');
const PropTypes = require('prop-types');
const Moment = require('moment');
const ReactRouter = require('react-router-dom');
const Link = ReactRouter.Link;
const LinkState = require('../../../helpers/link-state');
const ControlGroup = require('../../../components/form/control-group.jsx');
const Spinner = require('../../../components/form/spinner.jsx');
const Button = require('../../../components/form/button.jsx');
const Loader = require('../../../components/loader.jsx');
const TextControl = require('../../../components/form/text-control.jsx');
const Alert = require('../../../components/alert.jsx');
const constant = require('../../constant.js');

const propTypes = {
    error: PropTypes.string,
    hasError: PropTypes.object,
    help: PropTypes.object,
    loading: PropTypes.bool,
    showSaveSuccess: PropTypes.bool
};

class ChangePassword extends React.Component {
    constructor(props) {

      super(props);

      this.state = {
        password: '',
        oldPassword: '',
        passwordConfirm: '',
        showOldPass : false,
        showNewPass : false,
        showRePass : false,
        opasswordValid: false,
        passwordValid: false,
        cpasswordValid: false,
        showSaveSuccess: false,
        error: undefined,
        formErrors: {old_password: '', password: '', confirm_password: ''}
      }
      this.handleInputOnBlur = this.handleInputOnBlur.bind(this);
      this.handleUserInput = this.handleUserInput.bind(this);
      this.showOldPassword = this.showOldPassword.bind(this);
      this.showNewPassword = this.showNewPassword.bind(this);
      this.showRePassword = this.showRePassword.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.resetAll = this.resetAll.bind(this);
    }
    componentWillUnmount() {

      this.unsubscribeStore();

    }
    componentDidMount() {
      this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    onStoreChange() {
      let data = Store.getState();
      this.setState({
        showSaveSuccess: data.results.showSaveSuccess,
        error: data.results.error,
        loading: data.results.loading
      })
    }

    resetAll() {
      this.setState({
        password: '',
        oldPassword: '',
        passwordConfirm: '',
        showOldPass : false,
        showNewPass : false,
        showRePass : false,
        opasswordValid: false,
        passwordValid: false,
        cpasswordValid: false,
        showSaveSuccess: false,
        error: undefined,
        formErrors: {old_password: '', password: '', confirm_password: ''}
      });

    }

    showOldPassword() {
      if(this.state.showOldPass){
        document.getElementById("crnt-pwd").setAttribute("type", "password");
        this.setState({
          showOldPass: false
        });
      }else{
        document.getElementById("crnt-pwd").setAttribute("type", "text");
        this.setState({
          showOldPass: true
        });
      }
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


    handleInputOnBlur(e){
      this.setState({[e.target.name]: e.target.value});
      this.validateField(e.target.name, e.target.value);
    }

    handleUserInput(e){
      this.setState({[e.target.name]: e.target.value});
    }

    validateField(fieldName, value) {
      let fieldValidationErrors = this.state.formErrors;

      switch(fieldName) {
        case 'oldPassword':
          if(!value){
            this.state.opasswordValid = false;
            fieldValidationErrors.old_password = this.state.opasswordValid ? '': constant.ENTER_CURR_PASS;
          }else{
            this.state.opasswordValid = true;
            fieldValidationErrors.old_password = '';
          }
          break;
        case 'password':
          if(value){
            if(value.length >= 8){
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
                  }else{
                    this.state.passwordValid = false;
                    fieldValidationErrors.password = this.state.passwordValid ? '': constant.INVALID_PASS_LENGTH;
                  }
            }else{
              this.state.passwordValid = false;
              fieldValidationErrors.password = this.state.passwordValid ? '': constant.INVALID_PASS_LENGTH;
            }
          }else{
            this.state.passwordValid = false;
            fieldValidationErrors.password = this.state.passwordValid ? '': constant.ENTER_NEW_PASS;
          }
          break;
        case 'passwordConfirm':
          if(value){
              this.state.cpasswordValid = (value == this.state.password ? true : false);
              fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.PASS_NOT_MATCH;
            }else{
              this.state.cpasswordValid = false;
            fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.ENTER_NEW_RETYPE_PASS;
          }
          break;
        default:
          break;
      }
      this.setState({formErrors: fieldValidationErrors,
        opasswordValid: this.state.opasswordValid,
        passwordValid: this.state.passwordValid,
        cpasswordValid: this.state.cpasswordValid,
      });
    }
    handleSubmit(event) {

      event.preventDefault();
      event.stopPropagation();
      let fieldValidationErrors = this.state.formErrors;
      if(!this.state.oldPassword){
        this.state.opasswordValid = false;
        fieldValidationErrors.old_password = this.state.opasswordValid ? '': constant.ENTER_CURR_PASS;
      }

      if(!this.state.password){
        this.state.passwordValid = false;
        fieldValidationErrors.password = this.state.passwordValid ? '': constant.ENTER_NEW_PASS;
      }

      if(!this.state.passwordConfirm){
        this.state.cpasswordValid = false;
        fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.ENTER_NEW_RETYPE_PASS;
      }
      else if(this.state.password != this.state.passwordConfirm){
        this.state.cpasswordValid = false;
        fieldValidationErrors.confirm_password = this.state.cpasswordValid ? '': constant.PASS_NOT_MATCH;
      }

      this.setState({formErrors: fieldValidationErrors,
        opasswordValid: this.state.opasswordValid,
        passwordValid: this.state.passwordValid,
        cpasswordValid: this.state.cpasswordValid,
      });
      let formValid = this.state.opasswordValid && this.state.passwordValid && this.state.cpasswordValid;

      if(formValid && (this.state.oldPassword && this.state.password == this.state.passwordConfirm)){
        const data = {
          password: this.state.password,
          passwordConfirm: this.state.passwordConfirm,
          oldPassword: this.state.oldPassword
        };
        Actions.changePassword(data);
      }
    }

    render() {
        const alerts = [];

        if (this.state.showSaveSuccess) {
            alerts.push(<Alert
                key="success"
                type="success"
                onClose={Actions.hidePasswordSaveSuccess}
                message="Success. Changes have been saved."
            />);
        }

        if (this.state.error) {
            alerts.push(<Alert
                key="danger"
                type="danger"
                message={this.state.error}
            />);
        }

      return (
        <div className="container admin-chng-pwd">
          <div className="mr-80">
              <legend>Change Password</legend>
                {alerts}
              <div className="col-xs-12">
                <div className={this.state.formErrors.old_password !== '' ? 'form-group global-error' : 'form-group'}>
                  <label htmlFor="crnt-pwd" className="control-label">Current Password</label>
                  <div className="pwd-wrapper">
                    <input type="password" id="crnt-pwd" className="pswd form-control"
                      placeholder="Current Password"
                      name="oldPassword"
                      value={this.state.oldPassword}
                      onBlur={this.handleInputOnBlur}
                      onChange={this.handleUserInput} />
                    <span onClick={this.showOldPassword} className="eye"><i className={this.state.showOldPass ? "fa fa-eye" : "fa fa-eye-slash"}></i></span>
                  </div>
                  <p><span>{this.state.formErrors.old_password !== '' ? this.state.formErrors.old_password : ''}</span></p>
                </div>
              </div>
              <div className="col-xs-12">
                <div className={this.state.formErrors.password !== '' ? 'form-group global-error' : 'form-group'}>
                  <label htmlFor="new-pwd" className="control-label">New Password</label>
                  <div className="pwd-wrapper">
                    <input type="password" id="new-pwd" className="pswd form-control"
                      placeholder="Password"
                      name="password"
                      value={this.state.password}
                      onBlur={this.handleInputOnBlur}
                      onChange={this.handleUserInput} />
                    <span onClick={this.showNewPassword} className="eye"><i className={this.state.showNewPass ? "fa fa-eye" : "fa fa-eye-slash"}></i></span>
                  </div>
                  <p><span>{this.state.formErrors.password !== '' ? this.state.formErrors.password : ''}</span></p>
                </div>
              </div>
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
              </div>
              <div className="btns col-xs-12">
                <button className="btn btn-default mr-10" onClick={this.resetAll}> Cancel </button>
                <button className="btn btn-primary m-0" onClick={this.handleSubmit}> Save</button>
              </div>

            </div>
            <Loader loading={this.props.loading} > </Loader>
        </div>

      	)
    }
}

module.exports = ChangePassword;

