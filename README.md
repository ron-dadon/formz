<div align="center">
    <div><img src="https://ron-dadon.github.io/formz/assets/formz-logo-full.svg" /></div>
    <p>Painless React Forms</p>
</div>

[![Build Status](https://semaphoreci.com/api/v1/ron-dadon/formz/branches/master/badge.svg)](https://semaphoreci.com/ron-dadon/formz)

Formz is a React form library designed from the ground up to be as efficient, robust and easy to understand as possible. With a size of less than 60kb (**9.2kb gzipped**), it packs in a full form state management engine, including sync & async validations, values parsing & formatting and much more.
 
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
import React, { Component } from 'react'
import { Formz } from 'formz'

const Input = ({ label, value, onChange, onFocus, onBlur, submitting, type = 'text' }) => (
  <div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={label}
      disabled={submitting}
      synthetic
    />
  </div>
)

class LoginForm extends Component {
  render() {
    // The Field prop is the unique form field component bound to the wrapping form
    const { Field, submitting, submitted, submitSuccess } = this.props
    return (
      <div>
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
          <button type='reset' disabled={submitting}>Reset</button>
          <button type='submit' disabled={submitting}>Login</button>
        </div>
        {
          <p>
            {submitted && !submitting && `Login ${submitSuccess ? 'OK' : 'FAIL'}`}
            {submitted && submitting && 'Logging in...'}
          </p>
        }
      </div>
    )
  }
}

export default class App extends Component {
  onSubmit = values => new Promise((resolve, reject) => {
    // Simulate server call with timeout
    console.log('Submitted form with values', values)
    const result = values.email === 'test@test.com' && values.password === '12345' ? resolve : reject
    setTimeout(result, 100)
  })

  render() {
    return <Formz render={LoginForm} onSubmit={this.onSubmit} />
  }
}
```

## Why not use redux-form if I'm using redux?

`redux-form`, as the name suggests, relays on `redux` state, reducers and actions to store and update the form state. While you might think this is nice to keep all the forms in one place, you should consider the performance & maintainability issues that this may cause.

When a redux action gets called, it triggers a full redux cycle, which includes calling all the reducer functions. When combined with React using the go-to `react-redux` library and the `connect` HOC, after all the reducers where called, and redux now holds the updated state, all the "connected" components will be called, triggering all the `mapStateToProps` and `mapDispatchToProps`. In a large application, there can 100's of reducers and 100's of connected components rendered at a given time - THAT IS A LOT OF FUNCTION CALLS. The result is that for each key press inside an input for example, we get this huge overhead, where in most cases, we only want to update the input value.

Unlike `redux-form`, Formz takes a different path. By understanding that in 99% of the time, the only section in the app that cares about the form state, it the actual form itself, it keeps the form state in an internal component state (in the `Formz` component) and gives the form component a way to interact with this state using the `Field` component. In that case, when you update a field value for example by typing into an input, ONLY THE FORM is re-rendered. That is a lot less performance demanding, and much easier to understand. If you still need some of the form data / state external to the form, you can always use the `Formz` callback props to "listen" to changes in the values, validations, submission etc.

---

For more information and API docs, visit [https://ron-dadon.github.io/formz](https://ron-dadon.github.io/formz)

_Formz is still under active development, but it is stable and already used in production applications, so no breaking changes will be introduced unless those cannot be avoided._
