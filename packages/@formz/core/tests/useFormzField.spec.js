import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useFormz, useFormzField } from '../src'

const nop = () => {}

const wrapper = ({ children }) => {
  const { Form } = useFormz()
  return <Form onSubmit={nop}>{children}</Form>
}

test('should create field', () => {
  const { result } = renderHook(() => useFormzField({ name: 'test' }), { wrapper })

  expect(result.current.form).toBeDefined()
  expect(result.current.fields).toBeDefined()
  expect(result.current.values).toBeDefined()
  expect(result.current.inputProps).toBeDefined()
  expect(result.current.name).toEqual('test')
  expect(result.current.field).toBeDefined()
})
