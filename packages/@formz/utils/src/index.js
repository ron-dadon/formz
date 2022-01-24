import React from 'react'
import { useFormzContext, useFormzField } from '@formz/core'

export const useFormzDebugger = ({ values, form, fields }) => {
  const { values: contextValues, form: contextForm, fields: contextFields } = useFormzContext()

  console.log('%c Formz Debugger', 'color: yellow; font-weight: 700; font-size: large;')
  if (values) {
    console.log('%c Values', 'color: orange; font-weight: 700; font-size: medium;')
    console.table(contextValues)
  }
  if (form) {
    console.log('%c Form State', 'color: orange; font-weight: 700; font-size: medium;')
    console.table(contextForm)
  }
  if (fields) {
    console.log('%c Fields State', 'color: orange; font-weight: 700; font-size: medium;')
    Object.entries(contextFields).forEach(([fieldName, field]) => {
      console.log(
        `%c ${fieldName}`,
        'background: orange; color: black; font-weight: 500; font-size: small; padding: 8px;'
      )
      console.table(field)
    })
  }
}

export const FormzField = ({
  name,
  defaultValue,
  validate,
  parse,
  format,
  validateOnChange = false,
  validateOnBlur = true,
  component: Component,
  ...props
}) => {
  const fieldOptions = {
    name,
    defaultValue,
    validate,
    parse,
    format,
    validateOnChange,
    validateOnBlur,
  }
  const { ready, ...all } = useFormzField(fieldOptions)
  if (!ready) return null
  return <Component {...props} {...fieldOptions} {...all} />
}
