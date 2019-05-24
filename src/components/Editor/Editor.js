import React from 'react';

import EditorToolbar from 'components/EditorToolbar';
import { Editor as Draft } from 'draft-js';

import './Editor.scss';
import 'draft-js/dist/Draft.css'; 

export default ({
  editorState,
  showToolbar,
  toolbarPosition,
  highlightedTexts,
  loading,
  setStyle,
  setToolbarState,
  onChange,
  reset,
  styleMap,
}) => (
  <div className='editor-wrapper'>
    <Loader show={loading} />

    <EditorToolbar editorState={editorState} setStyle={setStyle}
      showToolbar={showToolbar} toolbarPosition={toolbarPosition} styleMap={styleMap} />
    
    <div id='editor' className='editor' onScroll={setToolbarState}>
      <Draft stripPastedStyles={true} customStyleMap={styleMap} editorState={editorState}
        onChange={onChange} placeholder='Type something to start highlighting' />
    </div>
    
    <p className='text-origin'>
      Text provided by <a href='https://adviceslip.com/' target='_blank'
        rel='noopener noreferrer' alt='Advices Lip'>Advices Lip</a>
    </p>

    <button onClick={reset} disabled={loading}>Reset</button>

    <HighlightedList highlightedTexts={highlightedTexts} styleMap={styleMap} />
  </div>
)

const Loader = ({show}) =>
  show ? (
    <div className='loading'>
      <div className='loader'>
        {/* Needed elements to render loader properly */}
        <div></div><div></div><div></div><div></div>
      </div>
    </div>
  ) : null

const HighlightedList = ({ highlightedTexts, styleMap }) => {
  const content = Object.keys(highlightedTexts).map((key, i) => {
      return (
        <li key={i} className={styleMap[key]}>
          <span>{styleMap[key]}</span>
          <ul>
            {
              highlightedTexts[key].map((span, k) => {
                return <li key={k}>{span.text}</li>
              })
            } 
          </ul>
      </li>
      )
  });

  return (
   <div className='highlighted-list'>
    <ul>
      { content.length > 0 ? content : <li>Nothing highlighted</li>}
    </ul>
   </div>
  )
}