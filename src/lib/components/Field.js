import React, { Component } from 'react'
import cleanProps from '../propTypes/cleanProps'
import fieldPropTypes from '../propTypes/fieldPropTypes'
import fieldRenderPropTypes from '../propTypes/fieldRenderPropTypes'
import { isFunction, debounce } from '../utils'

const DEFAULT_DEBOUNCE_RATE = 100

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

    constructor (props) {
      super(props)
      const { debounce: debounceProp } = props
      if (debounceProp) this.setupDebouncedChange(debounceProp)
    }

    componentDidMount() {
      const {
        render, parsers, formatters, reInitialize, keepDirty, debounce: debounceProp, ...otherProps
      } = this.props
      registerField({ ...otherProps, parsers: forceFunctionsArray(parsers), formatters: forceFunctionsArray(formatters) })
    }

    componentDidUpdate(oldProps) {
      const {
        render, name, parsers, formatters, reInitialize, keepDirty, debounce: debounceProp,...otherProps
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
      if (debounceProp !== oldProps.debounce) {
        if (debounceProp)
          this.setupDebouncedChange(debounceProp)
        else
          this.clearDebouncedChange()
      }
    }

    componentWillUnmount() {
      if (this.props.debounce) this.clearDebouncedChange()
      unregisterField(this.props.name)
    }

    setupDebouncedChange = (debounceProp) => {
      const debounceRate = debounceProp === true ? DEFAULT_DEBOUNCE_RATE : (debounceProp > 0 ? debounceProp : DEFAULT_DEBOUNCE_RATE)
      this.debouncedOnChange = debounce(this.onChange, debounceRate)
    }

    clearDebouncedChange = () => {
      if (this.debouncedOnChange) {
        if (this.debouncedOnChange.cleanup) this.debouncedOnChange.cleanup()
        delete this.debouncedOnChange
      }
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
      const onChangeFn = this.debouncedOnChange || this.onChange
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
          onChange={onChangeFn}
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
