
# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.5] - 2022-01-30

Version [2.0.4] was accidentally published with old build of [2.0.3].

## [2.0.4] - 2022-01-30

### Fixed

- `formz`
  - Form submit caused error if `onSubmitSuccess` or `onSubmitError` was not provided. 

## [2.0.3] - 2022-01-27

### Fixed

- `formz`
  - Calling `onSubmitSuccess` / `onSubmitError` caused an unmounted component state change if the `Form` component was unmounted during that time (for example, navigating to another page). 

## [2.0.2] - 2022-01-26

### Fixed

- `formz`
  - When a field value as set to falsy value (`''`, `0` etc.) with a native event (`input` onChange for example), the value would become the event object resulting in an `[Object object]` text in the input.

## [2.0.1] - 2022-01-24

### Fixed

- `formz`
  - Fixed `README.md` file in the `npm` package

## [2.0.0] - 2022-01-24

A new version of `Formz` built on top of React hooks and context API with an even smaller footprint than before!

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