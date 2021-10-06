import React from 'react'
import { Formz } from 'formz'
import { onSubmit } from "./utils"

const Input = ({
   label,
   value,
   onChange,
   onFocus,
   onBlur,
   submitting,
   touched,
   errors,
   invalid,
   pending,
   type = 'text'
 }) => (
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
    {!submitting && touched && pending && <div>Checking...</div>}
    {!submitting && touched && invalid && errors.required && <div>This is required</div>}
    {!submitting && touched && invalid && errors.exists && <div>Already exists</div>}
    {!submitting && touched && invalid && errors.strength && <div>Password not strong enough</div>}
    {!submitting && touched && invalid && errors.match && <div>Password does not match</div>}
  </div>
)

const validators = {
  exists: ({ value }) => new Promise((resolve) => setTimeout(() => value === 'john' ? resolve(false) : resolve(true), 1000))
}

const passwordValidators = {
  strength: ({ value }) => value.length >= 5
}

const passwordConfirmValidators = {
  match: ({ value, allValues, props: { match } }) => value === allValues[match]
}

const RegistrationForm = ({ Field, invalid, submitting, submitted, submitSuccess }) => (
  <div className="col-xs-12 col-md-6 col-lg-3">
    <Field
      render={Input}
      name="username"
      label="Username"
      validators={validators}
      required
    />
    <Field
      render={Input}
      name="password"
      type="password"
      label="Password"
      validators={passwordValidators}
      required
    />
    <Field
      render={Input}
      name="passwordConfirm"
      type="password"
      label="Confirm Password"
      validators={passwordConfirmValidators}
      match="password"
      reValidateOnFormChanges="password"
      required
    />
    <div>
      <button className="btn btn-light" type="reset" disabled={submitting}>Reset</button>
      <button className="btn btn-primary" type="submit" disabled={submitting || invalid}>Register</button>
    </div>
    {
      <p>
        {submitted && !submitting && `Registration ${submitSuccess ? 'completed' : 'failed'}`}
        {submitted && submitting && 'Registering...'}
      </p>
    }
  </div>
)

export const BasicExampleWithAsyncValidation = () => <Formz render={RegistrationForm} onSubmit={onSubmit}/>
