# Validation

Client side validation provides a good UX for the end users and lowers load from the servers by preventing forms with invalid data to be sent to the server.

Validations are provided in field level, by providing an `object<string, function>` map to the `validators` prop of the `Field` component.
Each key in the map is used as the error key in the `errors` prop that is injected to the `Field` render.

Each validation function is called with an object in the form of `{ value: any, allValues: object<string, any>, props: object<string, any> }`.

<div class="alert alert-info">
  <i class="fas fa-info-circle"></i> Due to the nature of validation, where one field validation may depend on other values of the form, the validation functions are executed on all fields every time.
</div>

There are 2 types of validations: synchronized (sync) and asynchronized (async).
 
## Sync validation

Sync validators should return `true` if the validation passed and `false` otherwise.
All sync validators are executed sequentially.

## Async validation

Async validators should return a `Promise` that is resolved with `true` if validation passed or resolved with `false` if validation failed.

Async validators SHOULD NOT reject the promise. The reason is that all async validators are executed in parallel (using `Promise.all`), so rejecting a single promise will cause `Promise.all` to reject only with the rejected result of that promise.

## How to pass sync and async validations?

Unlike other libraries, sync and async validators are passed together in the same object. Formz will take care of splitting them for you according to the returned value.

## I have async validation, how do I know it is processing?

Each field has a `pending` prop that is injected to the rendered component. This prop value will be `true` while validation is in progress.

## Where can I find the results of the validation?

Each field has `errors`, `valid` and `invalid` props.

When validation fails, `valid` will be `false`, `invalid` will be `true` and `errors` will contain an object with the keys of the failed validations with the value `true`. For example:

`errors = { required: true, email: true }` is the result of failed `required` and `email` validators.

When validation passes, `valid` will be `true`, `invalid` will be `false` and `errors` will be an empty object `{}`.
