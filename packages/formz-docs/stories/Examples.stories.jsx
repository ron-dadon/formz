import React from 'react'
import { useFormz } from 'formz'
import { Input, Select } from './components/Input'
import { FormButtons, SubmitResult } from './components/Buttons'
import { sleep } from './utils'

const NameField = () => {
  return <Input name="firstName" placeholder="First name" defaultValue="" />
}

const ValidatedNameField = () => {
  return (
    <Input
      name="firstName"
      placeholder="First name"
      defaultValue=""
      helperText="Fill at least 2 characters"
      validate={({ value }) => {
        if (value.length < 2) throw new Error('Name must be longer than 2 chars')
      }}
    />
  )
}

const validateAmount = ({ name, value, values }) => {
  console.log('VALIDATE AMOUNT', name, value, values)
  if (value + values[name === 'amountA' ? 'amountB' : 'amountA'] > 100) {
    throw new Error('Amounts sum cannot be more than 100')
  }
}

const ValidatedAmountField = ({ name }) => {
  return (
    <Input
      name={name}
      type="number"
      placeholder="Amount"
      defaultValue={0}
      parse={(e) => (e.target.value ? parseInt(e.target.value, 10) : '')}
      validate={validateAmount}
      validateOnChange
      validateAll
    />
  )
}

const DateField = () => {
  const defaultValue = new Date().toISOString().substr(0, 16)

  return (
    <Input
      name="birthday"
      placeholder="Birthday"
      type="datetime-local"
      defaultValue={defaultValue}
    />
  )
}

const ValidatedDateField = () => {
  const defaultValue = new Date().toISOString().substr(0, 16)

  return (
    <Input
      name="birthday"
      placeholder="Birthday"
      type="datetime-local"
      defaultValue={defaultValue}
      validate={({ value }) => {
        if (new Date(value).getFullYear() < 2022) {
          throw new Error('Must be 2022')
        }
      }}
    />
  )
}

const AgeField = () => {
  return <Input name="age" placeholder="Age" type="number" defaultValue={18} />
}

const Gender = () => {
  return (
    <Select
      name="gender"
      placeholder="Gender"
      defaultValue="-"
      options={{
        '-': 'Not specified',
        male: 'Male',
        female: 'Female',
      }}
    />
  )
}

const FormzTemplate = ({ children, ...props }) => {
  const { Form } = useFormz()

  const onSubmit = async ({ values }) => {
    console.log('VALUES', values)
    await sleep(1000)
  }

  return (
    <Form
      onSubmit={onSubmit}
      inputProps={({ form: { invalid } }) => ({ className: invalid ? 'was-validated' : '' })}
      {...props}
    >
      {children}
    </Form>
  )
}

const story = {
  title: 'Examples',
  argTypes: {},
}

export default story

export const Simple = () => {
  const { Form } = useFormz()

  const onSubmit = async ({ values }) => {
    console.log('VALUES', values)
    await sleep(1000)
  }

  return (
    <Form
      onSubmit={onSubmit}
      formProps={{
        noValidate: true,
      }}
    >
      <NameField />
      <DateField />
      <AgeField />
      <Gender />
      <SubmitResult />
      <FormButtons />
    </Form>
  )
}

export const WithValidation = () => {
  const { Form } = useFormz()

  const onSubmit = async ({ values }) => {
    console.log('VALUES', values)
    await sleep(1000)
  }

  return (
    <Form
      onSubmit={onSubmit}
      formProps={{
        noValidate: true,
      }}
      onSubmitSuccess={(_, e) => console.log(e.submitter.name)}
    >
      <ValidatedNameField />
      <ValidatedDateField />
      <AgeField />
      <Gender />
      <SubmitResult />
      <FormButtons />
    </Form>
  )
}

export const WithAllValidation = () => {
  const { Form } = useFormz()

  const onSubmit = async ({ values }) => {
    console.log('VALUES', values)
    await sleep(1000)
  }

  return (
    <Form
      onSubmit={onSubmit}
      formProps={{
        noValidate: true,
      }}
      onSubmitSuccess={(_, e) => console.log(e.submitter.name)}
    >
      <ValidatedAmountField name="amountA" />
      <ValidatedAmountField name="amountB" />
      <SubmitResult />
      <FormButtons />
    </Form>
  )
}
