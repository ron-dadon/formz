export const isFunction = fn => typeof fn === 'function'

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

export const required = ({ value }) => {
  if (typeof value === 'string') return value !== ''
  if (Array.isArray(value)) return !!value.length
  if (typeof value === 'object' && value) return !!Object.keys(value).length
  return value !== null && value !== undefined
}

export const getFormValues = memorizeValues(({ fields }) => Object.keys(fields).reduce((values, fieldName) => ({
  ...values, [fieldName]: fields[fieldName].value
}), {}))

export const getFormErrors = fields => Object.keys(fields).reduce((values, fieldName) => ({
  ...values,
  [fieldName]: Object.keys(fields[fieldName].errors).length ? fields[fieldName].errors : undefined
}), {})

export const getFormIsValid = errors => Object.keys(errors).reduce(
  (isValid, fieldName) => isValid && (!errors[fieldName] || !Object.keys(errors[fieldName]).length),
  true
)

export const getFormPristine = fields => Object.keys(fields).reduce((isPristine, fieldName) => isPristine && fields[fieldName].pristine, true)

export const getFormTouched = fields => Object.keys(fields).reduce((isTouched, fieldName) => isTouched || fields[fieldName].touched, false)

export const isFieldValid = ({ errors }) => !Object.keys(errors).length

export const calculateFieldErrors = ({
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

export const executeModifiersPipeline = ({
    modifiers, value, allValues, props
  }) => modifiers.reduce((finalValue, modifier) => modifier({
  value: finalValue,
  allValues,
  props
}), value)

export const extractAsyncErrors = obj => Object.keys(obj).reduce((promises, objKey) => (obj[objKey] instanceof Promise ? {
  ...promises,
  [objKey]: obj[objKey]
} : promises), {})

export const extractSyncErrors = obj => Object.keys(obj).reduce((errors, objKey) => (obj[objKey] instanceof Promise ? errors : {
  ...errors,
  [objKey]: obj[objKey]
}), {})

export const debounce = (func, wait, immediate) => {
  let timeout
  const debouncedFn = (...args) => {
    const later = function() {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
  debouncedFn.cleanup = {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
  return debouncedFn
}
