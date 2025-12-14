import AnsiText from './AnsiText';

const TerminalOutput = ({children} : {children?: any}) => {
  // If children is a string with ANSI codes, use AnsiText component
  if (typeof children === 'string' && children.includes('\x1b[')) {
    return (
      <div className="react-terminal-line">
        <AnsiText>{children}</AnsiText>
      </div>
    );
  }

  return (
    <div className="react-terminal-line">{ children }</div>
  );
}

export default TerminalOutput;