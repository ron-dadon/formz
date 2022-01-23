import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useFormz } from '../src/useFormz.js'
import { render, fireEvent, screen } from '@testing-library/react'

test('should create Form component and return it', () => {
  const { result } = renderHook(() => useFormz())

  expect(typeof result.current.Form === 'function').toBeTruthy()
})

test('Should fail to render form if no onSubmit is provided', () => {
  const { result } = renderHook(() => useFormz())
  const { Form } = result.current

  expect(() => render(<Form />)).toThrow()
})

test('Should fail to render form if no fromProps is provided but is not a function or an object', () => {
  const { result } = renderHook(() => useFormz())
  const { Form } = result.current

  expect(() => render(<Form onSubmit={console.log} formProps="test" />)).toThrow()
  expect(() => render(<Form onSubmit={console.log} formProps={1} />)).toThrow()
  expect(() => render(<Form onSubmit={console.log} formProps={[]} />)).toThrow()
  expect(() => render(<Form onSubmit={console.log} formProps />)).toThrow()
})

test('Should render form tag with form props object', async () => {
  const { result } = renderHook(() => useFormz())
  const { Form } = result.current

  render(<Form onSubmit={console.log} formProps={{ 'data-testid': '123', noValidate: true }} />)
  const form = await screen.findByTestId('123')
  expect(form instanceof HTMLFormElement).toBeTruthy()
  expect(form.dataset['testid']).toEqual('123')
  expect(form.noValidate).toBeTruthy()
})

test('Should render form tag with form props function', async () => {
  const { result } = renderHook(() => useFormz())
  const { Form } = result.current

  render(
    <Form onSubmit={console.log} formProps={() => ({ 'data-testid': '123', noValidate: true })} />
  )
  const form = await screen.findByTestId('123')
  expect(form instanceof HTMLFormElement).toBeTruthy()
  expect(form.dataset['testid']).toEqual('123')
  expect(form.noValidate).toBeTruthy()
})
