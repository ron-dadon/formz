import React, { Component } from 'react'
import cleanProps from '../propTypes/cleanProps'
import formzPropTypes from '../propTypes/formzPropTypes'
import formzRenderPropTypes from '../propTypes/formzRenderPropTypes'
import fieldComponentFactory from './Field'

// Use simple memorize method instead of pulling reselect / lodash into the project
const memorizeValues = (calcValue) => {
  const cache = { lastValue: null, result: null }
  return ({ fields }) => {
    if (cache.lastValue === fields) return cache.result
    cache.lastValue = fields
    cache.result = calcValue({ fields })
    return cache.result
  }
}

const required = ({ value }) => {
  if (typeof value === 'string') return value !== ''
  if (Array.isArray(value)) return !!value.length
  if (typeof value === 'object' && value) return !!Object.keys(value).length
  return value !== null && value !== undefined
}

const getFormValues = memorizeValues(({ fields }) => Object.keys(fields).reduce((values, fieldName) => ({
  ...values, [fieldName]: fields[fieldName].value
}), {}))

const getFormErrors = fields => Object.keys(fields).reduce((values, fieldName) => ({
  ...values,
  [fieldName]: Object.keys(fields[fieldName].errors).length ? fields[fieldName].errors : undefined
}), {})

const getFormIsValid = errors => Object.keys(errors).reduce(
  (isValid, fieldName) => isValid && (!errors[fieldName] || !Object.keys(errors[fieldName]).length),
  true
)

const getFormPristine = fields => Object.keys(fields).reduce((isPristine, fieldName) => isPristine && fields[fieldName].pristine, true)

const getFormTouched = fields => Object.keys(fields).reduce((isTouched, fieldName) => isTouched || fields[fieldName].touched, false)

const isFieldValid = ({ errors }) => !Object.keys(errors).length

const calculateFieldErrors = ({
  validators, value, allValues, props
}) => {
  if (!validators) return {}
  return Object.keys(validators).reduce((errors, validatorKey) => {
    const validatorResult = validators[validatorKey]({ value, allValues, props })
    if (validatorResult === true) return errors
    if (typeof validatorResult === 'string') return { ...errors, [validatorKey]: validatorResult }
    if (validatorResult instanceof Promise) return { ...errors, [validatorKey]: validatorResult }
    return { ...errors, [validatorKey]: true }
  }, {})
}

const executeModifiersPipeline = ({
  modifiers, value, allValues, props
}) => modifiers.reduce((finalValue, modifier) => modifier({
  value: finalValue,
  allValues,
  props
}), value)

const extractAsyncErrors = obj => Object.keys(obj).reduce((promises, objKey) => (obj[objKey] instanceof Promise ? {
  ...promises,
  [objKey]: obj[objKey]
} : promises), {})

const extractSyncErrors = obj => Object.keys(obj).reduce((errors, objKey) => (obj[objKey] instanceof Promise ? errors : {
  ...errors,
  [objKey]: obj[objKey]
}), {})

class Formz extends Component {
  static propTypes = formzPropTypes

  static defaultProps = {
    validateOnInit: false,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
    formNoValidate: true,
    formNative: true
  }

  constructor(props) {
    super(props)
    this.Field = fieldComponentFactory({
      registerField: this.registerField,
      unregisterField: this.unregisterField,
      isRegistered: this.isRegistered,
      resetField: this.resetField,
      updateField: this.updateField,
      updateFieldValue: this.updateFieldValue,
      setFieldActive: this.setFieldActive,
      setFieldTouched: this.setFieldTouched,
      getField: this.getField,
      getFormState: this.getFormState,
      formValues: this.formValues
    })
    this.state = {
      fields: {},
      errors: {},
      valid: true,
      pristine: true,
      touched: false,
      pending: false,
      submitting: false,
      submitted: false,
      submitSuccess: false
    }
  }

  onValuesChange = (field) => {
    if (typeof this.props.onValuesChange === 'function') {
      const values = this.formValues()
      this.props.onValuesChange({ values, field, updateFieldValue: this.updateFieldValue })
    }
  }

  onSubmit = () => {
    const { valid, errors } = this.state
    if (!valid) {
      this.finishSubmit(false)(errors)
      return
    }
    const formValues = getFormValues(this.state)
    this.doSubmit(formValues)
  }

  getFormState = () => {
    const { submitting, submitted, submitSuccess } = this.state
    return { submitting, submitted, submitSuccess }
  }

  getField = fieldName => this.state.fields[fieldName]

  setFieldTouched = ({ name }) => {
    const { validateOnBlur } = this.props
    const { validateOnBlur: fieldValidateOnBlur } = this.state.fields[name]
    this.setState((state) => {
      const field = state.fields[name]
      if (!field) return state
      const fields = {
        ...state.fields,
        [name]: {
          ...field,
          touched: true,
          active: false
        }
      }
      const formTouched = getFormTouched(fields)
      return {
        ...state,
        fields,
        touched: formTouched
      }
    })
    if (fieldValidateOnBlur || (fieldValidateOnBlur === undefined && validateOnBlur)) {
      this.validateAllFields(name)
    }
  }

  setFieldNotPending = (name) => {
    this.setState((state) => {
      const fields = { ...state.fields }
      fields[name] = { ...fields[name], pending: false }
      return {
        ...state,
        fields
      }
    })
  }

  setFieldActive = ({ name }) => {
    this.setState((state) => {
      const field = state.fields[name]
      if (!field) return state
      return {
        ...state,
        fields: {
          ...state.fields,
          [name]: {
            ...field,
            active: true
          }
        }
      }
    })
  }

  createNewField = ({
    defaultValue = '', validators = {}, formatters = [], parsers = [],
    validateOnChange, validateOnBlur, validateOnInit, reValidateOnFormChanges, props = {}
  }) => {
    const allValues = getFormValues(this.state)
    const errors = {}
    const valid = true
    const parsedValue = executeModifiersPipeline({
      modifiers: parsers, value: defaultValue, allValues, props
    })
    const formattedValue = executeModifiersPipeline({
      modifiers: formatters, value: parsedValue, allValues, props
    })
    const fieldValidators = props.required && !validators.required ? { ...validators, required } : validators
    return {
      errors,
      valid,
      pending: false,
      active: false,
      pristine: true,
      touched: false,
      defaultValue,
      value: parsedValue,
      formattedValue,
      validators: fieldValidators,
      parsers,
      formatters,
      props,
      validateOnChange,
      validateOnBlur,
      validateOnInit,
      reValidateOnFormChanges
    }
  }

  updateFieldValue = ({ name, value }) => {
    const { validateOnChange } = this.props
    const { validateOnChange: fieldValidateOnChange } = this.state.fields[name]
    this.setState((state) => {
      const field = state.fields[name]
      if (!field) return state
      const { parsers, formatters, props } = field
      const allValues = getFormValues(this.state)
      const parsedValue = executeModifiersPipeline({
        modifiers: parsers, value, allValues, props
      })
      const formattedValue = executeModifiersPipeline({
        modifiers: formatters, value: parsedValue, allValues, props
      })
      const fields = {
        ...state.fields,
        [name]: {
          ...field,
          pristine: false,
          value: parsedValue,
          formattedValue
        }
      }
      const formPristine = getFormPristine(fields)
      return {
        ...state,
        fields,
        pristine: formPristine
      }
    }, () => this.onValuesChange(name))
    if (fieldValidateOnChange || (fieldValidateOnChange === undefined && validateOnChange)) {
      this.validateAllFields(name)
    }
  }

  updateField = ({
    name, reInitialize, keepDirty, ...fieldProps
  }) => {
    this.setState((state) => {
      const field = state.fields[name]
      if (!field) return state
      const allValues = getFormValues(this.state)
      const {
        formatters, defaultValue: newDefaultValue, validators, parsers,
        validateOnChange, validateOnBlur, validateOnInit, reValidateOnFormChanges, ...props
      } = fieldProps
      const { value, defaultValue, pristine } = field
      const newValue = reInitialize && ((keepDirty && pristine) || !keepDirty) && defaultValue !== newDefaultValue ? newDefaultValue : value
      const formattedValue = executeModifiersPipeline({
        modifiers: formatters, value: newValue, allValues, props
      })
      let fieldValidators = props && validators && props.required && !validators.required ? { ...validators, required } : validators
      if (props && fieldValidators && !props.required && fieldValidators.required === required) {
        const { required: requiredFn, ...otherValidators } = validators
        fieldValidators = otherValidators
      }
      const fields = {
        ...state.fields,
        [name]: {
          ...field,
          ...fieldProps,
          parsers,
          validateOnChange,
          validateOnBlur,
          validateOnInit,
          reValidateOnFormChanges,
          validators: fieldValidators,
          value: newValue,
          formattedValue
        }
      }
      return {
        ...state,
        fields
      }
    })
    this.validateAllFields(name)
  }

  registerField = ({
    name, defaultValue = '', validateOnChange, validateOnBlur, validateOnInit,
    reValidateOnFormChanges, validators = {}, formatters = [], parsers = [], ...props
  }) => {
    const { validateOnInit: formValidateOnInit } = this.props
    this.setState(state => ({
      ...state,
      fields: {
        ...state.fields,
        [name]: this.createNewField({
          name,
          defaultValue,
          validators,
          formatters,
          parsers,
          props,
          validateOnChange,
          validateOnBlur,
          validateOnInit,
          reValidateOnFormChanges
        })
      }
    }))
    if (validateOnInit || (validateOnInit === undefined && formValidateOnInit)) {
      this.validateAllFields(name)
    }
  }

  unregisterField = (fieldName) => {
    this.setState((state) => {
      const fields = { ...state.fields }
      delete fields[fieldName]
      return { ...state, fields }
    })
    this.validateAllFields(fieldName)
  }

  resetField = (fieldName) => {
    this.setState(state => ({
      ...state,
      fields: { ...state.fields, [fieldName]: this.createNewField({ defaultValue: state.fields[fieldName].defaultValue }) }
    }))
    this.validateAllFields(fieldName)
  }

  validateAllFields = (changedField) => new Promise((resolve) => {
    const asyncValidations = []
    const asyncValidationsFields = []
    this.setState((state) => {
      const fields = { ...state.fields }
      const allValues = getFormValues({ fields })
      Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName]
        const isNotChangedField = changedField && fieldName !== changedField
        const hasReValidateProp = !!field.reValidateOnFormChanges
        if (isNotChangedField) {
          const isNotTheRevalidateField = (typeof field.reValidateOnFormChanges === 'string' && changedField !== field.reValidateOnFormChanges)
            || (Array.isArray(field.reValidateOnFormChanges) && !field.reValidateOnFormChanges.includes(changedField))
          if (!hasReValidateProp || isNotTheRevalidateField) return
        }
        const { value, validators, props } = field
        const errors = calculateFieldErrors({
          value, validators, props, allValues
        })
        const pendingPromises = extractAsyncErrors(errors)
        const syncErrors = extractSyncErrors(errors)
        const pendingValidators = Object.keys(pendingPromises)
        const pending = !!pendingValidators.length
        if (pending) {
          const fieldPromises = Promise.all(pendingValidators.map(pendingValidator => pendingPromises[pendingValidator])).then((asyncErrors) => {
            this.setFieldNotPending(fieldName)
            return pendingValidators.reduce((resolveErrors, pendingValidator) => {
              const error = asyncErrors[pendingValidators.indexOf(pendingValidator)]
              if (error === true) return resolveErrors
              if (typeof error === 'string') return { ...resolveErrors, [pendingValidator]: error }
              return { ...resolveErrors, [pendingValidator]: true }
            }, {})
          })
          asyncValidations.push(fieldPromises)
          asyncValidationsFields.push(fieldName)
        }
        if (pending) {
          const valid = isFieldValid({ errors: syncErrors })
          fields[fieldName] = {
            ...field, errors: syncErrors, valid, pending
          }
        } else {
          const valid = isFieldValid({ errors })
          fields[fieldName] = {
            ...field, errors, valid, pending
          }
        }
      })
      const formErrors = getFormErrors(fields)
      const formValid = getFormIsValid(formErrors)
      return {
        ...state,
        fields,
        valid: formValid,
        errors: formErrors,
        pending: !!asyncValidations.length
      }
    }, () => {
      if (asyncValidations.length) {
        Promise.all(asyncValidations).then((asyncValidationsErrors) => {
          this.setState((state) => {
            const fields = { ...state.fields }
            asyncValidationsErrors.forEach((errors, index) => {
              const fieldName = asyncValidationsFields[index]
              const field = fields[fieldName]
              const fieldErrors = { ...field.errors, ...errors }
              const valid = isFieldValid({ errors: fieldErrors })
              fields[fieldName] = { ...field, errors: fieldErrors, valid }
            })
            const formErrors = getFormErrors(fields)
            const formValid = getFormIsValid(formErrors)
            return {
              ...state,
              fields,
              valid: formValid,
              errors: formErrors,
              pending: false
            }
          }, () => {
            this.callOnValidation()
            resolve()
          })
        })
      } else {
        this.callOnValidation()
        resolve()
      }
    })
  })

  callOnValidation = () => {
    if (typeof this.props.onValidation === 'function') {
      const { errors, valid } = this.state
      this.props.onValidation({ errors, valid })
    }
  }

  callOnReset = () => {
    if (typeof this.props.onReset === 'function') {
      this.props.onReset(this.formValues())
    }
  }

  resetForm = (e) => {
    if (e) e.preventDefault()
    this.setState((state) => {
      const fields = { ...state.fields }
      Object.keys(fields).forEach((field) => {
        fields[field] = this.createNewField({ name: field, ...fields[field] })
      })
      return {
        ...state,
        fields: { ...fields },
        errors: {},
        valid: true,
        touched: false,
        pristine: true,
        submitSuccess: false,
        submitted: false
      }
    }, this.callOnReset)
  }

  isRegistered = fieldName => !!this.state.fields[fieldName]

  formValues = () => getFormValues(this.state)

  finishSubmit = submitSuccess => (args) => {
    const { onSubmitSuccess, onSubmitError } = this.props
    if (submitSuccess && typeof onSubmitSuccess === 'function') {
      onSubmitSuccess(args)
    }
    if (!submitSuccess && typeof onSubmitError === 'function') {
      onSubmitError(args)
    }
    this.setState(state => ({
      ...state, submitting: false, submitted: true, submitSuccess
    }))
    if (submitSuccess && this.props.autoReset) {
      this.resetForm()
    }
  }

  doSubmit = (formValues) => {
    const { onSubmit } = this.props
    const submitPromise = onSubmit(formValues)
    if (submitPromise instanceof Promise) {
      submitPromise
        .then(this.finishSubmit(true))
        .catch(this.finishSubmit(false))
    } else {
      const submitResult = !!submitPromise
      this.finishSubmit(submitResult)(submitResult ? formValues : false)
    }
  }

  startSubmit = (e) => {
    const { validateOnSubmit, formNative, formAction } = this.props
    if (formNative && formAction) return true
    if (e) e.preventDefault()
    this.setState({ submitting: true, touched: true }, () => {
      if (validateOnSubmit) {
        this.validateAllFields().then(this.onSubmit)
        return
      }
      this.onSubmit()
    })
    return false
  }

  render() {
    const { render: RenderComponent, formNative, formNoValidate, formAction, formMethod, formEnctype, formTarget, formProps } = this.props
    const props = cleanProps(this.props, formzPropTypes, formzRenderPropTypes)
    const {
      errors, valid, pristine, touched, pending,
      submitting, submitted, submitSuccess, fields
    } = this.state
    const renderedComponent = (
      <RenderComponent
        {...props}
        Field={this.Field}
        reset={this.resetForm}
        submit={this.startSubmit}
        errors={errors}
        valid={valid}
        invalid={!valid}
        pristine={pristine}
        dirty={!pristine}
        touched={touched}
        untouched={!touched}
        pending={pending}
        submitting={submitting}
        submitted={submitted}
        submitSuccess={submitSuccess}
        values={getFormValues({ fields })}
      />
    )
    if (!formNative) {
      return renderedComponent
    }
    return (
      <form
        onSubmit={this.startSubmit}
        onReset={this.resetForm}
        noValidate={formNoValidate}
        action={formAction}
        method={formMethod}
        target={formTarget}
        encType={formEnctype}
        {...formProps}
      >
        {renderedComponent}
      </form>
    )
  }
}

export default Formz
