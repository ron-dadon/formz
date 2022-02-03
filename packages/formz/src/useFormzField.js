import { useContext, useEffect, useRef, useState } from 'react'
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
    setFieldValidation,
    mountField,
    unmountField,
  } = formState
  const value = values[name]
  const field = fields[name] || {}
  const mounted = !!fields[name]

  useEffect(() => {
    mountField({ name, defaultValue, validate, validateOnBlur, validateOnChange })
    return () => unmountField({ name })
  }, [])

  useEffect(() => {
    if (mounted) {
      setFieldValidation({ name, validate, validateOnBlur, validateOnChange })
    }
  }, [validate, validateOnBlur, validateOnChange, mounted])

  const onChangeHandler = (e) => {
    const newValue = parse ? parse(e) : e?.target?.value !== undefined ? e?.target?.value : e
    setFieldValue({ name, value: newValue })
  }

  const onBlur = () => {
    setFieldTouched({ name })
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