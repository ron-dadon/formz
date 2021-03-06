---
layout: example
example_script: parse-format.js
title: Parse / Format example
description: A simple form with date range that parses the date to UNIX timestamp and formats it to YYYY-MM-DD format. The submit will succeed only if the from date is earlier than the to date.
---

```jsx
import React, { Component } from 'react'
import { Formz } from 'formz'

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

class DateForm extends Component {
  parseDate = [({ value }) => (new Date(value)).getTime()]

  formatDate = [({ value }) => {
    const dateValue = new Date(value)
    const pad = v => `${v}`.length < 2 ? `0${v}` : `${v}`
    const [year, month, day] = [dateValue.getFullYear(), pad(dateValue.getMonth() + 1), pad(dateValue.getDate())]
    return `${year}-${month}-${day}`
  }]

  render() {
    // The Field prop is the unique form field component bound to the wrapping form
    const { Field, submitting, submitted, submitSuccess } = this.props
    return (
      <div>
        <Field
          render={Input}
          name='fromDate'
          type='date'
          label='From Date'
          parsers={this.parseDate}
          formatters={this.formatDate}
        />
        <Field
          render={Input}
          name='toDate'
          type='date'
          label='To Date'
          parsers={this.parseDate}
          formatters={this.formatDate}
        />
        <div>
          <button type='reset' disabled={submitting}>Reset</button>
          <button type='submit' disabled={submitting}>Send Dates</button>
        </div>
        {
          <p>
            {submitted && !submitting && `Dates ${submitSuccess ? 'saved successfully' : 'saving failed'}`}
            {submitted && submitting && 'Saving...'}
          </p>
        }
      </div>
    )
  }
}

export class ParseFormatExample extends Component {
  onSubmit = values => new Promise((resolve, reject) => {
    // Simulate server call with timeout
    console.log('Submitted form with values', values)
    const result = values.fromDate > values.toDate ? resolve : reject
    setTimeout(result, 100)
  })

  render() {
    return <Formz render={DateForm} onSubmit={this.onSubmit} />
  }
}
```