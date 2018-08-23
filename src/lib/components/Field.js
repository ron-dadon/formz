import React, { Component } from 'react'
import fieldPropTypes from '../propTypes/fieldPropTypes'

const forceFunctionsArray = val => (Array.isArray(val) ? val : ((typeof val === 'function' && [val]) || []))

const fieldComponentFactory = ({
  registerField, unregisterField, isRegistered, resetField, updateField, updateFieldValue, setFieldTouched, setFieldActive, getField, formValues, getFormState
}) => {
  class Field extends Component {
    static propTypes = fieldPropTypes

    static defaultProps = {
      validators: {},
      parsers: [],
      formatters: []
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
      const { name } = this.props
      updateFieldValue({ name, value })
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
      const {
        render: FieldRender, name, defaultValue, validators, parsers, formatters,
        validateOnChange, validateOnBlur, validateOnInit, reInitialize, keepDirty, ...props
      } = this.props
      const {
        formattedValue, value, active, valid, pristine, touched, errors, pending
      } = getField(this.props.name)
      const { submitting, submitted, submitSuccess } = getFormState()
      return (
        <FieldRender
          {...props}
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
        />
      )
    }
  }

  return Field
}

export default fieldComponentFactory
