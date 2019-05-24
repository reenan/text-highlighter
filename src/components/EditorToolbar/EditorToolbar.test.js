import React from 'react';
import ReactDOM from 'react-dom';
import EditorToolbar, { StyleButton } from './EditorToolbar';
import renderer from 'react-test-renderer';
import { render } from 'react-testing-library';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<EditorToolbar />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('should render properly with shouldRender true/false and showToolbar true/false', () => {
  let component = renderer.create(<EditorToolbar />);
  let tree = component.toJSON();

  expect(tree).toMatchSnapshot();

  component.getInstance().setState({
    shouldRender: true
  })

  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  component = renderer.create(<EditorToolbar showToolbar={true} />);
  component.getInstance().setState({
    shouldRender: true
  })

  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

it('should update shouldRender based on received props without crashing', (done) => {
  const { rerender } = render(<EditorToolbar />)
  rerender(<EditorToolbar showToolbar={true} />);
  rerender(<EditorToolbar showToolbar={false} />);

  setTimeout(() => {
    done();
  }, 2000);
})

it('should render style button without crashing with active true/false', () => {
  let component = renderer.create(<StyleButton />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  component = renderer.create(<StyleButton active />);
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})

it('should be able to click on style button without crashing', () => {
  let component = renderer.create(<StyleButton />);
  component.getInstance().onClick(new Event(null));
})

it('should be able to click on style button with active without crashing', () => {
  let component = renderer.create(<StyleButton active />);
  component.getInstance().onClick(new Event(null));
})


