import './init'
import { isFunction, required, getFormValues, getFormErrors, getFormIsValid,
  getFormPristine, getFormTouched, isFieldValid, calculateFieldErrors,
  executeModifiersPipeline, extractAsyncErrors, extractSyncErrors
} from '../src/lib/utils'

describe('isFunction', () => {
  it('should return true when provided with a function', () => {
    expect(isFunction(() => {})).toBeTruthy()
  })
  it('should return false when not provided with a function', () => {
    expect(isFunction('')).toBeFalsy()
  })
})

describe('required', () => {
  it('should be true when provided with a non empty string', () => {
    expect(required({ value: 'test' })).toBeTruthy()
  })
  it('should be false when provided with an empty string', () => {
    expect(required({ value: '' })).toBeFalsy()
  })
  it('should be true when provided with a non empty array', () => {
    expect(required({ value: [1,2,3] })).toBeTruthy()
  })
  it('should be false when provided with an empty array', () => {
    expect(required({ value: [] })).toBeFalsy()
  })
  it('should be true when provided with a non empty object', () => {
    expect(required({ value: { a: 1 } })).toBeTruthy()
  })
  it('should be false when provided with an empty object', () => {
    expect(required({ value: {} })).toBeFalsy()
  })
  it('should be false when provided with a null value', () => {
    expect(required({ value: null })).toBeFalsy()
  })
  it('should be false when provided with a undefined value', () => {
    expect(required({ })).toBeFalsy()
  })
  it('should be true when provided with a number value', () => {
    expect(required({ value: 0 })).toBeTruthy()
  })
  it('should be true when provided with a false value', () => {
    expect(required({ value: false })).toBeTruthy()
  })
  it('should be true when provided with a true value', () => {
    expect(required({ value: true })).toBeTruthy()
  })
})

describe('getFormValues', () => {
  const fields = {
    fieldA: { value: 1 },
    fieldB: { value: 2 }
  }

  const fieldValues = getFormValues({ fields })

  it('should calculate field values hash', () => {
    expect(fieldValues).toHaveProperty('fieldA')
    expect(fieldValues.fieldA).toEqual(fields.fieldA.value)
    expect(fieldValues).toHaveProperty('fieldB')
    expect(fieldValues.fieldB).toEqual(fields.fieldB.value)
  })

  it('should not recalculate when passed with same fields hash', () => {
    const newFieldValues = getFormValues({ fields })
    expect(newFieldValues).toEqual(fieldValues)
  })
  it('should recalculate when passed with new fields hash', () => {
    const newFieldValues = getFormValues({ fields: { ...fields } })
    expect(newFieldValues).not.toBe(fieldValues)
  })
})

describe('getFormErrors', () => {
  it('should have a form error', () => {
    const errors = getFormErrors({ fieldA: { errors: { errorA: true } } })
    expect(errors).toHaveProperty('fieldA')
    expect(errors.fieldA).toHaveProperty('errorA')
    expect(errors.fieldA.errorA).toBeTruthy()
  })
  it('should not have a form error', () => {
    const errors = getFormErrors({ fieldA: { errors: {} } })
    expect(errors.fieldA).toBeUndefined()
  })
})

describe('getFormIsValid', () => {
  it('should be valid', () => {
    expect(getFormIsValid({})).toBeTruthy()
  })
  it('should not be valid', () => {
    expect(getFormIsValid({ fieldA: { errorA: true } })).toBeFalsy()
  })
})

describe('getFormPristine', () => {
  it('should be pristine', () => {
    expect(getFormPristine({ fieldA: { pristine: true }, fieldB: { pristine: true } })).toBeTruthy()
  })
  it('should not be pristine', () => {
    expect(getFormPristine({ fieldA: { pristine: true }, fieldB: { pristine: false } })).toBeFalsy()
  })
})

describe('getFormTouched', () => {
  it('should be touched', () => {
    expect(getFormTouched({ fieldA: { touched: true }, fieldB: { touched: false } })).toBeTruthy()
  })
  it('should not be touched', () => {
    expect(getFormTouched({ fieldA: { touched: false }, fieldB: { touched: false } })).toBeFalsy()
  })
})

describe('isFieldValid', () => {
  it('should be valid', () => {
    expect(isFieldValid({ errors: {} })).toBeTruthy()
  })
  it('should not be valid', () => {
    expect(isFieldValid({ errors: { errorA: true } })).toBeFalsy()
  })
})

describe('calculateFieldErrors', () => {
  const params = {
    validators: {
      min: ({ value, props: { minValue } }) => value > minValue,
      minStr: ({ value }) => value > 1 || 'min 1',
      match: ({ value, allValues }) => value === allValues.a
    },
    value: 1,
    allValues: { a: 2, b: 1 },
    props: { minValue: 1 }
  }

  it('should have a field error', () => {
    expect(calculateFieldErrors(params)).toEqual({ min: true, minStr: 'min 1', match: true })
  })
  it('should not have a field error', () => {
    expect(calculateFieldErrors({ ...params, value: 2 })).toEqual({})
  })
})

describe('executeModifiersPipeline', () => {
  const params = {
    modifiers: [
      ({ value }) => value,
      ({ value, allValues }) => value * allValues.a, // value = 1
      ({ value, allValues, props }) => value * allValues.a + props.z // value = 2
    ],
    value: 1,
    allValues: { a: 2 },
    props: { z: 1 }
  }

  it('should reduce modifiers', () => {
    expect(executeModifiersPipeline(params)).toEqual(5)
  })
})

describe('extractErrors', () => {
  const errors = { a: Promise.resolve(), b: true }

  it('async errors', () => {
    const asyncErrors = extractAsyncErrors(errors)
    expect(asyncErrors).toHaveProperty('a')
    expect(asyncErrors).not.toHaveProperty('b')
  })

  it('sync errors', () => {
    const syncErrors = extractSyncErrors(errors)
    expect(syncErrors).toHaveProperty('b')
    expect(syncErrors).not.toHaveProperty('a')
  })
})
