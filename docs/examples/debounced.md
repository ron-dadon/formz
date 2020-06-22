---
layout: example
example_script: debounced.js
title: Debounce example
description: A debounce example. Both inputs are debounced, Tax Ratio is debounced using the default value of 100ms, Amount is debounce using custom timeout of 1000ms.
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

class TaxForm extends Component {
  render() {
    // The Field prop is the unique form field component bound to the wrapping form
    const { Field, submitting, values } = this.props
    return (
      <div className='col-xs-12 col-md-6 col-lg-3'>
        <Field
          render={Input}
          name='ratio'
          type='number'
          label='Tax Ratio %'
          debounce
        />
        <Field
          render={Input}
          name='amount'
          type='number'
          label='Amount $'
          debounce={1000}
        />
        {
          <p>
            Total With Tax: {values.amount && values.ratio ? values.ratio + (values.amount / 100) * values.ratio : 0}$
          </p>
        }
      </div>
    )
  }
}

class BasicExample extends Component {
  render() {
    return <Formz render={TaxForm} onSubmit={this.onSubmit} />
  }
}
```
