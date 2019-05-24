import React from 'react';
import ReactDOM from 'react-dom';
import EditorContainer from './EditorContainer';
import renderer from 'react-test-renderer';
import sinon from 'sinon';

 // Mock browser functions
 // js-dom wont support those functions on tests so soon ):
 // https://github.com/jsdom/jsdom/issues/317
 document.getSelection = document.getSelection || (() => {
  return {
    removeAllRanges: () => {},
    getRangeAt: () => {
      return {
        getBoundingClientRect: () => {
          return {}
        }
      }
    }
  };
});

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});

it('renders without crashing', () => {
  sinon.stub(window, 'fetch').resolves({
      json: () => { return { slip: { advice: 'Always write tests' }}}
  });

  const div = document.createElement('div');
  ReactDOM.render(<EditorContainer />, div);
});

it('renders without crashing, even if request fails', () => {
  sinon.stub(window, 'fetch').rejects(404);
  
  const div = document.createElement('div');
  ReactDOM.render(<EditorContainer />, div);
});

it('should be able to reset and its callback without crashing', () => {
  let component = renderer.create(<EditorContainer />);
  let instance = component.getInstance();
  sinon.stub(instance, 'getText').resolves('Mock');

  instance.reset();
});

it('should be able to set style without crashing', (done) => {
  let component = renderer.create(<EditorContainer />);
  component.getInstance().setStyle('red');

  setTimeout(() => {
    done();
  }, 1000)
});

it('should be able to remove style without crashing', () => {
  let component = renderer.create(<EditorContainer />);
  component.getInstance().setStyle(null);
});

it('should be able show toolbar without crashing', () => {
  let component = renderer.create(<EditorContainer />);
  let instance = component.getInstance();

  sinon.stub(instance, 'editorHasSelection').returns(true);

  const editorNode = document.createElement('div');
  editorNode.id = 'editor';
  document.body.appendChild(editorNode);

  instance.setToolbarState();
  expect(instance.state.showToolbar).toBe(true);
});

it('should be able to check selection using document function', () => {
  let component = renderer.create(<EditorContainer />);

  // Stub return value
  component.getInstance().state.editorState.getSelection = () => {
    return {
      hasFocus: true
    };
  }

  component.getInstance().editorHasSelection();
});

it('should be able show highlighted texts without crashing', () => {
  let component = renderer.create(<EditorContainer />);

  // Simulate styled spans inside editor.
  let dummyDiv = document.createElement('div');
  dummyDiv.className = 'editor';
  let dummySpan = document.createElement('span');
  let dummySpan2 = document.createElement('span');

  dummySpan.setAttribute('data-offset-key', 'mock');
  dummySpan.style.backgroundColor = 'red';
  dummySpan2.setAttribute('data-offset-key', 'mock');
  dummySpan2.style.backgroundColor = 'red';

  dummyDiv.appendChild(dummySpan);
  dummyDiv.appendChild(dummySpan2);
  document.body.appendChild(dummyDiv);

  component.getInstance().setHighlightedSpans();
});