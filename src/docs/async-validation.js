import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Formz from '../lib/components/Formz'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, touched, errors, invalid, pending, type = 'text' }) => (
  <div className='form-group'>
    <input
      className='form-control'
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={label}
      disabled={submitting}
    />
    {touched && pending && <div>Checking...</div>}
    {touched && invalid && errors.required && <div>This is required</div>}
    {touched && invalid && errors.exists && <div>Already exists</div>}
    {touched && invalid && errors.strength && <div>Password not strong enough</div>}
    {touched && invalid && errors.match && <div>Password does not match</div>}
  </div>
)

class RegistrationForm extends Component {
  validators = {
    exists: ({ value }) => new Promise((resolve) => setTimeout(() => value === 'john' ? resolve(false) : resolve(true), 1000))
  }

  passwordValidators = {
    strength: ({ value }) => value.length >= 5
  }

  passwordConfirmValidators = {
    match: ({ value, allValues, props: { match } }) => value === allValues[match]
  }

  render() {
    // The Field prop is the unique form field component bound to the wrapping form
    const { Field, invalid, submitting, submitted, submitSuccess } = this.props
    return (
      <div className='col-xs-12 col-md-6 col-lg-3'>
        <Field
          render={Input}
          name='username'
          label='Username'
          validators={this.validators}
          required
        />
        <Field
          render={Input}
          name='password'
          type='password'
          label='Password'
          validators={this.passwordValidators}
          required
        />
        <Field
          render={Input}
          name='passwordConfirm'
          type='password'
          label='Confirm Password'
          validators={this.passwordConfirmValidators}
          match="password"
          reValidateOnFormChanges='password'
          required
        />
        <div>
          <button className='btn btn-light' type='reset' disabled={submitting}>Reset</button>
          <button className='btn btn-primary' type='submit' disabled={submitting || invalid}>Register</button>
        </div>
        {
          <p>
            {submitted && !submitting && `Registration ${submitSuccess ? 'completed' : 'failed'}`}
            {submitted && submitting && 'Registering...'}
          </p>
        }
      </div>
    )
  }
}

class BasicExampleWithAsyncValidation extends Component {
  onSubmit = values => new Promise((resolve) => {
    // Simulate server call with timeout
    console.log('Submitted form with values', values)
    setTimeout(resolve, 1000)
  })

  render() {
    return <Formz render={RegistrationForm} onSubmit={this.onSubmit} />
  }
}

ReactDOM.render(<BasicExampleWithAsyncValidation />, document.querySelector('div#live-example'))
