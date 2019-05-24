import React, { Component } from 'react';

import { EditorState } from 'draft-js';
import './EditorToolbar.scss';


export default class EditorToolbar extends Component {

  static defaultProps = {
    editorState: EditorState.createEmpty(),
    setStyle: {},
    showToolbar: false,
    toolbarPosition: {},
    styleMap: {},
  }

  constructor(props) {
    super(props);

    this.state = {
      shouldRender: false
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.showToolbar === true && this.props.showToolbar === false) {
      this.removeElementTimeout = setTimeout(() => {
        this.setState({
          shouldRender: false
        })
      }, 2000);
    } else if (this.props.showToolbar === true && this.state.shouldRender === false) {
      clearInterval(this.removeElementTimeout);

      this.setState({
        shouldRender: true
      });
    }
  }

  render() {
    const { editorState, setStyle, showToolbar, toolbarPosition, styleMap } = this.props;
    let currentStyle = editorState.getCurrentInlineStyle();

    return (
      this.state.shouldRender ?
        <div className={`toolbar ${showToolbar ? 'open' : ''}`} style={toolbarPosition}>
          {Object.keys(styleMap).map((type) =>
            <StyleButton
              key={type}
              active={currentStyle.has(type)}
              onClick={setStyle}
              style={type}
              backgroundColor={styleMap[type].backgroundColor}
            />
          )}
        </div> : null
    )
  }
}

export class StyleButton extends React.Component {

  static defaultProps = {
    active: false,
    style: null,
    onClick: () => {},
    backgroundColor: '',
  }

  onClick = (e) => {
    e.preventDefault();

    const { active, style } = this.props;
    this.props.onClick(active ? null : style);
  }

  render() {
    const { active, backgroundColor } = this.props;
    const className = `style-button ${active ? 'active' : ''}`;
    return (
      <span className={className} style={{backgroundColor}} onMouseDown={this.onClick} />
    );
  }
}