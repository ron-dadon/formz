import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Formz from '../lib/components/Formz'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, touched, errors, invalid, type = 'text' }) => (
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
    {touched && invalid && errors.required && <div>This is required</div>}
    {touched && invalid && errors.email && <div>Invalid email</div>}
    {touched && invalid && errors.exists && <div>Already exists</div>}
    {touched && invalid && errors.strength && <div>Password not strong enough</div>}
  </div>
)

class LoginForm extends Component {
  validators = {
    email: ({ value }) => !value || value && /^[a-z0-9][a-z0-9\-.]+@[a-z0-9\-.]+\.[a-z]+/i.test(value),
    exists: ({ value }) => new Promise((resolve) => setTimeout(() => value === 'john' ? resolve(false) : resolve(true), 100))
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
          name='email'
          label='Email'
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
  onSubmit = values => new Promise((resolve, reject) => {
    // Simulate server call with timeout
    console.log('Submitted form with values', values)
    const result = values.email === 'test@test.com' && values.password === '12345' ? resolve : reject
    setTimeout(result, 100)
  })

  render() {
    return <Formz render={LoginForm} onSubmit={this.onSubmit} />
  }
}

ReactDOM.render(<BasicExampleWithAsyncValidation />, document.querySelector('div#live-example'))
