import React, { act } from 'react'
import { renderHook } from '@testing-library/react'
import { defaultMetaState, useFormz, useFormzField } from '../src'
import '@testing-library/jest-dom'

const defaultFieldState = {
  ...defaultMetaState,
  validateOnChange: false,
  validateOnBlur: true,
  validateAll: false,
  fieldRef: { current: null },
}
const nop = () => {}

const Wrapper = ({ children }) => {
  const { Form } = useFormz()
  return <Form onSubmit={nop}>{children}</Form>
}

test('should keep onChange reference', () => {
  const parse = jest.fn((v) => v.toUpperCase())
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'a',
        parse,
      }),
    { wrapper: Wrapper },
  )

  const firstOnChange = result.current.inputProps.onChange

  act(() => {
    result.current.inputProps.onChange('b')
  })

  expect(firstOnChange).toBe(result.current.inputProps.onChange)
})

test('should create field', () => {
  const { result } = renderHook(() => useFormzField({ name: 'test' }), { wrapper: Wrapper })

  expect(result.current.inputProps.value).not.toBeDefined()
  expect(typeof result.current.inputProps.onChange === 'function').toBeTruthy()
  expect(typeof result.current.inputProps.onBlur === 'function').toBeTruthy()
  expect(typeof result.current.inputProps.ref === 'object').toBeTruthy()
  expect(result.current.inputProps.ref.current).toBeNull()
  expect(result.current.name).toEqual('test')
  expect(result.current.field).toEqual(defaultFieldState)
})

test('should create field with validateAll', () => {
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        validateAll: true,
      }),
    { wrapper: Wrapper },
  )

  expect(result.current.field).toEqual({ ...defaultFieldState, validateAll: true })
})

test('should create field with default value', () => {
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
      }),
    { wrapper: Wrapper },
  )

  expect(result.current.inputProps.value).toEqual('A')
  expect(typeof result.current.inputProps.onChange === 'function').toBeTruthy()
  expect(typeof result.current.inputProps.onBlur === 'function').toBeTruthy()
  expect(result.current.name).toEqual('test')
  expect(result.current.value).toEqual('A')
  expect(result.current.field).toEqual({
    ...defaultFieldState,
    defaultValue: 'A',
  })
})

test('should create field with validate function', () => {
  const validate = jest.fn()
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
      }),
    { wrapper: Wrapper },
  )

  expect(result.current.inputProps.value).toEqual('A')
  expect(typeof result.current.inputProps.onChange === 'function').toBeTruthy()
  expect(typeof result.current.inputProps.onBlur === 'function').toBeTruthy()
  expect(result.current.name).toEqual('test')
  expect(result.current.value).toEqual('A')
  expect(result.current.field).toEqual({
    ...defaultFieldState,
    defaultValue: 'A',
    validate,
  })
})

test('should create field with validate function and update it', async () => {
  const validate = jest.fn()
  const validate2 = jest.fn()
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
        validateOnBlur: true,
      }),
    { wrapper: Wrapper },
  )

  await act(async () => {
    await result.current.inputProps.onBlur()
  })

  expect(validate).toHaveBeenCalled()
  expect(validate2).not.toHaveBeenCalled()

  validate.mockReset()
  validate2.mockReset()

  const { result: result2 } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate: validate2,
        validateOnBlur: true,
      }),
    { wrapper: Wrapper },
  )

  await act(async () => {
    await result2.current.inputProps.onBlur()
  })

  expect(validate).not.toHaveBeenCalled()
  expect(validate2).toHaveBeenCalled()

  validate.mockReset()
  validate2.mockReset()

  const { result: result3 } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validateOnBlur: true,
      }),
    { wrapper: Wrapper },
  )

  await act(async () => {
    await result3.current.inputProps.onBlur()
  })

  expect(validate).not.toHaveBeenCalled()
  expect(validate2).not.toHaveBeenCalled()
})

test('should create field with validate function and call it with validateOnChange', async () => {
  const validate = jest.fn()

  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
        validateOnChange: true,
      }),
    { wrapper: Wrapper },
  )

  expect(validate).not.toHaveBeenCalled()

  act(() => {
    result.current.inputProps.onChange('B')
    result.current.inputProps.onChange('B')
  })

  expect(validate).toHaveBeenCalled()
  expect(result.current.value).toEqual('B')
})

test('should create field with validate function and not call it with validateOnChange = false', () => {
  const validate = jest.fn()
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
      }),
    { wrapper: Wrapper },
  )

  expect(validate).not.toHaveBeenCalled()

  act(() => {
    result.current.inputProps.onChange('B')
  })

  expect(validate).not.toHaveBeenCalled()
  expect(result.current.value).toEqual('B')
})

test('should create field with validate function and call it with validateOnBlue', async () => {
  const validate = jest.fn()
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
        validateOnBlur: true,
      }),
    { wrapper: Wrapper },
  )

  expect(validate).not.toHaveBeenCalled()

  await act(async () => {
    await result.current.inputProps.onBlur()
  })

  expect(validate).toHaveBeenCalled()
})

test('should create field with validate function and not call it with validateOnBlue = false', () => {
  const validate = jest.fn()
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
        validateOnBlur: false,
      }),
    { wrapper: Wrapper },
  )

  expect(validate).not.toHaveBeenCalled()

  act(() => {
    result.current.inputProps.onBlur()
  })

  expect(validate).not.toHaveBeenCalled()
})

test('should create field with validate function and call it with validateOnBlue and set error', () => {
  const validate = jest.fn(() => {
    throw new Error('Bad')
  })
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'A',
        validate,
        validateOnBlur: true,
      }),
    { wrapper: Wrapper },
  )

  expect(validate).not.toHaveBeenCalled()

  act(() => {
    result.current.inputProps.onBlur()
  })

  expect(validate).toHaveBeenCalled()
  expect(result.current.field.error).toEqual('Bad')
})

test('should run parse when calling onChange', () => {
  const parse = jest.fn((v) => v.toUpperCase())
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'a',
        parse,
      }),
    { wrapper: Wrapper },
  )

  expect(parse).not.toHaveBeenCalled()

  act(() => {
    result.current.inputProps.onChange('b')
  })

  expect(parse).toHaveBeenCalled()
  expect(result.current.value).toEqual('B')
})

test('should call onChange with an event object with target value', () => {
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'a',
      }),
    { wrapper: Wrapper },
  )

  expect(result.current.inputProps.value).toEqual('a')

  act(() => {
    result.current.inputProps.onChange({ target: { value: 'b' } })
  })

  expect(result.current.inputProps.value).toEqual('b')

  act(() => {
    result.current.inputProps.onChange({ target: { value: '' } })
  })

  expect(result.current.inputProps.value).toEqual('')

  act(() => {
    result.current.inputProps.onChange('test')
  })

  expect(result.current.inputProps.value).toEqual('test')
})

test('should run format when pulling value from state', () => {
  const format = jest.fn((v) => v.toUpperCase())
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'a',
        format,
      }),
    { wrapper: Wrapper },
  )

  expect(format).toHaveBeenCalled()
  expect(result.current.value).toEqual('A')
})

test('should keep ref', () => {
  const { result } = renderHook(
    () =>
      useFormzField({
        name: 'test',
        defaultValue: 'a',
      }),
    { wrapper: Wrapper },
  )

  const firstRef = result.current.inputProps.ref

  act(() => {
    result.current.inputProps.ref.current = 'a'
  })

  expect(firstRef.current).toBe(result.current.inputProps.ref.current)
})
