<div align="center">
    <div><img src="https://ron-dadon.github.io/formz/assets/formz-logo-full.svg" /></div>
    <p>Painless React Forms</p>
</div>

![build](https://github.com/ron-dadon/formz/actions/workflows/build.yml/badge.svg)
![unit test](https://github.com/ron-dadon/formz/actions/workflows/unit-tests.yml/badge.svg)
![code ql](https://github.com/ron-dadon/formz/actions/workflows/codeql-analysis.yml/badge.svg)


Formz is a React form library designed from the ground up to be as efficient, robust and easy to understand as possible. With a size of less than 40kb (**7.2kb gzipped**), it packs in a full form state management engine, including sync & async validations, values parsing & formatting and much more.
 
## Installation

That one is easy. Like must libraries, just use `npm` or `yarn`.

```bash
$ npm i formz --save
``` 

```bash
$ yarn add formz
```

## Requirements

To keep `formz` size to the minimum, it is not compiled with `react` and `prop-types`, but uses them as a peer dependency, so you must have `react` and `prop-types` as a dependency in your project.

## Basic Example

Formz make use of render prop pattern to inject a unique `Field` component for each form. The `Field` component is in-charge of providing field level functionality that is bound to that form only.

So, a basic form would look like this:

```jsx
import React from 'react'
import { Formz } from 'formz'

const Input = ({label, value, onChange, onFocus, onBlur, submitting, type = 'text'}) => (
  <div className='form-group'>
    <input
      className='form-control'
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={label}
      disabled={submitting}
    />
  </div>
)

const LoginForm = ({Field, submitting, submitted, submitSuccess}) => (
  <div className='col-xs-12 col-md-6 col-lg-3'>
    <Field
      render={Input}
      name='email'
      label='Email'
    />
    <Field
      render={Input}
      name='password'
      type='password'
      label='Password'
    />
    <div>
      <button className='btn btn-light' type='reset' disabled={submitting}>Reset</button>
      <button className='btn btn-primary' type='submit' disabled={submitting}>Login</button>
    </div>
    {
      <p>
        {submitted && !submitting && `Login ${submitSuccess ? 'OK' : 'FAIL'}`}
        {submitted && submitting && 'Logging in...'}
      </p>
    }
  </div>
)

export const onLoginSubmitSync = (values) => {
  console.log('Submitted form with values', values)
  return (values.email === 'test@test.com' && values.password === '12345')
}

export const BasicExample = () => <Formz render={LoginForm} onSubmit={onLoginSubmitSync}/>
```

## Why not use redux-form if I'm using redux?

`redux-form`, as the name suggests, relays on `redux` state, reducers and actions to store and update the form state. While you might think this is nice to keep all the forms in one place, you should consider the performance & maintainability issues that this may cause.

When a redux action gets called, it triggers a full redux cycle, which includes calling all the reducer functions. When combined with React using the go-to `react-redux` library and the `connect` HOC, after all the reducers where called, and redux now holds the updated state, all the "connected" components will be called, triggering all the `mapStateToProps` and `mapDispatchToProps`. In a large application, there can 100's of reducers and 100's of connected components rendered at a given time - THAT IS A LOT OF FUNCTION CALLS. The result is that for each key press inside an input for example, we get this huge overhead, where in most cases, we only want to update the input value.

Unlike `redux-form`, Formz takes a different path. By understanding that in 99% of the time, the only section in the app that cares about the form state, is the actual form itself, it keeps the form state in an internal component state (in the `Formz` component) and gives the form component a way to interact with this state using the `Field` component. In that case, when you update a field value for example by typing into an input, ONLY THE FORM is re-rendered. That is a lot less performance demanding, and much easier to understand. If you still need some form data / state external to the form, you can always use the `Formz` callback props to "listen" to changes in the values, validations, submission etc.

---

For more information and API docs, visit [https://ron-dadon.github.io/formz](https://ron-dadon.github.io/formz)
