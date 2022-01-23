import { useContext, useEffect } from 'react'
import { FormzContext } from './FormzContext.js'

export const useFormzField = ({
  name,
  defaultValue,
  validate,
  parse,
  format,
  validateOnChange = false,
  validateOnBlur = true,
  validateOnInit = false,
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
    formState.mountField({ name, defaultValue, validate })
    validateOnInit &&
      triggerValidation({
        value: defaultValue,
        values: { ...values, [name]: defaultValue },
        validate,
      })
    return () => formState.unmountField({ name })
  }, [])

  const onChangeHandler = (e) => {
    const newValue = parse ? parse(e) : e?.target?.value || null
    setFieldValue({ name, value: newValue })
    validateOnChange &&
      triggerValidation({
        value: newValue,
        values: { ...values, [name]: newValue },
      })
  }

  const onBlur = () => {
    setFieldTouched({ name })
    validateOnBlur && triggerValidation({ value, values })
  }

  const currentValue = mounted ? value : defaultValue
  const formattedValue = format ? format(currentValue) : currentValue
  return {
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
