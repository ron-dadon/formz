import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormzContext } from './FormzContext.js'

export const defaultMetaState = {
  invalid: false,
  valid: true,
  validating: false,
  touched: false,
  untouched: true,
  pristine: true,
}

const createDefaultFieldState = ({
  defaultValue,
  validate,
  validateOnBlur,
  validateOnChange,
  validateAll,
  fieldRef,
}) => ({
  ...defaultMetaState,
  defaultValue,
  validate,
  validateOnBlur,
  validateOnChange,
  validateAll,
  fieldRef,
})

const defaultFormState = {
  ...defaultMetaState,
  errors: {},
  submitted: false,
  submitCount: 0,
  submitting: false,
  submitSuccess: false,
  submitError: false,
  submitEvent: null,
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
        value,
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

    const [state, setState] = useState({
      form: defaultFormState,
      values: {},
      fields: {},
    })

    const calledCallback = useRef(false)

    useEffect(() => {
      const { submitting, submitted, submitSuccess, submitError, submitResult, submitEvent } =
        state.form
      if (submitting || !submitted || calledCallback.current) return
      if (submitSuccess) {
        calledCallback.current = true
        onSubmitSuccess && onSubmitSuccess(submitResult, submitEvent)
      }
      if (submitError) {
        calledCallback.current = true
        if (focusFirstErrorField) {
          const [, fieldToFocus] =
            Object.entries(state.fields).find(
              ([, fieldState]) =>
                fieldState.invalid &&
                fieldState.fieldRef?.current &&
                typeof fieldState.fieldRef.current.focus === 'function'
            ) || []
          if (fieldToFocus) fieldToFocus.fieldRef.current.focus()
        }
        onSubmitError && onSubmitError(submitError, submitEvent)
      }
      setState((current) => {
        return { ...current, form: { ...current.form, submitEvent: null } }
      })
    }, [onSubmitSuccess, onSubmitError, focusFirstErrorField, state.fields, state.form])

    const mountField = useCallback(
      ({
        name,
        defaultValue,
        validate,
        validateOnBlur,
        validateOnChange,
        validateAll,
        fieldRef,
      }) => {
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
              fieldRef,
            }),
          },
          values: {
            ...current.values,
            [name]: defaultValue,
          },
        }))
      },
      []
    )

    const unmountField = useCallback(({ name }) => {
      setState((current) => {
        const formErrors = { ...current.form.errors }
        delete formErrors[name]
        const valid = isEmptyObject(formErrors)
        const form = {
          ...current.form,
          valid,
          invalid: !valid,
          errors: formErrors,
        }
        const fields = { ...current.fields }
        delete fields[name]
        const values = { ...current.values }
        delete values[name]
        return { form, fields, values }
      })
    }, [])

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
            validateOnChange,
          }
          const fields = {
            ...current.fields,
            [name]: newField,
          }
          if (!validate) {
            newField.valid = true
            newField.invalid = false
            newField.error = false
          }
          const newFormErrors = { ...current.form.errors }
          const form = { ...current.form }
          if (!validate) {
            form.valid = Object.values(fields).every(({ valid }) => valid)
            form.invalid = !form.valid
            delete newFormErrors[name]
            form.errors = newFormErrors
          }
          return {
            ...current,
            form: form,
            fields: fields,
          }
        })
      },
      []
    )

    const setValidating = useCallback(({ name }) => {
      setState((current) => {
        if (current.fields[name].validating) return current
        return ({
          ...current,
          form: {
            ...current.form,
            validating: true,
          },
          fields: { ...current.fields, [name]: { ...current.fields[name], validating: true } },
        })
      })
    }, [])

    const clearFieldError = useCallback(({ name }) => {
      setState((current) => {
        const fields = {
          ...current.fields,
          [name]: { ...current.fields[name], valid: true, invalid: false, validating: false },
        }
        delete fields[name].error
        const formErrors = { ...current.form.errors }
        delete formErrors[name]
        const valid = isEmptyObject(formErrors)
        const form = {
          ...current.form,
          valid,
          invalid: !valid,
          errors: formErrors,
          validating: Object.values(fields).some(({ validating }) => validating),
        }
        return {
          ...current,
          form,
          fields,
        }
      })
    }, [])

    const setFieldError = useCallback(({ name, error: rawError }) => {
      setState((current) => {
        const error = (rawError instanceof Error && rawError?.message) || rawError
        const fields = {
          ...current.fields,
          [name]: {
            ...current.fields[name],
            error,
            valid: false,
            invalid: true,
            validating: false,
          },
        }
        const form = {
          ...current.form,
          valid: false,
          invalid: true,
          errors: {
            ...current.form.errors,
            [name]: error,
          },
          validating: Object.values(fields).some(
            ({ validating, name: fieldName }) => fieldName !== name && validating
          ),
        }
        return { ...current, fields, form }
      })
    }, [])

    const validateAllFields = useCallback(
      async ({ currentFields = state.fields, currentValues = state.values, validateAll } = {}) =>
        Promise.allSettled(
          Object.entries(currentFields).map(async ([name, { validate }]) => {
            if (validateAll && !validateAll(name, currentFields[name])) return null
            try {
              if (validate) {
                setValidating({ name })
                await validate({
                  name,
                  value: currentValues[name],
                  values: currentValues,
                })
              }
              clearFieldError({ name })
            } catch (error) {
              setFieldError({ name, error })
              // eslint-disable-next-line no-throw-literal
              throw { name, error }
            }
          })
        ),
      [clearFieldError, setFieldError, setValidating, state.fields, state.values]
    )

    const setFieldTouched = useCallback(
      ({ name }) => {
        const value = state.values[name]
        const fields = state.fields
        const currentField = fields[name]
        const { touched, validateOnBlur, validateAll, validate } = currentField
        if (touched && (!validateOnBlur || !validate)) return
        const newFields = {
          ...fields,
          [name]: { ...fields[name], touched: true, untouched: false },
        }
        setState((current) => ({
          ...current,
          form: {
            ...current.form,
            touched: true,
            untouched: false,
          },
          fields: newFields,
        }))
        if (validate && validateOnBlur && !validateAll) {
          setValidating({ name })
          try {
            const validateResult = validate({ name, value, values: state.values })
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

        if (validate && validateOnBlur && validateAll) {
          validateAllFields({
            currentFields: newFields,
            validateAll: typeof validateAll === 'function' ? validateAll : null,
          })
        }
      },
      [state.values, state.fields, setValidating, clearFieldError, setFieldError, validateAllFields]
    )

    const setFieldValue = useCallback(
      ({ name, value }) => {
        if (state.values[name] === value) return
        const newFields = { ...state.fields, [name]: { ...state.fields[name], pristine: false } }
        const newValues = { ...state.values, [name]: value }
        setState((current) => ({
          values: newValues,
          form: { ...current.form, pristine: false },
          fields: newFields,
        }))
        const { validate, validateOnChange, validateAll } = state.fields[name]
        if (validate && validateOnChange && !validateAll) {
          setValidating({ name })
          try {
            const validateResult = validate({ name, value, values: newValues })
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
        if (validate && validateOnChange && validateAll) {
          validateAllFields({
            currentFields: newFields,
            currentValues: newValues,
            validateAll: typeof validateAll === 'function' ? validateAll : null,
          })
        }
      },
      [state.values, state.fields, setValidating, clearFieldError, setFieldError, validateAllFields]
    )

    const resetField = useCallback(({ name }) => {
      setState((current) => {
        const field = current.fields[name]
        const newFields = { ...current.fields, [name]: { ...field, pristine: true } }
        return {
          values: { ...current.values, [name]: field.defaultValue },
          fields: newFields,
          form: {
            ...current.form,
            pristine: Object.values(newFields).every(({ pristine }) => pristine),
          },
        }
      })
    }, [])

    const reset = useCallback((e) => {
      if (e?.preventDefault) e.preventDefault()
      setState((current) => {
        const newFields = Object.entries(current.fields).reduce(
          (newFields, [name, { defaultValue }]) => ({
            ...newFields,
            [name]: createDefaultFieldState({ defaultValue }),
          }),
          {}
        )
        return {
          form: defaultFormState,
          fields: newFields,
          values: Object.entries(newFields).reduce(
            (newValues, [name, { defaultValue }]) => ({
              ...newValues,
              [name]: defaultValue,
            }),
            {}
          ),
        }
      })
    }, [])

    const submit = useCallback(
      async (e = {}, options = {}) => {
        const { ignoreErrors = false } = options
        if (e?.preventDefault) {
          e.preventDefault()
          e.stopPropagation()
        }

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
            submitEvent: e?.nativeEvent || null,
          },
        }))
        calledCallback.current = false
        try {
          const submitValues = convertToDeepObject(state.values)
          const validationResults = await validateAllFields()
          const rejectedValidations = validationResults.filter(
            ({ status }) => status === 'rejected'
          )
          if (!ignoreErrors && rejectedValidations.length) {
            throw new Error('Validation error')
          }
          const validationErrors = ignoreErrors
            ? rejectedValidations.reduce(
                (all, { reason: { name, error } }) => ({
                  ...all,
                  [name]: error,
                }),
                {}
              )
            : null
          const submitResult = await onSubmit({
            values: submitValues,
            event: e?.nativeEvent || null,
            validationErrors,
            options,
          })
          setState((current) => ({
            ...current,
            form: {
              ...current.form,
              submitSuccess: true,
              submitResult,
            },
          }))
        } catch (e) {
          setState((current) => ({
            ...current,
            form: {
              ...current.form,
              submitError: e,
            },
          }))
        } finally {
          setState((current) => ({
            ...current,
            form: {
              ...current.form,
              submitting: false,
              submitted: true,
            },
          }))
        }
      },
      [onSubmit, state.form.submitting, state.values, validateAllFields]
    )

    const formState = useMemo(
      () => ({
        form: state.form,
        fields: state.fields,
        values: state.values,
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
        validate: () => validateAllFields(),
        submit,
      }),
      [
        state.form,
        state.fields,
        state.values,
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
        submit,
        validateAllFields,
      ]
    )

    return (
      <FormzContext.Provider value={formState}>
        <form
          {...(typeof formProps === 'function' ? formProps(state.form) : formProps)}
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
