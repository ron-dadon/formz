import React, { Component } from 'react'
import cleanProps from '../propTypes/cleanProps'
import formzPropTypes from '../propTypes/formzPropTypes'
import formzRenderPropTypes from '../propTypes/formzRenderPropTypes'
import {
  isFunction, required, getFormValues, getFormErrors, getFormIsValid,
  getFormPristine, getFormTouched, isFieldValid, calculateFieldErrors,
  executeModifiersPipeline, extractAsyncErrors, extractSyncErrors, shallowEqualObjects
} from '../utils'
import fieldComponentFactory from './Field'

class Formz extends Component {
  static propTypes = formzPropTypes

  static defaultProps = {
    validateOnInit: false,
    validateOnChange: true,
    validateOnPropsChange: true,
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
      formValues: this.formValues,
      submit: this.startSubmit,
      reset: this.resetForm
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

  componentWillUnmount () {
    this.isUnmounted = true
  }

  setMountedState (state, callback) {
    if (!this.isUnmounted) this.setState(state, callback)
  }

  onValuesChange = ({ field, value }) => {
    const fieldProps = this.state.fields[field] && this.state.fields[field].props
    const values = this.formValues()
    if (fieldProps && isFunction(fieldProps.onValueChange)) {
      fieldProps.onValueChange({
        value,
        allValues: values,
        updateFieldValue: this.updateFieldValue,
        submit: this.startSubmit,
        reset: this.resetForm
      })
    }
    if (isFunction(this.props.onValuesChange)) {
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
    const { submitting, submitted, submitSuccess, valid: formValid, pristine: formPristine,
      touched: formTouched, pending: formPending, errors: formErrors
    } = this.state
    return { submitting, submitted, submitSuccess, formValid, formPristine, formTouched, formPending, formErrors }
  }

  getField = fieldName => this.state.fields[fieldName]

  setFieldTouched = ({ name }) => {
    const { validateOnBlur } = this.props
    const { validateOnBlur: fieldValidateOnBlur } = this.state.fields[name]
    this.setMountedState((state) => {
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
    this.setMountedState((state) => {
      const fields = { ...state.fields }
      fields[name] = { ...fields[name], pending: false }
      return {
        ...state,
        fields
      }
    })
  }

  setFieldActive = ({ name }) => {
    this.setMountedState((state) => {
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
    defaultValue = '', validators = {}, formatters = [], parsers = [], validateOnChange,
    validateOnPropsChange, validateOnBlur, validateOnInit, reValidateOnFormChanges, props = {}
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
      validateOnPropsChange,
      validateOnBlur,
      validateOnInit,
      reValidateOnFormChanges
    }
  }

  updateFieldValue = ({ name, value }) => {
    const { validateOnChange } = this.props
    const { validateOnChange: fieldValidateOnChange } = this.state.fields[name]
    this.setMountedState((state) => {
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
    }, () => {
      this.onValuesChange({ field: name, value })
      if (fieldValidateOnChange || (fieldValidateOnChange === undefined && validateOnChange)) {
        this.validateAllFields(name)
      }
    })
  }

  updateField = ({
    name, reInitialize, keepDirty, ...fieldProps
  }) => {
    let shouldValidate = false
    const { validateOnPropsChange: formValidateOnPropsChange, onFieldUpdated } = this.props
    this.setMountedState((state) => {
      const field = state.fields[name]
      if (!field) return state
      const allValues = getFormValues(state)
      const {
        formatters, defaultValue: newDefaultValue, validators, parsers,
        validateOnChange, validateOnPropsChange, validateOnBlur, validateOnInit, reValidateOnFormChanges, ...props
      } = fieldProps
      const { value, defaultValue, pristine, props: oldProps } = field
      const newValue = reInitialize && ((keepDirty && pristine) || !keepDirty) && defaultValue !== newDefaultValue ? newDefaultValue : value
      const formattedValue = executeModifiersPipeline({
        modifiers: formatters, value: newValue, allValues, props
      })
      let fieldValidators = props && validators && props.required && !validators.required ? { ...validators, required } : validators
      if (props && fieldValidators && !props.required && fieldValidators.required === required) {
        const { required: requiredFn, ...otherValidators } = validators
        fieldValidators = otherValidators
      }
      shouldValidate = (formValidateOnPropsChange || validateOnPropsChange) && !shallowEqualObjects(props, oldProps)
      const fields = {
        ...state.fields,
        [name]: {
          ...field,
          parsers,
          validateOnChange,
          validateOnBlur,
          validateOnInit,
          reValidateOnFormChanges,
          validators: fieldValidators,
          value: newValue,
          formattedValue,
          defaultValue: newDefaultValue,
          props
        }
      }
      return {
        ...state,
        fields
      }
    }, () => {
      if (isFunction(onFieldUpdated)) {
        onFieldUpdated({ name })
      }
      shouldValidate && this.validateAllFields(name)
    })
  }

  registerField = ({
    name, defaultValue = '', validateOnChange, validateOnPropsChange, validateOnBlur, validateOnInit,
    reValidateOnFormChanges, validators = {}, formatters = [], parsers = [], ...props
  }) => {
    const { validateOnInit: formValidateOnInit, onFieldAdded } = this.props
    this.setMountedState(state => ({
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
          validateOnPropsChange,
          validateOnBlur,
          validateOnInit,
          reValidateOnFormChanges
        })
      }
    }), () => {
      if (isFunction(onFieldAdded)) {
        onFieldAdded({ name })
      }
      if (validateOnInit || (validateOnInit === undefined && formValidateOnInit)) {
        this.validateAllFields(name)
      }
    })
  }

  unregisterField = (name) => {
    const { onFieldRemoved } = this.props
    this.setMountedState((state) => {
      const fields = { ...state.fields }
      delete fields[name]
      return { ...state, fields }
    }, () => {
      if (isFunction(onFieldRemoved)) {
        onFieldRemoved({ name })
      }
      this.validateAllFields(name)
    })
  }

  resetField = (name) => {
    this.setMountedState(state => {
        const currentField = state.fields[name]
        const allValues = getFormValues(state)
        const parsedValue = executeModifiersPipeline({
          modifiers: currentField.parsers,
          value: currentField.defaultValue,
          props: currentField.props,
          allValues
        })
        const formattedValue = executeModifiersPipeline({
          modifiers: currentField.formatters,
          value: parsedValue,
          props: currentField.props,
          allValues
        })
        const fieldValidators = currentField.props.required && !currentField.validators.required
          ? { ...currentField.validators, required }
          : currentField.validators
        return {
        ...state,
        fields: {
          ...state.fields,
          [name]: {
            ...state.fields[name],
            pending: false,
            active: false,
            pristine: true,
            touched: false,
            valid: true,
            value: parsedValue,
            formattedValue,
            validators: fieldValidators,
            errors: {}
          }
        }
      }
    },
      () => this.validateAllFields(name)
    )
  }

  validateAllFields = (changedField) => new Promise((resolve) => {
    const asyncValidations = []
    const asyncValidationsFields = []
    this.setMountedState((state) => {
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
          this.setMountedState((state) => {
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
            this.callOnValidation(changedField)
            resolve()
          })
        })
      } else {
        this.callOnValidation(changedField)
        resolve()
      }
    })
  })

  callOnValidation = (trigger) => {
    if (!this.isUnmounted && isFunction(this.props.onValidation)) {
      const { errors, valid } = this.state
      this.props.onValidation({ errors, valid, trigger })
    }
  }

  callOnReset = () => {
    if (!this.isUnmounted && isFunction(this.props.onReset)) {
      this.props.onReset(this.formValues())
    }
  }

  resetForm = (e) => {
    if (e) e.preventDefault()
    this.setMountedState((state) => {
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
    if (submitSuccess && isFunction(onSubmitSuccess)) {
      onSubmitSuccess(args)
    }
    if (!submitSuccess && isFunction(onSubmitError)) {
      onSubmitError(args)
    }
    this.setMountedState(state => ({
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
    this.setMountedState({ submitting: true, touched: true }, () => {
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
