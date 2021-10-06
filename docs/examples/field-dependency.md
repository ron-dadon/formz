---
layout: example
example_script: fieldDependency
title: Field dependency
description: An example of implementing a field that is dependent on another field. In this example, size 'XXS' is only available for 'Female' and size 'XXXL' is only available for 'Male'.
---

```jsx
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Formz, fieldRenderPropTypes } from 'formz'

const genderOptions = [
  {
    label: 'Male',
    value: 'male'
  },
  {
    label: 'Female',
    value: 'female'
  }
]

const sizeOptions = [
  {
    label: 'XXS',
    value: 'xxs',
    availableFor: ['female']
  },
  {
    label: 'XS',
    value: 'xs'
  },
  {
    label: 'S',
    value: 's'
  },
  {
    label: 'M',
    value: 'm'
  },
  {
    label: 'L',
    value: 'l'
  },
  {
    label: 'XL',
    value: 'xl'
  },
  {
    label: 'XXL',
    value: 'xxl',
  },
  {
    label: 'XXXL',
    value: 'xxxl',
    availableFor: ['male']
  }
]

class Select extends PureComponent {
  static propTypes = {
    ...fieldRenderPropTypes,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string,
      availableFor: PropTypes.arrayOf(PropTypes.string)
    })).isRequired,
    parent: PropTypes.string,
    emptyOption: PropTypes.bool
  }

  componentDidUpdate() {
    const { options, parent, value, formValues, onChange } = this.props
    if (!parent || !value) return
    const parentValue = formValues[parent]
    const availableOptions = options.filter(({ availableFor }) => !availableFor || availableFor.includes(parentValue))
    const valueInOptions = !!availableOptions.find(({ value: optionValue }) => value === optionValue)
    if (!valueInOptions) {
      onChange(null)
    }
  }

  onChange = e => this.props.onChange(e.target.value || null)

  isValidOption = (option) => {
    const { parent, formValues } = this.props
    if (!parent) return true
    const parentValue = formValues[parent]
    return !option.availableFor || option.availableFor.includes(parentValue)
  }

  render() {
    const { options, label, value, emptyOption } = this.props
    return (
      <div className="form-group">
        <label>{label}</label>
        <select className="form-control" onChange={this.onChange} value={value}>
          {emptyOption && <option value="">-</option>}
          {options.map(option => this.isValidOption(option) && (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    )
  }
}

const DependenciesForm = ({ Field, submitting, submitted, submitSuccess }) => (
  <div className="col-xs-12 col-md-6 col-lg-3">
    <Field
      render={Select}
      name="gender"
      label="Gender"
      options={genderOptions}
      defaultValue="male"
    />
    <Field
      render={Select}
      name="size"
      label="Shirt Size"
      options={sizeOptions}
      parent="gender"
      defaultValue="l"
      emptyOption
    />
    <div>
      <button className="btn btn-light" type="reset" disabled={submitting}>Reset</button>
      <button className="btn btn-primary" type="submit" disabled={submitting}>Send Order</button>
    </div>
    {
      <p>
        {submitted && !submitting && `Order ${submitSuccess ? 'saved successfully' : 'saving failed'}`}
        {submitted && submitting && 'Saving...'}
      </p>
    }
  </div>
)

const awaitTimeout = ms => new Promise(resolve => setTimeout(resolve, ms))

const onSubmit = async (values) => {
  // Simulate server call with timeout
  console.log('Submitted form with values', values)
  await awaitTimeout(100)
  return true
}

export const FieldDependencyExample = () => <Formz render={DependenciesForm} onSubmit={onSubmit} />
```
