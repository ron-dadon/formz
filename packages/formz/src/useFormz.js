import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormzContext } from './FormzContext.js'

export const defaultMetaState = {
  invalid: false,
  valid: true,
  validating: false,
  touched: false,
  untouched: true,
  pristine: true
}

const createDefaultFieldState = ({
   defaultValue,
   validate,
   validateOnBlur,
   validateOnChange,
   validateAll,
   fieldRef
 }) => ({
  ...defaultMetaState,
  defaultValue,
  validate,
  validateOnBlur,
  validateOnChange,
  validateAll,
  fieldRef
})

const defaultFormState = {
  values: {},
  fields: {},
  form: {
    ...defaultMetaState,
    errors: {},
    submitted: false,
    submitCount: 0,
    submitting: false,
    submitSuccess: false,
    submitError: false,
    submitEvent: null
  }
}

const isEmptyObject = (obj) => !Object.keys(obj).length

const setDeepValue = ({ obj, name, value }) => {
  const keys = name.split('.')
  if (keys.length === 1) return { ...obj, [name]: value }
  const result = { ...obj }
  let pointer = result
  keys.forEach(
    (key, i) => {
      const isLast = i === keys.length - 1
      if (isLast) {
        pointer[key] = value
        return
      }
      pointer[key] = { ...(pointer[key] || {}) }
      pointer = pointer[key]
    },
    { ...obj }
  )
  return result
}

const convertToDeepObject = (obj) =>
  Object.entries(obj).reduce(
    (result, [name, value]) =>
      setDeepValue({
        obj: result,
        name,
        value
      }),
    {}
  )

const createFormzProvider = () => {
  const FormzProvider = ({
                           onSubmit,
                           children,
                           formProps = {},
                           onSubmitSuccess,
                           onSubmitError,
                          focusFirstErrorField,
                         }) => {
    if (!onSubmit || typeof onSubmit !== 'function')
      throw new Error('`onSubmit` prop is required in Form')

    if (
      (formProps && typeof formProps !== 'function' && typeof formProps !== 'object') ||
      Array.isArray(formProps)
    )
      throw new Error('`formProps` prop can be an object or a function')

    const [state, setState] = useState(defaultFormState)
    const calledCallback = useRef(false)

    useEffect(() => {
      const {
        form: { submitting, submitted, submitSuccess, submitError, submitResult, submitEvent },
        fields,
      } = state
      if (submitting || !submitted || calledCallback.current) return
      if (submitSuccess) {
        calledCallback.current = true
        onSubmitSuccess && onSubmitSuccess(submitResult, submitEvent)
      }
      if (submitError) {
        calledCallback.current = true
        if (focusFirstErrorField) {
          const [,fieldToFocus] = Object.entries(fields).find(([,fieldState]) => fieldState.invalid && fieldState.fieldRef?.current && typeof fieldState.fieldRef.current.focus === 'function') || []
          if (fieldToFocus) fieldToFocus.fieldRef.current.focus()
        }
        onSubmitError && onSubmitError(submitError, submitEvent)
      }
      setState((current) => {
        const {
          form: { submitEvent, ...form }
        } = current
        return { ...current, form: { ...form, submitEvent: null } }
      })
    }, [state, onSubmitSuccess, onSubmitError])

    const mountField = useCallback(
      ({ name, defaultValue, validate, validateOnBlur, validateOnChange, validateAll, fieldRef }) => {
        setState((current) => ({
          ...current,
          fields: {
            ...current.fields,
            [name]: createDefaultFieldState({
              defaultValue,
              validate,
              validateOnBlur,
              validateOnChange,
              validateAll,
              fieldRef
            })
          },
          values: { ...current.values, [name]: defaultValue }
        }))
      },
      [setState]
    )

    const unmountField = useCallback(
      ({ name }) => {
        setState((current) => {
          const fields = { ...current.fields }
          const values = { ...current.values }
          const formErrors = { ...current.form.errors }
          delete fields[name]
          delete values[name]
          delete formErrors[name]
          const valid = isEmptyObject(formErrors)
          return {
            ...current,
            form: { ...current.form, valid, invalid: !valid, errors: formErrors },
            fields,
            values
          }
        })
      },
      [setState]
    )

    const setFieldValidation = useCallback(
      ({ name, validate, validateOnBlur, validateOnChange, validateAll }) => {
        setState((current) => {
          const currentField = current.fields[name]
          if (
            currentField.validate === validate &&
            currentField.validateOnChange === validateOnChange &&
            currentField.validateOnBlur === validateOnBlur &&
            currentField.validateAll === validateAll
          )
            return current

          const newField = {
            ...currentField,
            validate,
            validateOnBlur,
            validateAll,
            validateOnChange
          }
          const newFields = {
            ...current.fields,
            [name]: newField
          }
          const newFormErrors = { ...current.form.errors }
          const newForm = { ...current.form }
          if (!validate) {
            newField.valid = true
            newField.invalid = false
            newField.error = false
            newForm.valid = Object.values(newFields).every(({ valid }) => valid)
            newForm.invalid = !newForm.valid
            delete newFormErrors[name]
            newForm.errors = newFormErrors
          }
          return {
            ...current,
            form: newForm,
            fields: newFields
          }
        })
      },
      [setState]
    )

    const setFieldTouched = useCallback(
      ({ name }) => {
        setState((current) => {
          const value = current.values[name]
          const currentField = current.fields[name]
          const { touched, validateOnBlur, validateAll, validate } = currentField
          if (touched && (!validateOnBlur || !validate)) return current

          if (validate && validateOnBlur && !validateAll) {
            setValidating({ name })
            try {
              const validateResult = validate({ name, value, values: current.values })
              if (validateResult instanceof Promise) {
                validateResult
                  .then(() => clearFieldError({ name }))
                  .catch((error) => setFieldError({ name, error }))
              } else {
                clearFieldError({ name })
              }
            } catch (error) {
              setFieldError({ name, error })
            }
          }

          const newState = {
            ...current,
            form: { ...current.form, touched: true, untouched: false },
            fields: {
              ...current.fields,
              [name]: { ...currentField, touched: true, untouched: false }
            }
          }

          if (validate && validateOnBlur && validateAll) {
            validateAllFields(newState, typeof validateAll === 'function' ? validateAll : null)
          }

          return newState
        })
      },
      [setState]
    )

    const setFieldError = useCallback(
      ({ name, error: rawError }) => {
        setState((current) => {
          const error = (rawError instanceof Error && rawError?.message) || rawError
          const currentFields = {
            ...current.fields,
            [name]: {
              ...current.fields[name],
              error,
              valid: false,
              invalid: true,
              validating: false
            }
          }
          return {
            ...current,
            form: {
              ...current.form,
              valid: false,
              invalid: true,
              errors: {
                ...current.form.errors,
                [name]: error
              },
              validating: Object.values(currentFields).some(
                ({ validating, name: fieldName }) => fieldName !== name && validating
              )
            },
            fields: currentFields
          }
        })
      },
      [setState]
    )

    const clearFieldError = useCallback(
      ({ name }) => {
        setState((current) => {
          const formErrors = { ...current.form.errors }
          const currentFields = {
            ...current.fields,
            [name]: { ...current.fields[name], valid: true, invalid: false, validating: false }
          }
          delete currentFields[name].error
          delete formErrors[name]
          const valid = isEmptyObject(formErrors)
          const currentForm = {
            ...current.form,
            valid,
            invalid: !valid,
            errors: formErrors,
            validating: Object.values(currentFields).some(({ validating }) => validating)
          }
          return {
            ...current,
            form: currentForm,
            fields: currentFields
          }
        })
      },
      [setState]
    )

    const setFieldValue = useCallback(
      ({ name, value }) => {
        setState((current) => {
          const { validate, validateOnChange, validateAll } = current.fields[name]
          if (current.values[name] === value) return current

          if (validate && validateOnChange && !validateAll) {
            setValidating({ name })
            try {
              const validateResult = validate({ name, value, values: current.values })
              if (validateResult instanceof Promise) {
                validateResult
                  .then(() => clearFieldError({ name }))
                  .catch((error) => setFieldError({ name, error }))
              } else {
                clearFieldError({ name })
              }
            } catch (error) {
              setFieldError({ name, error })
            }
          }

          const newState = {
            ...current,
            values: { ...current.values, [name]: value },
            form: { ...current.form, pristine: false },
            fields: { ...current.fields, [name]: { ...current.fields[name], pristine: false } }
          }

          if (validate && validateOnChange && validateAll) {
            validateAllFields(newState, typeof validateAll === 'function' ? validateAll : null)
          }

          return newState
        })
      },
      [setState]
    )

    const setValidating = useCallback(
      ({ name }) => {
        setState((current) => {
          if (current.fields[name].validating) return current

          return {
            ...current,
            form: { ...current.form, validating: true },
            fields: { ...current.fields, [name]: { ...current.fields[name], validating: true } }
          }
        })
      },
      [setState]
    )

    const resetField = useCallback(
      ({ name }) => {
        setState((current) => {
          const field = current.fields[name]
          const fields = { ...current.fields, [name]: { ...field, pristine: true } }
          return {
            ...current,
            values: { ...current.values, [name]: field.defaultValue },
            form: {
              ...current.form,
              pristine: Object.values(fields).every(({ pristine }) => pristine)
            },
            fields: fields
          }
        })
      },
      [setState]
    )

    const reset = useCallback(
      (e) => {
        if (e?.preventDefault) e.preventDefault()

        setState((current) => {
          const fields = Object.entries(current.fields).reduce(
            (newFields, [name, { defaultValue }]) => ({
              ...newFields,
              [name]: createDefaultFieldState({ defaultValue })
            }),
            {}
          )
          const values = Object.entries(current.fields).reduce(
            (newValues, [name, { defaultValue }]) => ({
              ...newValues,
              [name]: defaultValue
            }),
            {}
          )
          return {
            ...defaultFormState,
            fields,
            values
          }
        })
      },
      [setState]
    )

    const validateAllFields = async (formState, validateAll) =>
      Promise.allSettled(
        Object.entries(formState.fields).map(async ([name, { validate }]) => {
          if (validateAll && !validateAll(name, formState.fields[name])) return null
          try {
            if (validate) {
              setValidating({ name })
              await validate({
                name,
                value: formState.values[name],
                values: formState.values
              })
            }
            clearFieldError({ name })
          } catch (error) {
            setFieldError({ name, error })
            throw { name, error }
          }
        })
      )

    const submit = async (e = {}, options = {}) => {
      const { ignoreErrors = false } = options
      if (e?.preventDefault) e.preventDefault()

      if (state.form.submitting) throw new Error('Cannot submit form more than once every time')
      setState((current) => ({
        ...current,
        form: {
          ...current.form,
          submitting: true,
          submitted: false,
          submitSuccess: false,
          submitError: false,
          submitResult: null,
          submitCount: current.form.submitCount + 1,
          submitEvent: e?.nativeEvent || null
        }
      }))
      calledCallback.current = false
      try {
        const submitValues = convertToDeepObject(state.values)
        const validationResults = await validateAllFields(state)
        const rejectedValidations = validationResults.filter(({ status }) => status === 'rejected')
        if (!ignoreErrors && rejectedValidations.length) {
          throw new Error('Validation error')
        }
        const validationErrors = ignoreErrors
          ? rejectedValidations.reduce(
            (all, { reason: { name, error } }) => ({
              ...all,
              [name]: error
            }),
            {}
          )
          : null
        const submitResult = await onSubmit({
          values: submitValues,
          event: e?.nativeEvent || null,
          validationErrors,
          options
        })
        setState((current) => ({
          ...current,
          form: { ...current.form, submitSuccess: true, submitResult }
        }))
      } catch (e) {
        setState((current) => ({
          ...current,
          form: { ...current.form, submitError: e }
        }))
      } finally {
        setState((current) => ({
          ...current,
          form: { ...current.form, submitting: false, submitted: true }
        }))
      }
    }

    const formState = useMemo(
      () => ({
        ...state,
        submitValues: convertToDeepObject(state.values),
        mountField,
        unmountField,
        setFieldTouched,
        setFieldValidation,
        setFieldError,
        setValidating,
        clearFieldError,
        setFieldValue,
        resetField,
        reset,
        validate: () => validateAllFields(state),
        submit
      }),
      [state]
    )

    return (
      <FormzContext.Provider value={formState}>
        <form
          {...(typeof formProps === 'function' ? formProps(state) : formProps)}
          onSubmit={submit}
          onReset={reset}
        >
          {children}
        </form>
      </FormzContext.Provider>
    )
  }

  return FormzProvider
}

export const useFormz = () => {
  const formComponentRef = useRef(createFormzProvider())

  return { Form: formComponentRef.current }
}
