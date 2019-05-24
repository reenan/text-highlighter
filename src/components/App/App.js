import React from 'react';
import './App.scss';

import EditorContainer from 'components/Editor';

export default () => {
  return (
    <div className='app'>
      <h1>Highlight Text</h1>
      <p>Highlight selected text</p>
      <EditorContainer />
    </div>
  )
}
