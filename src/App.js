import React, { PureComponent } from 'react'
import Formz from './Formz'
import './index.css'

const FormGroup = ({ label, errors, showErrors, children }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
    {showErrors && <div className="invalid-feedback">{JSON.stringify(errors)}</div>}
  </div>
)

class Input extends PureComponent {
  render () {
    const { label, errors, valid, pristine, touched, value, onChange, onBlur, updateFieldValue, formValues, submitting, submitted, type = 'text' } = this.props
    return (
      <FormGroup
        showErrors={!valid && (submitted || !pristine || touched)}
        errors={errors}
        label={label}
      >
        <input
          className={`form-control ${!valid && (!pristine || touched) ? 'is-invalid' : ''}`}
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value)
            if (e.target.value === 'Rona' && formValues.age < 20) {
              updateFieldValue({ name: 'age', value: 20 })
            }
          }}
          onBlur={onBlur}
          type={type}
          disabled={submitting}
        />
      </FormGroup>
    )
  }
}

class Select extends PureComponent {
  render () {
    const { label, errors, valid, pristine, onBlur, touched, value, onChange, options, valueKey, submitting, submitted } = this.props
    return (
      <FormGroup
        showErrors={!valid && (submitted || !pristine || touched)}
        errors={errors}
        label={label}
      >
        <select
          className={`form-control ${!valid && (!pristine || touched) ? 'is-invalid' : ''}`}
          value={(valueKey ? value[valueKey] : value) || ''}
          onChange={(e) => {
           if (valueKey) {
             onChange(options.find(option => option.value[valueKey] === e.target.value).value)
           } else {
             onChange(e.target.value)
           }
          }}
          onBlur={onBlur}
          disabled={submitting}
        >
          {options.map(({ value, label }) => (<option key={valueKey ? value[valueKey] : value} value={valueKey ? value[valueKey] : value}>{label}</option>))}
        </select>
      </FormGroup>
    )
  }
}

const Checkbox = (props) => {
  const { label: labelValue, value, valid, onBlur, touched, submitting, submitted } = props
  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={value}
        onChange={(e) => props.onChange(e.target.checked)}
        onBlur={onBlur}
        disabled={submitting}
      />
      <label className={`form-check-label ${(touched || submitted) && !valid && 'text-danger'}`}>{labelValue}</label>
    </div>
  )
}

const genderOptions = [
  { value: '', label: 'Select...' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
]
const validateName = {
  capitalFirst: ({ value }) => /^[A-Z]/.test(value),
  minLength: ({ value }) => value.length >= 3,
  // exists: ({ value }) => new Promise(resolve => setTimeout(() => ['Gilad', 'Alex', 'gilad', 'alex'].includes(value) ? resolve(false) : resolve(true), Math.random() * 1000))
}
const parsers = [({ value }) => value.toUpperCase()]
const formatters = [({ value }) => value.toLowerCase()]

const matchPassword = {
  matchPassword: ({ value, allValues, props: { matchField } }) => {
    return value === allValues[matchField]
  }
}

const asyncNameValidation = {

}

class App extends PureComponent {
  state = {
    log: ['Formz log'],
    defaultValue: 18
  }

  renderForm = ({ Field, reset, submitting, errors, valid, invalid, pristine, touched, untouched, dirty, fields, pending, submitted, submitSuccess }) => {
    return (
      <div className="row">
        <div className="col-4">
          <div className="card">
            <div className="card-body">
              <div>
                <Field
                  component={Input}
                  name="password"
                  type="password"
                  label="Password"
                  validateOnBlur={false}
                  required
                  autoFocus
                />
              </div>
              <div>
                <Field
                  component={Input}
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  validators={matchPassword}
                  matchField="password"
                />
              </div>
              <div>
                <Field
                  component={Input}
                  name="name"
                  label="Name"
                  defaultValue="Ron"
                  validators={validateName}
                  asyncValidators={asyncNameValidation}
                />
              </div>
              <div>
                <Field
                  component={Input}
                  name="age"
                  defaultValue={this.state.defaultValue}
                  label="Age"
                  type="text"
                  reInitialize
                  keepDirty
                />
              </div>
              <div>
                <Field
                  component={Select}
                  name="gender"
                  defaultValue="MALE"
                  label="Gender"
                  options={genderOptions}
                  parsers={parsers}
                  formatters={formatters}
                />
              </div>
              <div>
                <Field component={Checkbox} name="israeli" defaultValue={false} label="Israeli" />
              </div>
              {touched &&
                <div className="mt-2">
                  {submitting && pending && <div className="alert alert-info">Validating form...</div>}
                  {submitting && !pending && <div className="alert alert-info">Submitting form...</div>}
                  {!submitting && invalid && <div className="alert alert-danger">Form has errors</div>}
                </div>
              }
            </div>
            <div className="card-footer d-flex flex-row-reverse justify-content-between">
              <div>
                <button className="btn btn-default mr-2" type="reset" disabled={submitting || pending}>Reset</button>
                <button className="btn btn-primary" type="submit" disabled={submitting || pending}>Send</button>
              </div>
              <div>
                <button className="btn btn-danger" type="button" onClick={this.resetLog}>Clear Log</button>
                <button className="btn btn-warning" type="button" onClick={this.changeAgeDefaultValue}>Change Age Default</button>
                <button className={`btn btn-info ${!this.state.autoReset ? 'active' : ''}`} type="button" onClick={this.autoReset(!this.state.autoReset)}>Auto reset {this.state.autoReset ? 'ON' : 'OFF'}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-8">
          <div>
            <h4>Form State</h4>
            <table className="table table-bordered table-sm">
              <thead>
              <tr>
                <th>Untouched</th>
                <th>Touched</th>
                <th>Pristine</th>
                <th>Dirty</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Errors</th>
                <th>Pending</th>
                <th>Submitting</th>
                <th>Submitted</th>
                <th>Submit Success</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td className={untouched ? 'bg-success' : undefined}>{untouched ? 'Yes' : 'No'}</td>
                <td className={touched ? 'bg-warning' : undefined}>{touched ? 'Yes' : 'No'}</td>
                <td className={pristine ? 'bg-success' : undefined}>{pristine ? 'Yes' : 'No'}</td>
                <td className={dirty ? 'bg-warning' : undefined}>{dirty ? 'Yes' : 'No'}</td>
                <td className={valid ? 'bg-success' : undefined}>{valid ? 'Yes' : 'No'}</td>
                <td className={invalid ? 'bg-danger' : undefined}>{invalid ? 'Yes' : 'No'}</td>
                <td className={invalid ? 'bg-danger' : undefined}>{Object.keys(errors).length ? JSON.stringify(errors) : 'No'}</td>
                <td className={pending ? 'bg-info' : undefined}>{pending ? 'Yes' : 'No'}</td>
                <td className={submitting ? 'bg-info' : undefined}>{submitting ? 'Yes' : 'No'}</td>
                <td className={submitted ? 'bg-success' : undefined}>{submitted ? 'Yes' : 'No'}</td>
                <td className={submitted ? (!submitSuccess ? 'bg-warning' : 'bg-success') : undefined}>{submitSuccess ? 'Yes' : 'No'}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4>Fields</h4>
            <table className="table table-bordered table-sm">
              <thead>
              <tr>
                <th>Name</th>
                <th>Active</th>
                <th>Untouched</th>
                <th>Touched</th>
                <th>Pristine</th>
                <th>Dirty</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Errors</th>
                <th>Pending</th>
                <th>Default Value</th>
                <th>Value</th>
              </tr>
              </thead>
              <tbody>
              {Object.keys(fields).map((field) => {
                const { touched, pristine, valid, active, errors, defaultValue, value, pending } = fields[field]
                const dirty = !pristine
                const invalid = !valid
                const untouched = !touched
                return (
                  <tr key={field}>
                    <td>{field}</td>
                    <td className={active ? 'bg-info' : undefined}>{active ? 'Yes' : 'No'}</td>
                    <td className={untouched ? 'bg-success' : undefined}>{untouched ? 'Yes' : 'No'}</td>
                    <td className={touched ? 'bg-warning' : undefined}>{touched ? 'Yes' : 'No'}</td>
                    <td className={pristine ? 'bg-success' : undefined}>{pristine ? 'Yes' : 'No'}</td>
                    <td className={dirty ? 'bg-warning' : undefined}>{dirty ? 'Yes' : 'No'}</td>
                    <td className={valid ? 'bg-success' : undefined}>{valid ? 'Yes' : 'No'}</td>
                    <td className={invalid ? 'bg-danger' : undefined}>{invalid ? 'Yes' : 'No'}</td>
                    <td className={!valid ? 'bg-danger' : undefined}>{JSON.stringify(errors)}</td>
                    <td className={pending ? 'bg-info' : undefined}>{pending ? 'Yes' : 'No'}</td>
                    <td>{defaultValue}</td>
                    <td>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (Number.isNaN(value) ? 'NaN' : (typeof value === 'object' ? JSON.stringify(value) : value))}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  submit = (values) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.ceil(Math.random() * 100) > 80) {
        reject(new Error('Failed to save'))
      } else {
        resolve(values)
      }
    }, Math.ceil(Math.random() * 1000))
  })

  log = entry => this.setState((state) => ({ ...state, log: [ ...state.log, entry]}), () => this.ref.scrollTop = this.ref.scrollHeight)

  onSubmitSuccess = (values) => {
    this.log(`On Submit Success with values ${JSON.stringify(values)}`)
  }

  onSubmitError = (error) => {
    this.log(`On Submit Error with error "${error instanceof Error ? error.message : JSON.stringify(error)}"`)
  }

  autoReset = (autoReset) => () => {
    this.setState((state) => ({ ...state, autoReset }))
    this.log(`Auto reset is ${autoReset}`)
  }

  onValidation = ({ errors, valid }) => {
    this.log(`On Validation - Valid: ${valid}, Errors: ${JSON.stringify(errors)}`)
  }

  onReset = (values) => {
    this.log(`Form reset - values: ${JSON.stringify(values)}`)
  }

  onValuesChange = ({ values, field }) => {
    this.log(`Form values changed by field ${field} - values: ${JSON.stringify(values)}`)
  }

  changeAgeDefaultValue = () => {
    const defaultValue = Math.ceil(Math.random() * 40)
    this.setState({ defaultValue }, () => this.log(`Age default value changed to ${defaultValue}`))
  }

  resetLog = () => {
    this.setState({ log: ['Formz log'] })
  }

  render () {
    return (
      <div className="container-fluid p-3">
        <h1>Formz</h1>
        <Formz
          render={this.renderForm}
          onSubmit={this.submit}
          onSubmitSuccess={this.onSubmitSuccess}
          onSubmitError={this.onSubmitError}
          onValidation={this.onValidation}
          onValuesChange={this.onValuesChange}
          onReset={this.onReset}
          autoReset={this.state.autoReset}
          validateOnInit={false}
          validateOnBlur={true}
          validateOnChange={false}
        />
        <div className="row mt-2">
          <div className="col">
            <div className="card p-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <pre ref={(ref) => this.ref = ref}>{this.state.log.join('\n')}</pre>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
