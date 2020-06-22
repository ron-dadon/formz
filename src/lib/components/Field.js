import React, { Component } from 'react'
import cleanProps from '../propTypes/cleanProps'
import fieldPropTypes from '../propTypes/fieldPropTypes'
import fieldRenderPropTypes from '../propTypes/fieldRenderPropTypes'
import { isFunction } from '../utils'

const forceFunctionsArray = val => (Array.isArray(val) ? val : ((typeof val === 'function' && [val]) || []))

const fieldComponentFactory = ({
  registerField, unregisterField, isRegistered, resetField, updateField, updateFieldValue,
  setFieldTouched, setFieldActive, getField, formValues, getFormState, submit, reset
}) => {
  class Field extends Component {
    static propTypes = fieldPropTypes

    static defaultProps = {
      validators: {},
      parsers: [],
      formatters: [],
      defaultValue: ''
    }

    componentDidMount() {
      const {
        render, parsers, formatters, reInitialize, keepDirty, ...otherProps
      } = this.props
      registerField({ ...otherProps, parsers: forceFunctionsArray(parsers), formatters: forceFunctionsArray(formatters) })
    }

    componentDidUpdate(oldProps) {
      const {
        render, name, parsers, formatters, reInitialize, keepDirty, ...otherProps
      } = this.props
      if (this.propsChanged(oldProps)) {
        updateField({
          name,
          parsers: forceFunctionsArray(parsers),
          formatters: forceFunctionsArray(formatters),
          reInitialize,
          keepDirty,
          ...otherProps
        })
      }
    }

    componentWillUnmount() {
      unregisterField(this.props.name)
    }

    onChange = (value) => {
      const { name, synthetic } = this.props
      if (!synthetic) {
        updateFieldValue({ name, value })
        this.onValueChange(value)
        return
      }
      const fieldValue = value && value.target && value.target[typeof synthetic === 'string' ? synthetic : 'value']
      updateFieldValue({
        name,
        value: fieldValue
      })
      this.onValueChange(fieldValue)
    }

    onValueChange = (value) => {
      const { onValueChange } = this.props
      if (isFunction(onValueChange)) {
        onValueChange({ value, allValues: formValues(), updateFieldValue, submit, reset })
      }
    }

    onFocus = () => {
      const { name } = this.props
      setFieldActive({ name })
    }

    onBlur = () => {
      const { name } = this.props
      setFieldTouched({ name })
    }

    propsChanged = (oldProps) => {
      const newPropsKeys = Object.keys(oldProps)
      if (newPropsKeys.length !== Object.keys(this.props).length) return true
      return newPropsKeys.reduce((changed, key) => {
        const keyChanged = oldProps[key] !== this.props[key]
        return changed || keyChanged
      }, false)
    }

    reset = () => {
      resetField(this.props.name)
    }

    render() {
      if (!isRegistered(this.props.name)) return null
      const { render: FieldRender, name } = this.props
      const props = cleanProps(this.props, fieldPropTypes, fieldRenderPropTypes)
      // Set back the required prop if one is present to pass it into the rendered component
      if (this.props.required !== undefined) {
        props.required = this.props.required
      }
      const {
        formattedValue, value, active, valid, pristine, touched, errors, pending
      } = getField(this.props.name)
      const { submitting, submitted, submitSuccess } = getFormState()
      return (
        <FieldRender
          {...props}
          name={name}
          value={formattedValue}
          rawValue={value}
          errors={errors}
          valid={valid}
          invalid={!valid}
          touched={touched}
          untouched={!touched}
          pristine={pristine}
          dirty={!pristine}
          active={active}
          pending={pending}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          reset={this.reset}
          formValues={formValues()}
          updateFieldValue={updateFieldValue}
          submitting={submitting}
          submitted={submitted}
          submitSuccess={submitSuccess}
          submit={submit}
          resetForm={reset}
        />
      )
    }
  }

  return Field
}

export default fieldComponentFactory
