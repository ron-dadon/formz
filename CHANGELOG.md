# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.6.1] - 2022-10-02

### Added

- `formz`
  - Fix bug where if `focusFirstErrorField` and a field did not pass the `inputProps.ref` to the UI component, there is a `.current of undefined` error.

## [2.6.0] - 2022-09-29

### Added

- `formz`
  - Add `ref` to `useFormzField` under `inputProps` to pass a reference to the field HTML element down
    to the field state.
  - Add `focusFirstErrorField` boolean prop to `Form` component. If the form is invalid during submit, and the field has his `ref` filled, the field will be focused automatically.

## [2.5.0] - 2022-07-14

### Added

- `formz`
  - Add `validate` function on the formz context to allow manual triggering of validation for all
    fields.

## [2.4.0] - 2022-04-11

### Added

- `formz`
  - Add `validateAll` support for a function that will allow skipping or including fields in the
    re-validation.

- `formz-docs`
  - Updated API docs with `validateAll` changes

## [2.3.0] - 2022-04-06

### Added

- `formz`
  - Add `validateAll` support for `useFormField`. When this attribute is `true`, whenever the field
    is validated, all other fields will be validated as well.

- `formz-docs`
  - Updated API docs with `validateAll`
  - Add `validate all` example

## [2.2.0] - 2022-03-14

### Added

- `formz`
  - Formz provider `submit` function now takes 2 arguments: `(event, options)`
  - `submit` can be triggered with `ignoreErrors` option to force calling `onSubmit` even if
    validation error occurred

- `formz-docs`
  - Updated API docs with missing info about `form` and `fields`

## [2.1.1] - 2022-02-20

### Fixed

- `formz`
  - Functions `onChange` and `onBlur` provided by `useFormzField.inputProps` are memoized to prevent
    redundant renders

## [2.1.0] - 2022-02-04

### Added

- `formz`
  - Native submit event is passed to `onSubmit`, `onSubmitSuccess` and `onSubmitError`

### Fixed

- `formz`
  - Validation on blur event triggered with previous value

## [2.0.7] - 2022-01-30

### Fixed

- `formz`
  - Form submit caused error if `onSubmitSuccess` or `onSubmitError` was not provided.

## [2.0.3] - 2022-01-27

### Fixed

- `formz`
  - Calling `onSubmitSuccess` / `onSubmitError` caused an unmounted component state change if
    the `Form` component was unmounted during that time (for example, navigating to another page).

## [2.0.2] - 2022-01-26

### Fixed

- `formz`
  - When a field value as set to falsy value (`''`, `0` etc.) with a native event (`input` onChange
    for example), the value would become the event object resulting in an `[Object object]` text in
    the input.

## [2.0.1] - 2022-01-24

### Fixed

- `formz`
  - Fixed `README.md` file in the `npm` package

## [2.0.0] - 2022-01-24

A new version of `Formz` built on top of React hooks and context API with an even smaller footprint
than before!

### Added

- `formz`
  - Added `useFormz` hook
  - Added `useFormzField` hook
  - Added `useFormzContext` hook

- `formz-utils` **(NEW PACKAGE 🎁)**
  - Added `useFormzDebug` hook to pretty print form events to the console
  - Added `Field` component to allow component based usage of `useFormzField` hook

- `formz-docs` **(NEW PACKAGE 🎁)**
  - Created documentation based on [Storybook](https://storybook.js.org/).

### Changed

- `formz`
  - Removed `Formz` component
  - Field level validation can be only a single function now
  - All validations are considered `async`
  - Validations can run only on `init`, `blur`, `change` and before submit
