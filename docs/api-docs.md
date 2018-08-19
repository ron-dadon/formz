# API Documentation

## Components

### Formz component

The main form component. This component is responsible for managing the form state, and hook up your event handlers into the form.

#### Props

##### render: React element / functional component (required)

Formz utilizes the render prop pattern to inject all form related props and methods into your form component.
Pass in a class component or functional component.

##### onSubmit: (formValues: {}) => Promise / Boolean (required)

Form submission handler. The handler is called only if the form is valid, and will receive a single argument, that is a map object of `<field name, field value>`.

If the handler does async work to process the form, it should return a `Promise` that is resolved if the process was successful, or rejected with the error if the processing failed.

If the handler does sync work, it should return `true` if successful, or `false` if failed.

##### onSubmitSuccess: (result: any) => void

A callback to be called when the submission of the form is successful.

If your `onSubmit` returned a `Promise`, it will be called with the resolved value. If your `onSubmit` returned `true`, it will be called with the submitted form values.

##### onSubmitError: (error: any) => void

A callback to be called when the submission of the form failed.

If the form is invalid, it will be called when attempting to submit the form, and will get the form errors object as parameter.

If your `onSubmit` returned a `Promise`, it will be called with the rejected value. If your `onSubmit` returned `false`, it will be called with `false`.

##### onValidation: ({ errors: {}, valid: boolean }) => void

A callback to be called when the form has finished a validation phase.

The callback will get a single object as a parameter, with `errors`, which is the form errors object, and `valid` that states if the form is valid or not.

##### onReset: () => void

A callback to be called when the form has been reset.

##### autoReset: boolean

If set to `true`, the form would automatically reset upon a successful submit.

##### validateOnChange: boolean (default: `true`)

If set to `true`, the form would validate upon every change in a field.
Please note that this may cause an additional render, and validation runs on all fields.

##### validateOnBlur: boolean (default: `true`)

If set to `true`, the form would validate upon every blur of a field.
Please note that this may cause an additional render, and validation runs on all fields.

##### validateOnInit: boolean (default: `true`)

If set to `true`, the form would validate after each field initialization.
Please note that this may cause an additional render, runs for every field that is registered in the form (for example, form with 7 fields will execute validation 7 times on initialization), and validation runs on all fields.

##### validateOnSubmit: boolean (default: `true`)

If set to `true`, the form would validate before submitting.
Please note that this may cause an additional render and validation runs on all fields.
It is a good practice to leave this option set to `true`, as it should prevent unneeded API requests to your form endpoint if client side validation fails.

### Field component

The `Field` component is injected as a prop into your form component via the render prop of the `Form` component. Each form gets a `Field` component that is bounded to that form.

**Important Note:** The `Field` component is very sensitive to props changes. Because validators gets the form props, every change to the props will trigger the validators, and if props always change that may cause infinite loop.
For example, the following is a BIG NO NO:

{% raw %}
```jsx
<Field name="fieldName" validators={{ isOK: ({ value }) => !!value }} />
```
{% endraw %}

Regardless of the fact that this is a bad practice in React in general, that means that for every render, the `validators` prop is injected a new object, that will trigger `componentDidUpdate` and will push a notification that props was changed for that field to the `Formz` instance, causing it to execute the validators and re-render the fields, and there for, that will cause an infinite loop.

#### Props

##### render: React element / functional component (required)

The `Field` component utilizes the render prop pattern to inject all field / form related props and methods into your field component.
Pass in a class component or functional component.

##### name: string (required)

The name of the field. It will be used as the key for the field in the form values map object. Must be unique in the same form, adding 2 fields with the same name will throw an error.

##### defaultValue: object/array/string/number/boolean

The initial value for the field. Can be an object, array, string, number or boolean.

##### validators: object<string, function>

A map of validation functions. Each key of the object will be used as the error key on the `errors` object of the field.
A sync validation function should return `true` if the validation passed, `false` otherwise.
An async validation function should return a `Promise` that will resolve with `true` if validation passed or `false` if validation failed.

**DO NOT** reject an async validation function, as all async validation functions are invoked together using `Promise.all`, so rejecting one will cause the entire promise to reject.

Each function will get an object of `{ value, allValues, props }`.

##### parsers: function / array<function>

Parse function is used to convert the "view" (formatted) value into a value that should be stored in the form. This is useful for example for converting `DD/MM/YYYY` formatted dates to unix timestamps.

Each function will get an object of `{ value, allValues, props }`, and should return the parsed value.

If an array of parsing functions is provided, each function will be executed in order, and passed the returned value from the previous function.

##### formatters: function / array<function>

The opposite of `parsers`. Formatter function is used to convert the actual stored value in the form into a value should be displayed for the user. This is useful for example for converting unix timestamps to `DD/MM/YYYY` formatted date.

Each function will get an object of `{ value, allValues, props }`, and should return the formatted value.

If an array of formatting functions is provided, each function will be executed in order, and passed the returned value from the previous function.

##### validateOnChange: boolean (default: `true`)

If set to `true`, the form would validate upon every change in that field.
Please note that this may cause an additional render, and validation runs on all fields.

This can be used to force validation / prevent validation if the form prop `validateOnChange` is the opposite. For example, if the form prop `validateOnChange` is `false`, only a field with the prop `validateOnChange` sets to `true` will trigger the validation.

##### validateOnBlur: boolean (default: `true`)

If set to `true`, the form would validate upon every blur of that field.
Please note that this may cause an additional render, and validation runs on all fields.

This can be used to force validation / prevent validation if the form prop `validateOnBlur` is the opposite. For example, if the form prop `validateOnBlur` is `false`, only a field with the prop `validateOnBlur` sets to `true` will trigger the validation.

##### validateOnInit: boolean (default: `true`)

If set to `true`, the form would validate after field initialization.
Please note that this may cause an additional render, runs for every field that is registered in the form (for example, form with 7 fields will execute validation 7 times on initialization), and validation runs on all fields.

This can be used to force validation / prevent validation if the form prop `validateOnInit` is the opposite. For example, if the form prop `validateOnInit` is `false`, only a field with the prop `validateOnInit` sets to `true` will trigger the validation.

##### reInitialize: boolean

If set to `true`, a change in the `defaultValue` prop will change the `value` of the field to the new default value.

##### keepDirty: boolean

If set to `true`, a change in the `defaultValue` prop will change the `value` of the field to the new default value, **ONLY IF** the field is not `dirty`.

## Render props

Formz uses the **render prop** pattern of React to pass down relevant props into the rendered components.

### Formz render props

The `Formz` component `render` prop will render the entire form. It will inject the following props into the rendered component:

#### Field: Component

A React component `Field` that is used to define fields for the form and is tightly coupled to the providing `Formz` instance.

#### reset: function

A function that will reset the form when called.

#### submit: function

A function that will trigger the form submission when called.

#### errors: object<string, object<string, boolean>>

A map object of the current form field errors. Each object key is a name of a field, and each value is a map from the error name to `true` if the error is relevant to the field.

#### valid: boolean

Is the form valid (no errors are present for all fields).

#### invalid: boolean

The opposite of `valid`. Is `true` if there is at least one field with one error.

#### pristine: boolean

Is the form pristine (no values were changed). Is `true` if all fields in the form are in `pristine` state.

#### dirty: boolean

The opposite of `pristine`. Is `true` if there is at least one field that is in `dirty` state.

#### touched: boolean

Was the form touched by the user. Is `true` if at least one field was touched by the user.

#### untouched: boolean

The opposite of `touched`. Is `true` if none of the fields were touched by the user.

#### pending: boolean

Does the form has pending validation (async). Is `true` if at least one of the fields has an async validation that is still processing.

#### submitting: boolean

Is `true` when the form is submitting.

#### submitted: boolean

Is `true` when the form was already submitted, and the submission completed (successfully or not).

#### submitSuccess: boolean

If `true` when the form was successfully submitted.

#### fields: object<string, object>

A map object of the fields in the form. Each field contains the entire field meta data and data (state, validators, parsers, formatters, default value, value etc.).

**This prop is designed mainly for debugging - DO NOT manipulate this object manually!**

### Field render props

The `Field` component `render` prop will render a single field. It will inject the following props into the rendered component:

#### value: any

The formatted value of the field for display to the user.

#### rawValue: any

The actual value of the field.

#### errors: object<string, boolean>

A map object with all the active errors of the field.

#### valid: boolean

Is `true` if the field is valid (no errors).

#### invalid: boolean

The opposite of `valid`. Is `true` if the field has at least one active error.

#### touched: boolean

Is `true` if the field was touched by the user.

#### untouched: boolean

The opposite of `touched`. Is `true` if the field was never touched by the user.

#### pristine: boolean

Is `true` if the field was never changed.

#### dirty: boolean

The opposite of `pristine`. Is `true` if the field was changed.

#### active: boolean

Is `true` if the field is the currently active field in the form (in focused).

#### pending: boolean

Is `true` if the field has at least one async validation pending.

#### submitting: boolean

Is `true` when the form is submitting.

#### submitted: boolean

Is `true` when the form was already submitted, and the submission completed (successfully or not).

#### submitSuccess: boolean

If `true` when the form was successfully submitted.

#### formValues: object<string, any>

A map object from field names to raw values.

#### onChange: function

Call this function to change the value of the field.
The function should be called with a single argument - the new field raw value.

#### onBlur: function

Call this function when the field is blurred. 

#### onFocus: function

Call this function when the field is focused. 

#### reset: function

Call this function the reset the field. 

#### updateFieldValue: function

Call this function to update a field value. The function argument is an object of `{ name, value }` where `name` is the name of the field to update, and `value` is the new value.

Calling `onChange` actually calls this function with the current field `name`.