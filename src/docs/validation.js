import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Formz from '../lib/components/Formz'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, touched, errors, invalid, type = 'text' }) => (
  <div>
    <input
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
  </div>
)

class LoginForm extends Component {
  emailValidators = {
    email: ({ value }) => !value || value && /^[a-z0-9][a-z0-9\-.]+@[a-z0-9\-.]+\.[a-z]+/i.test(value)
  }

  render() {
    // The Field prop is the unique form field component bound to the wrapping form
    const { Field, invalid, submitting, submitted, submitSuccess } = this.props
    return (
      <div>
        <Field
          render={Input}
          name='email'
          label='Email'
          validators={this.emailValidators}
          required
        />
        <Field
          render={Input}
          name='password'
          type='password'
          label='Password'
        />
        <div>
          <button type='reset' disabled={submitting}>Reset</button>
          <button type='submit' disabled={submitting || invalid}>Login</button>
        </div>
        {
          <p>
            {submitted && !submitting && `Login ${submitSuccess ? 'OK' : 'FAIL'}`}
            {submitted && submitting && 'Logging in...'}
          </p>
        }
      </div>
    )
  }
}

class BasicExampleWithValidation extends Component {
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

ReactDOM.render(<BasicExampleWithValidation />, document.querySelector('div#live-example'))
