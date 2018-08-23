<h1>
  Formz<br>
  <small>
    <small>
      Painless react forms 
      <small>
        <small>
          (v0.6.3)
        </small>
      </small>
    </small>
  </small>
</h1>

## Another form library? Why?!

First, because I can...

But the real reason is that as a former AngularJS developer who made the switch to React about a year ago, I found myself straggling with forms management in React since day one.
I've started with the commonly used Redux Form library, when I had just a basic understanding of Redux, and it looked pretty good, until I found myself working so damn hard for very basic things (why in the world I cannot get the field props in the field level validation function is baffling...).

I've **LOVED** AngularJS forms, they were just easy to use!

And much more important, after diving deep into Redux, and understanding the internal of Redux, _**WHY IN THE WORLD WOULD YOU GO THROUGH ALL THE MIDDLEWARE AND REDUCERS FOR EACH KEY TYPE?!**_
That is what Redux Form does - on every change, there is a complete Redux cycle - that can include 100's of function calls in a large application, where all I wanted was to update my field value, in my form, and my form is the only one that cares about this value.

So, the why part is first because I wanted to stop using Redux for form state management, and second, because I could not found a library that gave me the AngularJS experience.

## Installation

That one is easy. Like must libraries, just use `npm` or `yarn`.

```bash
$ npm i formz --save
``` 

```bash
$ yarn add formz
```

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
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={label}
      disabled={submitting}
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

For more information and API docs, visit [https://ron-dadon.github.io/formz](https://ron-dadon.github.io/formz)
