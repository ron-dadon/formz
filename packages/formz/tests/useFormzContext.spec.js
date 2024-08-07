import React, { act } from 'react'
import { renderHook } from '@testing-library/react'
import { defaultMetaState, useFormz, useFormzContext } from '../src'
import '@testing-library/jest-dom'

const nop = () => {}

const Wrapper = ({ children, onSubmit, onSubmitSuccess, onSubmitError, focusFirstErrorField }) => {
  const { Form } = useFormz()
  return (
    <Form
      onSubmit={onSubmit || nop}
      onSubmitSuccess={onSubmitSuccess}
      onSubmitError={onSubmitError}
      focusFirstErrorField={focusFirstErrorField}
    >
      {children}
    </Form>
  )
}

const createWrapper = (Wrapper, props = {}) => {
  return function CreatedWrapper({ children }) {
    return <Wrapper {...props}>{children}</Wrapper>
  }
}

const wrapper = createWrapper(Wrapper)

test('should return form context default state', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  expect(result.current.form).toEqual({
    ...defaultMetaState,
    submitting: false,
    submitted: false,
    submitCount: 0,
    submitSuccess: false,
    submitError: false,
    submitEvent: null,
    errors: {},
  })
  expect(result.current.fields).toEqual({})
  expect(result.current.values).toEqual({})
  expect(typeof result.current.mountField === 'function').toBeTruthy()
  expect(typeof result.current.unmountField === 'function').toBeTruthy()
  expect(typeof result.current.setFieldTouched === 'function').toBeTruthy()
  expect(typeof result.current.setFieldError === 'function').toBeTruthy()
  expect(typeof result.current.setValidating === 'function').toBeTruthy()
  expect(typeof result.current.clearFieldError === 'function').toBeTruthy()
  expect(typeof result.current.setFieldValue === 'function').toBeTruthy()
  expect(typeof result.current.resetField === 'function').toBeTruthy()
  expect(typeof result.current.reset === 'function').toBeTruthy()
  expect(typeof result.current.submit === 'function').toBeTruthy()
})

test('should register a new field without default value and validate function', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'test' })
  })

  expect(result.current.fields.test).toEqual(defaultMetaState)
})

test('should register a new field with default value and validate function', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'test', defaultValue: 'test', validate: nop })
  })

  expect(result.current.fields.test).toEqual({
    ...defaultMetaState,
    defaultValue: 'test',
    validate: nop,
  })
})

test('should unregister a field', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  act(() => {
    result.current.unmountField({ name: 'testA' })
  })

  expect(result.current.fields.testA).not.toBeDefined()
  expect(result.current.fields.testB).toBeDefined()
})

test('should update field validation only if changed', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })
  const nop2 = () => {}

  act(() => {
    result.current.mountField({ name: 'test', validate: nop })
  })

  const oldReference = result.current

  act(() => {
    result.current.setFieldValidation({ name: 'test', validate: nop })
  })

  expect(result.current).toBe(oldReference)

  const oldReference2 = result.current

  act(() => {
    result.current.setFieldValidation({ name: 'test', validate: nop2 })
  })

  expect(result.current).not.toBe(oldReference2)
})

test('should update field validation state if validate removed', async () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })
  const nopError = () => {
    throw new Error('Bad')
  }

  act(() => {
    result.current.mountField({ name: 'test', validate: nopError })
  })

  act(() => {
    result.current.mountField({ name: 'test2', validate: nopError })
  })

  await act(async () => {
    await result.current.submit()
  })

  expect(result.current.form.errors).toEqual({ test: 'Bad', test2: 'Bad' })

  act(() => {
    result.current.setFieldValidation({ name: 'test', validate: null })
  })

  expect(result.current.form.valid).toBeFalsy()
  expect(result.current.form.invalid).toBeTruthy()
  expect(result.current.form.errors).toEqual({ test2: 'Bad' })
  expect(result.current.fields.test.valid).toBeTruthy()
  expect(result.current.fields.test.invalid).toBeFalsy()
  expect(result.current.fields.test.error).toBeFalsy()
  expect(result.current.fields.test2.valid).toBeFalsy()
  expect(result.current.fields.test2.invalid).toBeTruthy()
  expect(result.current.fields.test2.error).toBeTruthy()

  act(() => {
    result.current.setFieldValidation({ name: 'test2', validate: null })
  })

  expect(result.current.form.valid).toBeTruthy()
  expect(result.current.form.invalid).toBeFalsy()
  expect(result.current.form.errors).toEqual({})
  expect(result.current.fields.test.valid).toBeTruthy()
  expect(result.current.fields.test.invalid).toBeFalsy()
  expect(result.current.fields.test.error).toBeFalsy()
  expect(result.current.fields.test2.valid).toBeTruthy()
  expect(result.current.fields.test2.invalid).toBeFalsy()
  expect(result.current.fields.test2.error).toBeFalsy()
})

test('should set field and form as touched', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  expect(result.current.fields.testA.touched).toBeFalsy()
  expect(result.current.fields.testA.untouched).toBeTruthy()
  expect(result.current.fields.testB.touched).toBeFalsy()
  expect(result.current.fields.testB.untouched).toBeTruthy()
  expect(result.current.form.touched).toBeFalsy()
  expect(result.current.form.untouched).toBeTruthy()

  act(() => {
    result.current.setFieldTouched({ name: 'testA' })
  })

  expect(result.current.fields.testA.touched).toBeTruthy()
  expect(result.current.fields.testA.untouched).toBeFalsy()
  expect(result.current.fields.testB.touched).toBeFalsy()
  expect(result.current.fields.testB.untouched).toBeTruthy()
  expect(result.current.form.touched).toBeTruthy()
  expect(result.current.form.untouched).toBeFalsy()

  const oldReference = result.current

  act(() => {
    result.current.setFieldTouched({ name: 'testA' })
  })

  expect(result.current).toBe(oldReference)
})

test('should not update state if field already touched', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  const oldReference1 = result.current

  act(() => {
    result.current.setFieldTouched({ name: 'testA' })
  })

  expect(result.current).not.toBe(oldReference1)

  const oldReference2 = result.current

  act(() => {
    result.current.setFieldTouched({ name: 'testA' })
  })

  expect(result.current).toBe(oldReference2)
})
test('should set field and form error', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  expect(result.current.fields.testA.invaild).toBeFalsy()
  expect(result.current.fields.testA.valid).toBeTruthy()
  expect(result.current.fields.testB.invalid).toBeFalsy()
  expect(result.current.fields.testB.valid).toBeTruthy()
  expect(result.current.form.invalid).toBeFalsy()
  expect(result.current.form.valid).toBeTruthy()
  expect(result.current.form.errors).toEqual({})

  act(() => {
    result.current.setFieldError({ name: 'testA', error: 'test error' })
  })

  expect(result.current.fields.testA.valid).toBeFalsy()
  expect(result.current.fields.testA.invalid).toBeTruthy()
  expect(result.current.fields.testA.error).toEqual('test error')
  expect(result.current.fields.testB.valid).toBeTruthy()
  expect(result.current.fields.testB.invalid).toBeFalsy()
  expect(result.current.fields.testB.error).toBeFalsy()
  expect(result.current.form.valid).toBeFalsy()
  expect(result.current.form.invalid).toBeTruthy()
  expect(result.current.form.errors).toEqual({ testA: 'test error' })
})

test('should set field and form as validating', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  expect(result.current.fields.testA.validating).toBeFalsy()
  expect(result.current.fields.testB.validating).toBeFalsy()
  expect(result.current.form.validating).toBeFalsy()

  act(() => {
    result.current.setValidating({ name: 'testA' })
  })

  expect(result.current.fields.testA.validating).toBeTruthy()
  expect(result.current.fields.testB.validating).toBeFalsy()
  expect(result.current.form.validating).toBeTruthy()
})

test('should not set field validating twice', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  const oldReference1 = result.current.fields

  act(() => {
    result.current.setValidating({ name: 'testA' })
  })

  expect(result.current.fields).not.toBe(oldReference1)

  const oldReference2 = result.current.fields

  act(() => {
    result.current.setValidating({ name: 'testA' })
  })

  expect(result.current.fields).toBe(oldReference2)
})

test('should clear field error', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  act(() => {
    result.current.setFieldError({ name: 'testA', error: 'error A' })
  })

  act(() => {
    result.current.setFieldError({ name: 'testB', error: 'error B' })
  })

  expect(result.current.fields.testA.error).toEqual('error A')
  expect(result.current.fields.testB.error).toEqual('error B')
  expect(result.current.form.errors).toEqual({ testA: 'error A', testB: 'error B' })
  expect(result.current.fields.testA.valid).toBeFalsy()
  expect(result.current.fields.testA.invalid).toBeTruthy()
  expect(result.current.fields.testB.valid).toBeFalsy()
  expect(result.current.fields.testB.invalid).toBeTruthy()
  expect(result.current.form.valid).toBeFalsy()
  expect(result.current.form.invalid).toBeTruthy()

  act(() => {
    result.current.clearFieldError({ name: 'testA' })
  })

  expect(result.current.fields.testA.error).toBeFalsy()
  expect(result.current.fields.testB.error).toEqual('error B')
  expect(result.current.form.errors).toEqual({ testB: 'error B' })
  expect(result.current.fields.testA.valid).toBeTruthy()
  expect(result.current.fields.testA.invalid).toBeFalsy()
  expect(result.current.fields.testB.valid).toBeFalsy()
  expect(result.current.fields.testB.invalid).toBeTruthy()
  expect(result.current.form.valid).toBeFalsy()
  expect(result.current.form.invalid).toBeTruthy()

  act(() => {
    result.current.clearFieldError({ name: 'testB' })
  })

  expect(result.current.fields.testA.error).toBeFalsy()
  expect(result.current.fields.testB.error).toBeFalsy()
  expect(result.current.form.errors).toEqual({})
  expect(result.current.fields.testA.valid).toBeTruthy()
  expect(result.current.fields.testA.invalid).toBeFalsy()
  expect(result.current.fields.testB.valid).toBeTruthy()
  expect(result.current.fields.testB.invalid).toBeFalsy()
  expect(result.current.form.valid).toBeTruthy()
  expect(result.current.form.invalid).toBeFalsy()
})

test('should set field value', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB' })
  })

  expect(result.current.values).toEqual({})
  expect(result.current.form.pristine).toBeTruthy()
  expect(result.current.fields.testA.pristine).toBeTruthy()
  expect(result.current.fields.testB.pristine).toBeTruthy()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'A' })
  })

  expect(result.current.values).toEqual({ testA: 'A' })
  expect(result.current.form.pristine).toBeFalsy()
  expect(result.current.fields.testA.pristine).toBeFalsy()
  expect(result.current.fields.testB.pristine).toBeTruthy()
})

test('should set field value twice', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  const oldReference1 = result.current

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'A' })
  })

  expect(result.current).not.toBe(oldReference1)

  const oldReference2 = result.current

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'A' })
  })

  expect(result.current).toBe(oldReference2)
})

test('should set field value from defaultValue', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA' })
  })

  act(() => {
    result.current.mountField({ name: 'testB', defaultValue: 'B' })
  })

  expect(result.current.values).toEqual({ testB: 'B' })
  expect(result.current.form.pristine).toBeTruthy()
  expect(result.current.fields.testA.pristine).toBeTruthy()
  expect(result.current.fields.testB.pristine).toBeTruthy()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'A' })
  })

  expect(result.current.values).toEqual({ testA: 'A', testB: 'B' })
  expect(result.current.form.pristine).toBeFalsy()
  expect(result.current.fields.testA.pristine).toBeFalsy()
  expect(result.current.fields.testB.pristine).toBeTruthy()
})

test('should reset field', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  act(() => {
    result.current.mountField({ name: 'testB', defaultValue: 'B' })
  })

  expect(result.current.values).toEqual({ testA: 'A', testB: 'B' })
  expect(result.current.form.pristine).toBeTruthy()
  expect(result.current.fields.testA.pristine).toBeTruthy()
  expect(result.current.fields.testB.pristine).toBeTruthy()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'C' })
  })
  act(() => {
    result.current.setFieldValue({ name: 'testB', value: 'D' })
  })

  expect(result.current.values).toEqual({ testA: 'C', testB: 'D' })
  expect(result.current.form.pristine).toBeFalsy()
  expect(result.current.fields.testA.pristine).toBeFalsy()
  expect(result.current.fields.testB.pristine).toBeFalsy()

  act(() => {
    result.current.resetField({ name: 'testA' })
  })

  expect(result.current.values).toEqual({ testA: 'A', testB: 'D' })
  expect(result.current.form.pristine).toBeFalsy()
  expect(result.current.fields.testA.pristine).toBeTruthy()
  expect(result.current.fields.testB.pristine).toBeFalsy()
})

test('should reset fields and form', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  expect(result.current.values).toEqual({ testA: 'A' })
  expect(result.current.form.pristine).toBeTruthy()
  expect(result.current.fields.testA.pristine).toBeTruthy()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'C' })
  })

  expect(result.current.values).toEqual({ testA: 'C' })
  expect(result.current.form.pristine).toBeFalsy()
  expect(result.current.fields.testA.pristine).toBeFalsy()

  act(() => {
    result.current.reset()
  })

  expect(result.current.values).toEqual({ testA: 'A' })
  expect(result.current.form.pristine).toBeTruthy()
  expect(result.current.fields.testA.pristine).toBeTruthy()
})

test('should call preventDefault in reset', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })
  const e = new Event('testEvent')
  e.preventDefault = jest.fn()

  act(() => {
    result.current.reset(e)
  })

  expect(e.preventDefault).toHaveBeenCalled()
})

test('should call preventDefault in submit', async () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })
  const e = new Event('testEvent')
  e.preventDefault = jest.fn()

  await act(async () => {
    await result.current.submit(e)
  })

  expect(e.preventDefault).toHaveBeenCalled()
})

test('should call onSubmit', async () => {
  const onSubmit = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  expect(result.current.values).toEqual({ testA: 'A' })
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeFalsy()
  expect(result.current.form.submitSuccess).toBeFalsy()
  expect(result.current.form.submitError).toBeFalsy()
  expect(result.current.form.submitCount).toEqual(0)

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalledTimes(1)
  expect(onSubmit).toHaveBeenCalledWith({
    values: { testA: 'A' },
    event: null,
    options: {},
    validationErrors: null,
  })
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeTruthy()
  expect(result.current.form.submitSuccess).toBeTruthy()
  expect(result.current.form.submitError).toBeFalsy()
  expect(result.current.form.submitCount).toEqual(1)

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalledTimes(2)
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeTruthy()
  expect(result.current.form.submitSuccess).toBeTruthy()
  expect(result.current.form.submitError).toBeFalsy()
  expect(result.current.form.submitCount).toEqual(2)
})

test('should call onSubmit with the passed event', async () => {
  const onSubmit = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  await act(async () => {
    await result.current.submit({ nativeEvent: 1 })
  })

  expect(onSubmit).toHaveBeenCalledWith({
    values: { testA: 'A' },
    event: 1,
    options: {},
    validationErrors: null,
  })
})

test('should call onSubmit with the validation errors', async () => {
  const onSubmit = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit }),
  })

  act(() => {
    result.current.mountField({
      name: 'testA',
      defaultValue: 'A',
      validate: () => {
        throw { required: true, length: false }
      },
    })
  })

  act(() => {
    result.current.mountField({ name: 'testB', defaultValue: 'B' })
  })

  await act(async () => {
    await result.current.submit({ nativeEvent: 1 }, { ignoreErrors: true })
  })

  expect(onSubmit).toHaveBeenCalledWith({
    values: {
      testA: 'A',
      testB: 'B',
    },
    event: 1,
    options: {
      ignoreErrors: true,
    },
    validationErrors: {
      testA: {
        required: true,
        length: false,
      },
    },
  })
})

test('should call onSubmit with the passed event and pass it to onSubmitSuccess', async () => {
  const onSubmit = jest.fn()
  const onSubmitSuccess = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit, onSubmitSuccess }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  await act(async () => {
    await result.current.submit({ nativeEvent: 1 })
  })

  expect(onSubmit).toHaveBeenCalledWith({
    values: { testA: 'A' },
    event: 1,
    options: {},
    validationErrors: null,
  })
  expect(onSubmitSuccess).toHaveBeenCalledWith(undefined, 1)
})

test('should call onSubmit with the passed event and pass it to onSubmitError', async () => {
  const e = new Error('Fail')
  const onSubmit = jest.fn(() => {
    throw e
  })
  const onSubmitError = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit, onSubmitError }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  await act(async () => {
    await result.current.submit({ nativeEvent: 1 })
  })

  expect(onSubmit).toHaveBeenCalledWith({
    values: { testA: 'A' },
    event: 1,
    options: {},
    validationErrors: null,
  })
  expect(onSubmitError).toHaveBeenCalledWith(e, 1)
})

test('should call onSubmit and fail due to onSubmit error', async () => {
  const onSubmit = jest.fn(async () => {
    throw new Error('Fail submit')
  })
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  expect(result.current.values).toEqual({ testA: 'A' })
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeFalsy()
  expect(result.current.form.submitSuccess).toBeFalsy()
  expect(result.current.form.submitError).toBeFalsy()
  expect(result.current.form.submitCount).toEqual(0)

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalledTimes(1)
  expect(onSubmit).toHaveBeenCalledWith({
    values: { testA: 'A' },
    event: null,
    options: {},
    validationErrors: null,
  })
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeTruthy()
  expect(result.current.form.submitSuccess).toBeFalsy()
  expect(result.current.form.submitError).toBeTruthy()
  expect(result.current.form.submitError.message).toEqual('Fail submit')
  expect(result.current.form.submitCount).toEqual(1)
})

test('should not call onSubmit due to field validation error', async () => {
  const onSubmit = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit }),
  })

  act(() => {
    result.current.mountField({
      name: 'testA',
      defaultValue: 'A',
      validate: () => {
        throw new Error('Fail A')
      },
    })
  })

  expect(result.current.values).toEqual({ testA: 'A' })
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeFalsy()
  expect(result.current.form.submitSuccess).toBeFalsy()
  expect(result.current.form.submitError).toBeFalsy()
  expect(result.current.form.submitCount).toEqual(0)

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).not.toHaveBeenCalled()
  expect(result.current.form.submitting).toBeFalsy()
  expect(result.current.form.submitted).toBeTruthy()
  expect(result.current.form.submitSuccess).toBeFalsy()
  expect(result.current.form.submitError).toBeTruthy()
  expect(result.current.fields.testA.error).toEqual('Fail A')
  expect(result.current.form.submitCount).toEqual(1)
})

test('should call onSubmit with nested object', async () => {
  const onSubmit = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit }),
  })

  act(() => {
    result.current.mountField({ name: 'test.a', defaultValue: 'A' })
  })

  act(() => {
    result.current.mountField({ name: 'test.b', defaultValue: 'B' })
  })

  act(() => {
    result.current.mountField({ name: 'test.c.d', defaultValue: 'D' })
  })

  act(() => {
    result.current.mountField({ name: 'test.c.e', defaultValue: 'E' })
  })

  expect(result.current.values).toEqual({
    'test.a': 'A',
    'test.b': 'B',
    'test.c.d': 'D',
    'test.c.e': 'E',
  })

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalledWith({
    values: {
      test: {
        a: 'A',
        b: 'B',
        c: { d: 'D', e: 'E' },
      },
    },
    event: null,
    options: {},
    validationErrors: null,
  })
})

test('should call onSubmitSuccess on successful submit', async () => {
  const onSubmit = jest.fn()
  const onSubmitSuccess = jest.fn()
  const onSubmitError = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit, onSubmitSuccess, onSubmitError }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalled()
  expect(onSubmitSuccess).toHaveBeenCalled()
  expect(onSubmitError).not.toHaveBeenCalled()

  jest.clearAllMocks()

  await act(async () => {
    await result.current.setFieldValue({ name: 'testA', value: 'B' })
  })

  expect(onSubmitSuccess).not.toHaveBeenCalled()
  expect(onSubmitError).not.toHaveBeenCalled()

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalled()
  expect(onSubmitSuccess).toHaveBeenCalled()
  expect(onSubmitError).not.toHaveBeenCalled()
})

test('should call onSubmitError on failed submit', async () => {
  const e = new Error('Fail submit')
  const onSubmit = jest.fn(async () => {
    throw e
  })
  const onSubmitSuccess = jest.fn()
  const onSubmitError = jest.fn()
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit, onSubmitSuccess, onSubmitError }),
  })

  act(() => {
    result.current.mountField({ name: 'testA', defaultValue: 'A' })
  })

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalled()
  expect(onSubmitSuccess).not.toHaveBeenCalled()
  expect(onSubmitError).toHaveBeenCalledWith(e, null)

  jest.clearAllMocks()

  await act(async () => {
    await result.current.setFieldValue({ name: 'testA', value: 'B' })
  })

  expect(onSubmitSuccess).not.toHaveBeenCalled()
  expect(onSubmitError).not.toHaveBeenCalled()

  await act(async () => {
    await result.current.submit()
  })

  expect(onSubmit).toHaveBeenCalled()
  expect(onSubmitSuccess).not.toHaveBeenCalled()
  expect(onSubmitError).toHaveBeenCalledWith(e, null)
})

test('should call all fields validation if validateAll is true', async () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  const validateA = jest.fn(({ value }) => {
    if (value === 'e') {
      throw new Error('Bad A')
    }
  })

  const validateB = jest.fn(({ value }) => {
    if (value === 'e') {
      throw new Error('Bad B')
    }
  })

  act(() => {
    result.current.mountField({ name: 'testA', validate: validateA, validateOnBlur: true })
  })

  act(() => {
    result.current.mountField({
      name: 'testB',
      validate: validateB,
      validateOnBlur: true,
      validateAll: true,
    })
  })

  expect(result.current.fields.testA.validateAll).toBeFalsy()
  expect(result.current.fields.testB.validateAll).toBeTruthy()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'e' })
  })
  act(() => {
    result.current.setFieldValue({ name: 'testB', value: 'e' })
  })
  act(() => {
    result.current.setFieldTouched({ name: 'testA' })
  })

  expect(validateA).toHaveBeenCalled()
  expect(validateB).not.toHaveBeenCalled()
  expect(result.current.fields.testA.invalid).toBeTruthy()
  expect(result.current.fields.testB.invalid).toBeFalsy()

  jest.clearAllMocks()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'ok' })
  })

  act(() => {
    result.current.setFieldTouched({ name: 'testB' })
  })

  await new Promise((r) => setTimeout(r, 100))
  expect(validateA).toHaveBeenCalled()
  expect(validateB).toHaveBeenCalled()
  expect(result.current.fields.testA.invalid).toBeFalsy()
  expect(result.current.fields.testB.invalid).toBeTruthy()
})

test('should call specific fields validation if validateAll is a function', async () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  const validateA = jest.fn(({ value }) => {
    if (value === 'e') {
      throw new Error('Bad A')
    }
  })

  const validateB = jest.fn(({ value }) => {
    if (value === 'e') {
      throw new Error('Bad B')
    }
  })

  const validateC = jest.fn(({ value }) => {
    if (value === 'e') {
      throw new Error('Bad C')
    }
  })

  act(() => {
    result.current.mountField({ name: 'testA', validate: validateA, validateOnBlur: true })
  })

  act(() => {
    result.current.mountField({
      name: 'testB',
      validate: validateB,
      validateOnBlur: true,
      validateAll: (name) => ['testA', 'testB'].includes(name),
    })
  })

  act(() => {
    result.current.mountField({
      name: 'testC',
      validate: validateC,
      validateOnBlur: true,
    })
  })

  expect(result.current.fields.testA.validateAll).toBeFalsy()
  expect(result.current.fields.testB.validateAll).toBeTruthy()
  expect(result.current.fields.testC.validateAll).toBeFalsy()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'e' })
  })
  act(() => {
    result.current.setFieldValue({ name: 'testB', value: 'e' })
  })
  act(() => {
    result.current.setFieldValue({ name: 'testC', value: 'e' })
  })
  act(() => {
    result.current.setFieldTouched({ name: 'testA' })
  })

  expect(validateA).toHaveBeenCalled()
  expect(validateB).not.toHaveBeenCalled()
  expect(validateC).not.toHaveBeenCalled()
  expect(result.current.fields.testA.invalid).toBeTruthy()
  expect(result.current.fields.testB.invalid).toBeFalsy()
  expect(result.current.fields.testC.invalid).toBeFalsy()

  jest.clearAllMocks()

  act(() => {
    result.current.setFieldValue({ name: 'testA', value: 'ok' })
  })

  act(() => {
    result.current.setFieldTouched({ name: 'testB' })
  })

  await new Promise((r) => setTimeout(r, 100))
  expect(validateA).toHaveBeenCalled()
  expect(validateB).toHaveBeenCalled()
  expect(validateC).not.toHaveBeenCalled()
  expect(result.current.fields.testA.invalid).toBeFalsy()
  expect(result.current.fields.testB.invalid).toBeTruthy()
  expect(result.current.fields.testC.invalid).toBeFalsy()
})

test('should focus first field error due to field validation error on submit', async () => {
  const onSubmit = jest.fn()
  const refA = { current: { focus: jest.fn() } }
  const refB = { current: { focus: jest.fn() } }
  const { result } = renderHook(() => useFormzContext(), {
    wrapper: createWrapper(Wrapper, { onSubmit, focusFirstErrorField: true }),
  })

  act(() => {
    result.current.mountField({
      name: 'testA',
      defaultValue: 'A',
      validate: () => {
        throw new Error('Fail A')
      },
      fieldRef: refA,
    })
  })
  act(() => {
    result.current.mountField({
      name: 'testB',
      defaultValue: 'B',
      fieldRef: refB,
    })
  })

  await act(async () => {
    await result.current.submit()
  })

  expect(refA.current.focus).toHaveBeenCalled()
  expect(refB.current.focus).not.toHaveBeenCalled()
})
