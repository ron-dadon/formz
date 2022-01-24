import { useContext, useEffect, useRef } from 'react'
import { FormzContext } from './FormzContext.js'

export const useFormzField = ({
  name,
  defaultValue,
  validate,
  parse,
  format,
  validateOnChange = false,
  validateOnBlur = true,
}) => {
  const formState = useContext(FormzContext)
  const {
    values,
    fields,
    form,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    setValidating,
    setFieldValidation,
    mountField,
    unmountField,
  } = formState
  const value = values[name]
  const field = fields[name] || {}
  const mounted = !!fields[name]

  const triggerValidation = async ({ value: newValue, values: newValues, validate }) => {
    if (validate || field.validate) {
      setValidating({ name })
      try {
        await (validate || field.validate)({ name, value: newValue, values: newValues })
        clearFieldError({ name })
      } catch (e) {
        setFieldError({
          name,
          error: e.message || e,
        })
      }
    }
  }

  useEffect(() => {
    mountField({ name, defaultValue, validate })
    return () => unmountField({ name })
  }, [])

  useEffect(() => {
    if (mounted) {
      setFieldValidation({ name, validate })
    }
  }, [validate, mounted])

  const onChangeHandler = (e) => {
    const newValue = parse ? parse(e) : e?.target?.value || e
    setFieldValue({ name, value: newValue })
    return (
      validateOnChange &&
      triggerValidation({
        value: newValue,
        values: { ...values, [name]: newValue },
      })
    )
  }

  const onBlur = () => {
    setFieldTouched({ name })
    return validateOnBlur && triggerValidation({ value, values })
  }

  const currentValue = mounted ? value : defaultValue
  const formattedValue = format ? format(currentValue) : currentValue
  return {
    ready: mounted,
    form,
    values,
    fields,
    field,
    rawValue: currentValue,
    value: formattedValue,
    name,
    defaultValue,
    inputProps: { value: formattedValue, onChange: onChangeHandler, onBlur },
  }
}
