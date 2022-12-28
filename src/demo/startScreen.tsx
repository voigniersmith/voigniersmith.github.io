import { me81 } from "../data";
import Terminal, { TerminalOutput } from "../terminal/terminal";

function printMe () {
  const arr = [];
  for (let i = 0; i < me81.length - 1; i++) {
    arr.push(<TerminalOutput>{me81[i]}</TerminalOutput>)
  }
  return arr;
}

const StartScreen = () => {
  return (
    <div>
      <div className="container" >
        <Terminal name='React Terminal UI 0' num={2} prompt={''}>
          <p />
          { printMe() }
          <h1>Hello, World!</h1>
          <p>Press Any Key to Start</p>
        </Terminal>
      </div>
    </div>
  );
};

export default StartScreen;