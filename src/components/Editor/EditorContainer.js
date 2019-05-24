import { ContentState, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { removeAllInlineStyles } from 'draftjs-utils';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import Editor from './Editor.js';
import './Editor.scss';



export default class EditorContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      showToolbar: false,
      toolbarPosition: {},
      loading: true,
      highlightedTexts: {},
      editorScrollTop: 0
    };

  }

  async componentDidMount() {
    // After first mount, fetch the initial text
    const text = await this.getText();
    
    this.setState({
      editorState: EditorState.createWithContent(ContentState.createFromText(text)),
      loading: false
     });
  }

  /*
    Makes a simple request to advices lip to get a random advice to use as initial content
  */
  getText = async () => {
    const text = await fetch('https://api.adviceslip.com/advice').then(async (data) => {
      var json = await data.json();
      return json.slip.advice;
    }).catch((err) => {
      console.error('Request error: ', err);

      // Fallback
      return 'Always have a fallback in case something goes wrong.';
    });

    return text;
  }

  /* 
    Check wheter there is or isn't some text selected in the editor.
  */
  editorHasSelection = () => {
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    
    return (
      selection.hasFocus && document.getSelection().toString().trim().length > 0
    )
  }

  /* 
    Defines if toolbar should be visible and, if so, in which position
  */
  setToolbarState = () => {
   const showToolbar = this.editorHasSelection();
   let position = this.state.toolbarPosition;

   // Only calculate position if toolbar will be shown
   if (showToolbar) {
      const range = document.getSelection().getRangeAt(0);
      const rangeRect = range.getBoundingClientRect();
      const editorNode = document.querySelector('#editor');

      // Define 'top' attribute limits.
      let ideal = rangeRect.top;
      let min = editorNode.offsetTop;
      let max = editorNode.offsetTop + editorNode.offsetHeight + 45;

      // Get better top
      let top = Math.max(min, Math.min(max, ideal));

      position = {
        top: top + (isMobile ? 20 : -45),
        left: rangeRect.right - (rangeRect.width / 2) - 45
      }
    }

    this.setState({
      showToolbar,
      toolbarPosition: position,
    });
  }

  /* 
    Triggered by any change on DraftJS, after setting new state check 
    if toolbar should be displayed
  */
  onChange = (editorState) => {
    this.setState({
      editorState
    }, () => {
      setTimeout(() => {
        this.setToolbarState();
        this.setHighlightedSpans();
      }, 100)
    });
  }

  /* 
    DraftJS wont allow deep inline style removing -- will only apply to whole selection
    with this it's possible to remove all inlinestyles after removing from upper level
    and ensuring they wont mix.
  */
  invalidateDeepStyles = (editorState, styles) => {
    for (let style of Object.keys(styles)) {
      editorState = RichUtils.toggleInlineStyle(editorState, style);
      editorState = RichUtils.toggleInlineStyle(editorState, style);
    }

    return editorState;
  }

  /* 
    Remove current inline styles on draft selection range and, 
    if specified, apply a new style.
  */
  setStyle = (style) => {
    let { editorState } = this.state;

    editorState = removeAllInlineStyles(editorState);
    editorState = this.invalidateDeepStyles(editorState, customStyles);
    
    // If specified, set an inline style for selection
    if (style) {
      editorState = RichUtils.toggleInlineStyle(editorState, style);
    }

    // Set changes
    this.onChange(editorState);
  }

  /*
    Reset toolbar and highlighted texts; Set a new content with to draft js.
  */
  reset = () => {
    this.setState({
      loading: true,
    }, async () => {
      const newText = await this.getText();

      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(newText)),
        showToolbar: false,
        toolbarPosition: {},
        loading: false,
        highlightedTexts: {},
      });
    })
  }

  setHighlightedSpans = () => {
    // Abusing selectors a little bit.
    // Will select all span tags that are stylized inside draft JS.
    let spanSelector = document.querySelectorAll(
      '.editor span[data-offset-key][style]:not([style=""])'
    );

    spanSelector = Array.from(spanSelector);

    let highlightedTexts = {};

    for (let span of spanSelector) {
      if (highlightedTexts[span.style.backgroundColor] === undefined) {
        highlightedTexts[span.style.backgroundColor] = [];
      }

      highlightedTexts[span.style.backgroundColor].push({
        text: span.textContent,
        key: span.dataset.offsetKey,
      });
    }

    this.setState({
      highlightedTexts
    })

  }

  render() {
    const {
      editorState,
      showToolbar,
      toolbarPosition, 
      loading,
      highlightedTexts,
    } = this.state;

    const {
      setStyle,
      setToolbarState,
      onChange,
      reset
    } = this;

    return (
      <Editor editorState={editorState} showToolbar={showToolbar}
        toolbarPosition={toolbarPosition} highlightedTexts={highlightedTexts}
        loading={loading} setStyle={setStyle} setToolbarState={setToolbarState}
        onChange={onChange} reset={reset} />
    );
  }
}


const HighlightedList = ({highlightedTexts}) => {
  const content = Object.keys(highlightedTexts).map((key, i) => {
      return (
        <li key={i} className={customStylesReverseMapping[key]}>
          <span>{customStylesReverseMapping[key]}</span>
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

const customStyles = {
  'red': 'rgb(249, 85, 85)',
  'yellow': 'rgb(236, 236, 0)',
  'green': 'rgb(52, 197, 52)',
}

const customStylesReverseMapping = {};
const styleMap = {};

for (let styleName of Object.keys(customStyles)) {
  let styleValue = customStyles[styleName];

  customStylesReverseMapping[styleValue] = styleName;
  styleMap[styleName] = { backgroundColor: styleValue };
}