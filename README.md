# Formz <small><small><small>👌 Painless react forms</small></small></small>

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

```js
import React, { Component } from 'react'
import Formz from 'formz'

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
          component={Input}
          name='email'
          label='Email'
        />
        <Field
          component={Input}
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

You can find this example file and more under `examples` folder.

## Validation

Client side validation provides a good UX for your users, and also minimizes traffic to your server for form submissions that should fail anyway.

Formz supports sync and async validations with a very simple API. you are encouraged to utilize client side validation where applicable.

Due to the nature of validation, where one field validation may depend on other values of the form, the validation functions are executed on all fields every time.

Each validation function is injected with the field value, form values and field props, to give a fine level of details for every validation use case. See `validators` prop on `Field` component for more information.

## Data formatting and parsing

Many times the displayed value and actual form value are not identical in their format, the common examples are `select` components where the displayed label and selected value can be different and date fields, where many times the form value is a unix timestamp / ISO string but the displayed value is a human readable format of the data.

For that purpose, each field has two props, `parses` and `formatters`. Those props can receive a function or array of functions that will convert your form value to the displayed value (formatting) and vice versa (parsing). See `parsers` and `formatters` props on `Field` component.

## API Documentation

### Components

#### Formz

The main form component. This component is responsible for managing the form state, and hook up your event handlers into the form.

##### Props

###### render: React element / functional component (required)

Formz utilizes the render prop pattern to inject all form related props and methods into your form component.
Pass in a class component or functional component.

###### onSubmit: (formValues: {}) => Promise / Boolean (required)

Form submission handler. The handler is called only if the form is valid, and will receive a single argument, that is a map object of `<field name, field value>`.

If the handler does async work to process the form, it should return a `Promise` that is resolved if the process was successful, or rejected with the error if the processing failed.

If the handler does sync work, it should return `true` if successful, or `false` if failed.

###### onSubmitSuccess: (result: any) => void

A callback to be called when the submission of the form is successful.

If your `onSubmit` returned a `Promise`, it will be called with the resolved value. If your `onSubmit` returned `true`, it will be called with the submitted form values.

###### onSubmitError: (error: any) => void

A callback to be called when the submission of the form failed.

If the form is invalid, it will be called when attempting to submit the form, and will get the form errors object as parameter.

If your `onSubmit` returned a `Promise`, it will be called with the rejected value. If your `onSubmit` returned `false`, it will be called with `false`.

###### onValidation: ({ errors: {}, valid: boolean }) => void

A callback to be called when the form has finished a validation phase.

The callback will get a single object as a parameter, with `errors`, which is the form errors object, and `valid` that states if the form is valid or not.

###### onReset: () => void

A callback to be called when the form has been reset.

###### autoReset: boolean

If set to `true`, the form would automatically reset upon a successful submit.

###### validateOnChange: boolean (default: `true`)

If set to `true`, the form would validate upon every change in a field.
Please note that this may cause an additional render, and validation runs on all fields.

###### validateOnBlur: boolean (default: `true`)

If set to `true`, the form would validate upon every blur of a field.
Please note that this may cause an additional render, and validation runs on all fields.

###### validateOnInit: boolean (default: `true`)

If set to `true`, the form would validate after each field initialization.
Please note that this may cause an additional render, runs for every field that is registered in the form (for example, form with 7 fields will execute validation 7 times on initialization), and validation runs on all fields.

###### validateOnSubmit: boolean (default: `true`)

If set to `true`, the form would validate before submitting.
Please note that this may cause an additional render and validation runs on all fields.
It is a good practice to leave this option set to `true`, as it should prevent unneeded API requests to your form endpoint if client side validation fails.

#### Field

The `Field` component is injected as a prop into your form component via the render prop of the `Form` component. Each form gets a `Field` component that is bounded to that form.

**Important Note:** The `Field` component is very sensitive to props changes. Because validators gets the form props, every change to the props will trigger the validators, and if props always change that may cause infinite loop.
For example, the following is a BIG NO NO:

```js
<Field name="fieldName" validators={{ isOK: ({ value }) => !!value }} />
```

Regardless of the fact that this is a bad practice in React in general, that means that for every render, the `validators` prop is injected a new object, that will trigger `componentDidUpdate` and will push a notification that props was changed for that field to the `Formz` instance, causing it to execute the validators and re-render the fields, and there for, that will cause an infinite loop.

##### Props

###### render: React element / functional component (required)

The `Field` component utilizes the render prop pattern to inject all field / form related props and methods into your field component.
Pass in a class component or functional component.

##### TODO: Finish docs...
