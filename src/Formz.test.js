import React from 'react';
import ReactDOM from 'react-dom';
import Formz from './Formz';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const component = ReactDOM.render(<Formz render='div' />, div);
  ReactDOM.unmountComponentAtNode(div);
});
