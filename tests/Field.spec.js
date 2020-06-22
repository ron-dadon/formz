import React from 'react'
import './init'
import { shallow, mount } from 'enzyme'
import fieldComponentFactory from '../src/lib/components/Field'

const FieldRenderComponent = () => <div />

const formzFunctions = {
  registerField: jest.fn(),
  unregisterField: jest.fn(),
  isRegistered: jest.fn(() => true),
  resetField: jest.fn(),
  updateField: jest.fn(),
  updateFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  setFieldActive: jest.fn(),
  getField: jest.fn(() => ({})),
  formValues: jest.fn(),
  getFormState: jest.fn(() => ({})),
  submit: jest.fn(),
  reset: jest.fn()
}

const Field = fieldComponentFactory(formzFunctions)

const renderField = (props) => mount(<Field name='test' render={FieldRenderComponent} {...props} />)

describe('Field component', () => {
  beforeEach(() => {
    Object.values(formzFunctions).forEach(mockFn => mockFn.mockClear())
  })

  it('should call registerField on componentDidMount', () => {
    renderField()
    expect(formzFunctions.registerField).toHaveBeenCalled()
  })

  it('should call updateField on componentDidUpdate', () => {
    const comp = renderField()
    comp.setProps({ newProp: true })
    expect(formzFunctions.updateField).toHaveBeenCalled()
  })

  it('should call unregisterField on componentWillUnmount', () => {
    const comp = renderField()
    comp.unmount()
    expect(formzFunctions.unregisterField).toHaveBeenCalled()
  })

  it('should check if registered when rendering', () => {
    renderField()
    expect(formzFunctions.isRegistered).toHaveBeenCalledWith('test')
  })

  it('should call getField when rendering', () => {
    renderField()
    expect(formzFunctions.getField).toHaveBeenCalledWith('test')
  })

  it('should render FieldRenderComponent', () => {
    const comp = renderField()
    expect(comp.find('FieldRenderComponent').length).toEqual(1)
  })

  it('should create debounce onChange function', () => {
    const comp = renderField({ debounce: true })
    expect(comp.instance().debouncedOnChange).toBeDefined()
  })

  describe('Field injected props', () => {
    const comp = renderField()
    const compInstance = comp.instance()
    const renderedComponent = comp.find('FieldRenderComponent').get(0)

    it('should pass field properties', () => {
      expect(renderedComponent.props.onChange).toBe(compInstance.onChange)
      expect(renderedComponent.props.onFocus).toBe(compInstance.onFocus)
      expect(renderedComponent.props.onBlur).toBe(compInstance.onBlur)
      expect(renderedComponent.props.reset).toBe(compInstance.reset)
    })
  })

  describe('Debounced Field injected props', () => {
    const props = { debounce: true }
    const comp = renderField(props)
    const compInstance = comp.instance()
    const renderedComponent = comp.find('FieldRenderComponent').get(0)

    it('should pass field properties', () => {
      expect(renderedComponent.props.onChange).toBe(compInstance.debouncedOnChange)
      expect(renderedComponent.props.onFocus).toBe(compInstance.onFocus)
      expect(renderedComponent.props.onBlur).toBe(compInstance.onBlur)
      expect(renderedComponent.props.reset).toBe(compInstance.reset)
    })
  })
})

