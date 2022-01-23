import React, { useCallback, useMemo, useRef, useState } from 'react'
import { FormzContext } from './FormzContext.js'

const defaultMetaState = {
  invalid: false,
  valid: true,
  validating: false,
  touched: false,
  untouched: true,
  pristine: true,
}

const createDefaultFieldState = ({ defaultValue = null, validate }) => ({
  ...defaultMetaState,
  defaultValue,
  validate,
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
  },
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
  }) => {
    if (!onSubmit || typeof onSubmit !== 'function')
      throw new Error('`onSubmit` prop is required in Form')

    const [state, setState] = useState(defaultFormState)

    const mountField = useCallback(
      ({ name, defaultValue = null, validate }) => {
        setState((current) => ({
          ...current,
          fields: {
            ...current.fields,
            [name]: createDefaultFieldState({ defaultValue, validate }),
          },
          values: { ...current.values, [name]: defaultValue },
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
          return {
            ...current,
            form: { ...current.form, error: isEmptyObject(formErrors), errors: formErrors },
            fields,
            values,
          }
        })
      },
      [setState]
    )

    const setFieldTouched = useCallback(
      ({ name }) => {
        setState((current) => {
          if (current.fields[name].touched) return current

          return {
            ...current,
            form: { ...current.form, touched: true, untouched: false },
            fields: {
              ...current.fields,
              [name]: { ...current.fields[name], touched: true, untouched: false },
            },
          }
        })
      },
      [setState]
    )

    const setFieldError = useCallback(
      ({ name, error: rawError }) => {
        setState((current) => {
          const error = rawError?.message || rawError
          if (current.fields[name].error === error) return current

          const currentFields = {
            ...current.fields,
            [name]: {
              ...current.fields[name],
              error,
              valid: false,
              invalid: true,
              validating: false,
            },
          }
          return {
            ...current,
            form: {
              ...current.form,
              valid: false,
              invalid: true,
              errors: {
                ...current.form.errors,
                [name]: error,
              },
              validating: Object.values(currentFields).some(
                ({ validating, name: fieldName }) => fieldName !== name && validating
              ),
            },
            fields: currentFields,
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
            [name]: { ...current.fields[name], valid: true, invalid: false, validating: false },
          }
          delete currentFields[name].error
          delete formErrors[name]
          const valid = isEmptyObject(formErrors)
          const currentForm = {
            ...current.form,
            valid,
            invalid: !valid,
            errors: formErrors,
            validating: Object.values(currentFields).some(({ validating }) => validating),
          }
          return {
            ...current,
            form: currentForm,
            fields: currentFields,
          }
        })
      },
      [setState]
    )

    const setFieldValue = useCallback(
      ({ name, value }) => {
        setState((current) => {
          if (current.values[name] === value) return current

          return {
            ...current,
            values: { ...current.values, [name]: value },
            form: { ...current.form, pristine: false },
            fields: { ...current.fields, [name]: { ...current.fields[name], pristine: false } },
          }
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
            fields: { ...current.fields, [name]: { ...current.fields[name], validating: true } },
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
              pristine: Object.values(fields).every(({ pristine }) => pristine),
            },
            fields: fields,
          }
        })
      },
      [setState]
    )

    const reset = useCallback(() => {
      setState((current) => {
        const fields = Object.entries(current.fields).reduce(
          (newFields, [name, { defaultValue }]) => ({
            ...newFields,
            [name]: createDefaultFieldState({ defaultValue }),
          }),
          {}
        )
        const values = Object.entries(current.fields).reduce(
          (newValues, [name, { defaultValue }]) => ({
            ...newValues,
            [name]: defaultValue,
          }),
          {}
        )
        return {
          ...defaultFormState,
          fields,
          values,
        }
      })
    }, [setState])

    const submit = async () => {
      if (state.form.submitting) throw new Error('Cannot submit form more than once every time')
      setState((current) => ({
        ...current,
        form: {
          ...current.form,
          submitting: true,
          submitSuccess: false,
          submitError: false,
          submitCount: current.form.submitCount + 1,
        },
      }))
      try {
        const submitValues = convertToDeepObject(state.values)
        await Promise.all(
          Object.entries(state.fields).map(async ([name, { validate }]) => {
            try {
              if (validate) {
                setValidating({ name })
                await validate({
                  value: state.values[name],
                  values: state.values,
                })
              }
              clearFieldError({ name })
            } catch (error) {
              setFieldError({ name, error })
            }
          })
        )
        const submitResult = await onSubmit({ values: submitValues })
        setState((current) => ({
          ...current,
          form: { ...current.form, submitSuccess: true },
        }))
        onSubmitSuccess && onSubmitSuccess(submitResult)
      } catch (e) {
        setState((current) => ({
          ...current,
          form: { ...current.form, submitError: e },
        }))
        onSubmitError && onSubmitError(e)
      } finally {
        setState((current) => ({
          ...current,
          form: { ...current.form, submitting: false, submitted: true },
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
        setFieldError,
        setValidating,
        clearFieldError,
        setFieldValue,
        resetField,
        reset,
        submit,
      }),
      [state]
    )
    return (
      <FormzContext.Provider value={formState}>
        <form {...formProps}>{children}</form>
      </FormzContext.Provider>
    )
  }

  return FormzProvider
}

export const useFormz = () => {
  const formComponentRef = useRef(createFormzProvider())

  return { Form: formComponentRef.current }
}
