import React from 'react'
import { Formz } from 'formz'
import { onLoginSubmitSync } from "./utils"

const Input = ({label, value, onChange, onFocus, onBlur, submitting, type = 'text'}) => (
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
  </div>
)

const LoginForm = ({Field, submitting, submitted, submitSuccess}) => (
  <div className='col-xs-12 col-md-6 col-lg-3'>
    <Field
      render={Input}
      name='email'
      label='Email'
    />
    <Field
      render={Input}
      name='password'
      type='password'
      label='Password'
    />
    <div>
      <button className='btn btn-light' type='reset' disabled={submitting}>Reset</button>
      <button className='btn btn-primary' type='submit' disabled={submitting}>Login</button>
    </div>
    {
      <p>
        {submitted && !submitting && `Login ${submitSuccess ? 'OK' : 'FAIL'}`}
        {submitted && submitting && 'Logging in...'}
      </p>
    }
  </div>
)

export const BasicExample = () => <Formz render={LoginForm} onSubmit={onLoginSubmitSync}/>
