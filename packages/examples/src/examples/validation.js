import React from 'react'
import { Formz } from 'formz'
import { onLoginSubmit } from './utils'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, touched, errors, invalid, type = 'text' }) => (
  <div className="form-group">
    <input
      className="form-control"
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

const emailValidators = {
  email: ({ value }) => !value || (value && /^[a-z0-9][a-z0-9\-.]+@[a-z0-9\-.]+\.[a-z]+/i.test(value))
}

const LoginForm = ({ Field, invalid, submitting, submitted, submitSuccess }) => (
  <div className="col-xs-12 col-md-6 col-lg-3">
    <Field
      render={Input}
      name="email"
      label="Email"
      validators={emailValidators}
      required
    />
    <Field
      render={Input}
      name="password"
      type="password"
      label="Password"
    />
    <div>
      <button className="btn btn-light" type="reset" disabled={submitting}>Reset</button>
      <button className="btn btn-primary" type="submit" disabled={submitting || invalid}>Login</button>
    </div>
    {
      <p>
        {submitted && !submitting && `Login ${submitSuccess ? 'OK' : 'FAIL'}`}
        {submitted && submitting && 'Logging in...'}
      </p>
    }
  </div>
)

export const BasicExampleWithValidation = () => <Formz render={LoginForm} onSubmit={onLoginSubmit}/>
