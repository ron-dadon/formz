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
