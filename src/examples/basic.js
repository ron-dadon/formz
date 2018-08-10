import React, { Component } from 'react'
import Formz from '../Formz'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, type = 'text' }) => (
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
  </div>
)

class LoginForm extends Component {
  render() {
    console.log('render')
    // The Field prop is the unique form field component bound to the wrapping form
    const { Field, submitting, submitted, submitSuccess } = this.props
    return (
      <div>
        <Field
          component={Input}
          name='email'
          label='Email'
        />
        <Field
          component={Input}
          name='password'
          type='password'
          label='Password'
        />
        <div>
          <button type='reset' disabled={submitting}>Reset</button>
          <button type='submit' disabled={submitting}>Login</button>
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

export default class App extends Component {
  onSubmit = values => new Promise((resolve, reject) => {
    // Simulate server call with timeout
    console.log('Submitted form with values', values)
    const result = values.email === 'test@test.com' && values.password === '12345' ? resolve : reject
    setTimeout(result, 100)
  })

  render() {
    return (
      <div>
        <Formz render={LoginForm} onSubmit={this.onSubmit} />
      </div>
    )
  }
}