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

    const [form, setForm] = useState(defaultFormState)
    const [values, setValues] = useState({})
    const [fields, setFields] = useState({})
    const calledCallback = useRef(false)

    useEffect(() => {
      const { submitting, submitted, submitSuccess, submitError, submitResult, submitEvent } = form
      if (submitting || !submitted || calledCallback.current) return
      if (submitSuccess) {
        calledCallback.current = true
        onSubmitSuccess && onSubmitSuccess(submitResult, submitEvent)
      }
      if (submitError) {
        calledCallback.current = true
        if (focusFirstErrorField) {
          const [, fieldToFocus] =
            Object.entries(fields).find(
              ([, fieldState]) =>
                fieldState.invalid &&
                fieldState.fieldRef?.current &&
                typeof fieldState.fieldRef.current.focus === 'function'
            ) || []
          if (fieldToFocus) fieldToFocus.fieldRef.current.focus()
        }
        onSubmitError && onSubmitError(submitError, submitEvent)
      }
      setForm((currentForm) => {
        const { submitEvent, ...form } = currentForm
        return { ...currentForm, form: { ...form, submitEvent: null } }
      })
    }, [form, fields, onSubmitSuccess, onSubmitError, focusFirstErrorField])

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
        setFields((current) => ({
          ...current,
          [name]: createDefaultFieldState({
            defaultValue,
            validate,
            validateOnBlur,
            validateOnChange,
            validateAll,
            fieldRef,
          }),
        }))
        setValues((current) => ({
          ...current,
          [name]: defaultValue,
        }))
      },
      [setFields, setValues]
    )

    const unmountField = useCallback(
      ({ name }) => {
        setForm((currentForm) => {
          const formErrors = { ...currentForm.errors }
          delete formErrors[name]
          const valid = isEmptyObject(formErrors)
          return {
            ...currentForm,
            valid,
            invalid: !valid,
            errors: formErrors,
          }
        })
        setFields((currentFields) => {
          const newFields = { ...currentFields }
          delete newFields[name]
          return newFields
        })
        setValues((currentValues) => {
          const newValues = { ...currentValues }
          delete newValues[name]
          return newValues
        })
      },
      [setForm, setFields, setValues]
    )

    const setFieldValidation = useCallback(
      ({ name, validate, validateOnBlur, validateOnChange, validateAll }) => {
        setFields((current) => {
          const currentField = current[name]
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
          const newFields = {
            ...current,
            [name]: newField,
          }
          if (!validate) {
            newField.valid = true
            newField.invalid = false
            newField.error = false
          }
          setForm((currentForm) => {
            const newFormErrors = { ...currentForm.errors }
            const newForm = { ...currentForm }
            if (!validate) {
              newForm.valid = Object.values(newFields).every(({ valid }) => valid)
              newForm.invalid = !newForm.valid
              delete newFormErrors[name]
              newForm.errors = newFormErrors
            }
            return newForm
          })
          return newFields
        })
      },
      [setForm, setFields]
    )

    const setFieldTouched = useCallback(
      ({ name }) => {
        setFields((current) => {
          const value = values[name]
          const currentField = current[name]
          const { touched, validateOnBlur, validateAll, validate } = currentField
          if (touched && (!validateOnBlur || !validate)) return current

          if (validate && validateOnBlur && !validateAll) {
            setValidating({ name })
            try {
              const validateResult = validate({ name, value, values })
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

          const newFields = {
            ...current,
            [name]: { ...currentField, touched: true, untouched: false },
          }

          if (validate && validateOnBlur && validateAll) {
            validateAllFields({
              currentFields: newFields,
              validateAll: typeof validateAll === 'function' ? validateAll : null,
            })
          }

          setForm((currentForm) => ({ ...currentForm, touched: true, untouched: false }))
          return newFields
        })
      },
      // eslint-disable-next-line no-use-before-define
      [values, setValidating, clearFieldError, setFieldError, validateAllFields]
    )

    const setFieldError = useCallback(
      ({ name, error: rawError }) => {
        setFields((current) => {
          const error = (rawError instanceof Error && rawError?.message) || rawError
          const currentFields = {
            ...current,
            [name]: {
              ...current[name],
              error,
              valid: false,
              invalid: true,
              validating: false,
            },
          }
          setForm((currentForm) => ({
            ...currentForm,
            valid: false,
            invalid: true,
            errors: {
              ...currentForm.errors,
              [name]: error,
            },
            validating: Object.values(currentFields).some(
              ({ validating, name: fieldName }) => fieldName !== name && validating
            ),
          }))
          return currentFields
        })
      },
      [setForm, setFields]
    )

    const clearFieldError = useCallback(
      ({ name }) => {
        setFields((current) => {
          const currentFields = {
            ...current,
            [name]: { ...current[name], valid: true, invalid: false, validating: false },
          }
          delete currentFields[name].error
          setForm((currentForm) => {
            const formErrors = { ...currentForm.errors }
            delete formErrors[name]
            const valid = isEmptyObject(formErrors)
            return {
              ...currentForm,
              valid,
              invalid: !valid,
              errors: formErrors,
              validating: Object.values(currentFields).some(({ validating }) => validating),
            }
          })
          return currentFields
        })
      },
      [setForm, setFields]
    )

    const setFieldValue = useCallback(
      ({ name, value }) => {
        setValues((currentValues) => {
          if (currentValues[name] === value) return currentValues
          const newValues = { ...currentValues, [name]: value }
          setForm((currentForm) => ({ ...currentForm, pristine: false }))
          setFields((currentFields) => {
            const { validate, validateOnChange, validateAll } = currentFields[name]
            const newFields = {
              ...currentFields,
              [name]: { ...currentFields[name], pristine: false },
            }
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
            return newFields
          })
          return newValues
        })
      },
      // eslint-disable-next-line no-use-before-define
      [setValidating, clearFieldError, setFieldError, validateAllFields]
    )

    const setValidating = useCallback(
      ({ name }) => {
        setForm((current) => ({
          ...current,
          validating: true,
        }))
        setFields((current) => {
          if (current[name].validating) return current
          return { ...current, [name]: { ...current[name], validating: true } }
        })
      },
      [setForm, setFields]
    )

    const resetField = useCallback(
      ({ name }) => {
        setFields((current) => {
          const field = current[name]
          const newFields = { ...current, [name]: { ...field, pristine: true } }
          setValues((currentValues) => {
            return { ...currentValues, [name]: field.defaultValue }
          })
          setForm((currentForm) => {
            return {
              ...currentForm,
              pristine: Object.values(newFields).every(({ pristine }) => pristine),
            }
          })
          return newFields
        })
      },
      [setForm, setFields, setValues]
    )

    const reset = useCallback(
      (e) => {
        if (e?.preventDefault) e.preventDefault()

        setForm(defaultFormState)
        setFields((currentFields) => {
          const newFields = Object.entries(currentFields).reduce(
            (newFields, [name, { defaultValue }]) => ({
              ...newFields,
              [name]: createDefaultFieldState({ defaultValue }),
            }),
            {}
          )
          setValues(
            Object.entries(newFields).reduce(
              (newValues, [name, { defaultValue }]) => ({
                ...newValues,
                [name]: defaultValue,
              }),
              {}
            )
          )
          return newFields
        })
      },
      [setForm, setFields, setValues]
    )

    const validateAllFields = useCallback(
      async ({ currentFields = fields, currentValues = values, validateAll } = {}) =>
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
      [clearFieldError, fields, setFieldError, setValidating, values]
    )

    const submit = useCallback(
      async (e = {}, options = {}) => {
        const { ignoreErrors = false } = options
        if (e?.preventDefault) e.preventDefault()

        if (form.submitting) throw new Error('Cannot submit form more than once every time')
        setForm((currentForm) => ({
          ...currentForm,
          submitting: true,
          submitted: false,
          submitSuccess: false,
          submitError: false,
          submitResult: null,
          submitCount: currentForm.submitCount + 1,
          submitEvent: e?.nativeEvent || null,
        }))
        calledCallback.current = false
        try {
          const submitValues = convertToDeepObject(values)
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
          setForm((current) => ({
            ...current,
            submitSuccess: true,
            submitResult,
          }))
        } catch (e) {
          setForm((current) => ({
            ...current,
            submitError: e,
          }))
        } finally {
          setForm((current) => ({
            ...current,
            submitting: false,
            submitted: true,
          }))
        }
      },
      [form.submitting, onSubmit, validateAllFields, values]
    )

    const formState = useMemo(
      () => ({
        form,
        fields,
        values,
        submitValues: convertToDeepObject(values),
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
        form,
        fields,
        values,
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
          {...(typeof formProps === 'function' ? formProps(form) : formProps)}
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
