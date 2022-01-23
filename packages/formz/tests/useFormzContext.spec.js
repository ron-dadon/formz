import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useFormz, useFormzContext } from '../src'

const nop = () => {}

const wrapper = ({ children }) => {
  const { Form } = useFormz()
  return <Form onSubmit={nop}>{children}</Form>
}

test('should return form context', () => {
  const { result } = renderHook(() => useFormzContext(), { wrapper })

  expect(result.current.form).toBeDefined()
  expect(result.current.fields).toBeDefined()
  expect(result.current.values).toBeDefined()
})
