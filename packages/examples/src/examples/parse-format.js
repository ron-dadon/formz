import React from 'react'
import { Formz } from 'formz'
import { onSubmit} from './utils'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, type = 'text' }) => (
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
  </div>
)

const parseDate = [({ value }) => (new Date(value)).getTime()]

const formatDate = [({ value }) => {
  if (!value) return ''
  const dateValue = new Date(value)
  const pad = v => `${v}`.length < 2 ? `0${v}` : `${v}`
  const [year, month, day] = [dateValue.getFullYear(), pad(dateValue.getMonth() + 1), pad(dateValue.getDate())]
  return `${year}-${month}-${day}`
}]

const DateForm = ({ Field, submitting, submitted, submitSuccess }) => (
  <div className="col-xs-12 col-md-6 col-lg-3">
    <Field
      render={Input}
      name="fromDate"
      type="date"
      label="From Date"
      parsers={parseDate}
      formatters={formatDate}
    />
    <Field
      render={Input}
      name="toDate"
      type="date"
      label="To Date"
      parsers={parseDate}
      formatters={formatDate}
    />
    <div>
      <button className="btn btn-light" type="reset" disabled={submitting}>Reset</button>
      <button className="btn btn-primary" type="submit" disabled={submitting}>Send Dates</button>
    </div>
    {
      <p>
        {submitted && !submitting && `Dates ${submitSuccess ? 'saved successfully' : 'saving failed'}`}
        {submitted && submitting && 'Saving...'}
      </p>
    }
  </div>
)

export const ParseFormatExample = () => <Formz render={DateForm} onSubmit={onSubmit}/>
