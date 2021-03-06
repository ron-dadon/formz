# Validation

Client side validation provides a good UX for the end users and lowers load from the servers by preventing forms with invalid data to be sent to the server.

Validations are provided in field level, by providing an `object<string, function>` map to the `validators` prop of the `Field` component.
Each key in the map is used as the error key in the `errors` prop that is injected to the `Field` render.

Each validation function is called with an object in the form of `{ value: any, allValues: object<string, any>, props: object<string, any> }`.

<div class="alert alert-info">
  <i class="fas fa-info-circle"></i> Due to the nature of validation, where one field validation may depend on other values of the form, there is a special prop <code>reValidateOnFormChanges</code> that is used to control if validation for the field should be executed when other fields change.
</div>

There are 2 types of validations: synchronized (sync) and asynchronized (async).
 
## Sync validation

Sync validators should return `true` if the validation passed and `false` or a `string` with the error description otherwise.
All sync validators are executed sequentially.

A simple validation function:

```js
// Validate that an object has at least one property
const notEmptyObject = ({ value }) => Object.keys(value).length > 0
```

Additional props are passed to the `props` parameter and can be used to configure validations. A common example is a minimum value validation:

```js
// Validate that the value is at least `min`
const isAtLeast = ({ value, props: { min } }) => value >= min
```

All the form values are passed as well and can be used for cross fields validation, a common example is password confirmation field:

```js
// Validate that the field matches the password field
const passwordMatch = ({ value, allValues }) => value === allValues.password
```

You can also utilize `props` parameter to dynamically declare the field for the match:

```js
// Validate that the field matches the `match` field
const isMatching = ({ value, allValues, props: { match } }) => value === allValues[match]
```

A simple way to return a `string` with the error description if validation fails is to use the `or` (`||`) operator:

```js
// Validate that the value is at least `min` and return an error message if not
const isAtLeast = ({ value, props: { min } }) => value >= min || `Must be at least ${min}`
```

[Live example](examples/validation.html)

## Async validation

Async validators should return a `Promise` that is resolved with `true` if validation passed or resolved with `false` or a `string` of the description if validation failed.

Async validators SHOULD NOT reject the promise. The reason is that **all async validators are executed in parallel** (using `Promise.all`), so rejecting a single promise will cause `Promise.all` to reject only with the rejected result of that promise.

A simple example, that simulate checking if a username is available:

```js
const isAvailable = user => new Promise((resolve) => {
  // Simulate server call
  setTimeout(() => resolve(user !== 'john'), 200)
})

// Validate that a username is available
const available = ({ value }) => isAvailable(value)
```

[Live example](examples/async-validation.html)

## How to pass sync and async validations?

Unlike other libraries, sync and async validators are passed together in the same object. Formz will take care of splitting them for you according to the returned value.

```jsx
const validators = {
  sync: ({ value }) => value > 5, // Simple sync validation
  async: ({ value }) => http('/is-valid', value).then(res => res.data.isValid) // Simple async server validation
}

<Field
  name="myField"
  validators={validators}
/>
```

## I have async validation, how do I know it is processing?

Each field has a `pending` prop that is injected to the rendered component. This prop value will be `true` while validation is in progress.

## Where can I find the results of the validation?

Each field has `errors`, `valid` and `invalid` props.

When validation fails, `valid` will be `false`, `invalid` will be `true` and `errors` will contain an object with the keys of the failed validations with the value `true` or a `string` with the error description returned by the validation function. For example:

`errors = { required: true, email: true }` is the result of failed `required` and `email` validators.

When validation passes, `valid` will be `true`, `invalid` will be `false` and `errors` will be an empty object `{}`.

## Executing validation when other field changes

There maybe some cases that you would want to validate a field value when another value changes, a simple example is a password confirmation field that should match the password field.

To execute validation when another field changes, set the `reValidateOnFormChanges` prop of the `Field` component to `true`, a `string` with the name of the field that should trigger the validation or an `array` of `string` containing the fields that should trigger the validation.

- When setting `reValidateOnFormChanges` to `true`, every field in the form will trigger the validation for that field.

- When setting `reValidateOnFormChanges` to a `string` with the name of the field, the field validation will be triggered by changes to the field itself and by changes to the field set in `reValidateOnFormChanges`.

- When setting `reValidateOnFormChanges` to a `array<string>` with the names of the fields, the field validation will be triggered by changes to the field itself and by changes to the fields set in `reValidateOnFormChanges`.

For example:

```jsx
// Validate that the field matches the `match` field
const isMatching = ({ value, allValues, props: { match } }) => value === allValues[match]
const validators = {
  isMatching
}

// In the Formz render...
<Field
  name="password"
  ...
/>
<Field
  name="passwordConfirm"
  validators={validators}
  match="password"
  reValidateOnFormChanges="password"
/>  
```

In this example, any change in the `password` field will also trigger the validation in the `passwordConfirm` field.
