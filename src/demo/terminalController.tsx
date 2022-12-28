import { useEffect, useState } from 'react';
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from '../terminal/terminal';
import {
  help,
  dir,
  dir_type,
  start,
  floppy19,
  bash42,
  butterfly19,
  omega7,
  xinu8,
  chessboard,
  resume,
  me41,
  me81,
  raspberrypi11
} from '../data/index';
import {
  bugdetectDes,
  chessDes,
  cryptocalcDes,
  moodifyDes,
  mymallocDes,
  omiliaDes,
  pagingDes,
  pppsDes, shellDes, voigniersmithDes
} from '../data/descripts';

const TerminalController = (props = {}) => {
  const [colorMode, setColorMode] = useState(ColorMode.Dark);
  const [lineData0, setLineData0] = useState([<TerminalOutput />]);
  const [lineData1, setLineData1] = useState([<TerminalOutput />]);
  const [curdir, setCurdir] = useState('~');
  const [promptStr, setPromptStr] = useState('$');
  
  const [toPrint, setToPrint] = useState(start);
  const [charToPrint, setCharToPrint] = useState(0);
  const [lineToPrint, setLineToPrint] = useState(0);

  function printLines(flag: Boolean, speed: number) {
    if (!flag) {
      if (lineToPrint >= toPrint.length) {
        return;
      }

      setTimeout(() => {
        printLines(true, speed);
        if (charToPrint < toPrint[lineToPrint].length) {
          setCharToPrint(charToPrint + 1);
        } else {
          setCharToPrint(0);
          setLineToPrint(lineToPrint + 1);
        }
      }, speed);
      return;
    }

    let ld;
    if (charToPrint > 0) {
      ld = lineData0.slice(0,-1);
    } else {
      ld = [...lineData0];
    }

    const element = toPrint[lineToPrint].substring(0, charToPrint);
    if (charToPrint === toPrint[lineToPrint].length) {
      ld.push(<TerminalOutput>{element}</TerminalOutput>)
    } else {
      ld.push(<TerminalOutput>{element + "█"}</TerminalOutput>);
    }
    setLineData0(ld);
  }

  function fileCheck(str: string) {
    const arr = dir[curdir as keyof dir_type];
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      if (str.localeCompare(element) === 0) {
        return str;
      }
    }
    return;
  }

  function dirCheck(dirStr: string) {
    const arr = dir['~' as keyof dir_type];

    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      if (dirStr.localeCompare(element) === 0) {
        return dirStr;
      }
    }

    return;
  }

  useEffect(() => {
    printLines(false, 15);
  });

  function argParser (input: string) {
    let ld = [...lineData0];

    if (input.toLocaleLowerCase().trim() === 'view-source') {
      window.open('https://github.com/voigniersmith/voigniersmith.github.io', '_blank');
    } else if (input.toLocaleLowerCase().trim() === 'hello there') {
      ld.push(<TerminalOutput>{' '}</TerminalOutput>);
      ld.push(<TerminalOutput>General Kenobi...</TerminalOutput>)
    } else if (input.toLocaleLowerCase().trim() === 'view-react-docs') {
      window.open('https://reactjs.org/docs/getting-started.html', '_blank');
    } else if (input.toLocaleLowerCase().trim() === 'clear') {
      ld = [];
      setTimeout(() => {
        setLineData1([]);
      }, 2);
    } else if (input.toLocaleLowerCase().trim() === 'help') {
      // Reset for pretty
      ld = [];

      setTimeout(() => {
        setCharToPrint(0);
        setLineToPrint(0);
        setToPrint(help);
        printLines(false, 10);
      }, 1);
    } else if (input.substring(0, 4).toLocaleLowerCase().trim() === 'echo') {
      ld.push(<TerminalOutput>{' '}</TerminalOutput>);
      ld.push(<TerminalOutput>{input.substring(5)}</TerminalOutput>)
    } else if (input.toLocaleLowerCase().trim() === 'ls') {
      ld.push(<TerminalOutput>{' '}</TerminalOutput>);
      ld.push(<TerminalOutput>{curdir + "/"}</TerminalOutput>);
      dir[curdir as keyof dir_type].forEach((d) => {
        ld.push(<TerminalOutput>{"  " + d}</TerminalOutput>);
      })
    } else if (input.substring(0,2).toLocaleLowerCase().trim() === 'cd') {
      const directory = input.substring(3);
      if (!directory || directory.toLocaleLowerCase().trim() === '.') {
        // do nothing
      } else if (directory.toLocaleLowerCase().trim() === '..') {
        setCurdir('~');
      } else {
        const file = dirCheck(directory);
        if (file) {
          setCurdir('~/' + directory);
        } else {
          ld.push(<TerminalOutput>{' '}</TerminalOutput>);
          ld.push(<TerminalOutput>cd: no such file or directory</TerminalOutput>)
        }
      }
    } else if (input.toLocaleLowerCase().trim() === 'start') {
      // Reset for pretty
      setLineData0([]);

      setTimeout(() => {
        setCharToPrint(0);
        setLineToPrint(0);
        setToPrint(start);
        printLines(false, 10);
      }, 1);
    } else if (input.toLocaleLowerCase().trim() === 'time') {
      const d = new Date();
      let time = d.toISOString();
      ld.push(<TerminalOutput>{time}</TerminalOutput>)
    } else if (input.substring(0, 5).toLocaleLowerCase().trim() === 'theme') {
      const theme = input.substring(6);
      if (theme.toLocaleLowerCase().trim() === 'light') {
        setColorMode(ColorMode.Light);
      } else if (theme.toLocaleLowerCase().trim() === 'dark') {
        setColorMode(ColorMode.Dark);
      }
    } else if (input.toLocaleLowerCase().trim() === 'pwd') {
      ld.push(<TerminalOutput>{' '}</TerminalOutput>);
      ld.push(<TerminalOutput>{curdir}</TerminalOutput>);
    } else if (input.toLocaleLowerCase().trim().substring(0,3) === 'cat') {
      const file = fileCheck(input.toLocaleLowerCase().substring(3).trim());
      if (file) {
        // Reset for pretty
        ld = [];

        // Ensure update happens w/ timeout
        setTimeout(() => {
          setCharToPrint(0);
          setLineToPrint(0);
          if (file === "ppps.cpp") {
            setToPrint(pppsDes);
          } else if (file === "shell.cpp" || file === "bash42") {
            setToPrint([...bash42, " ", ...shellDes]);
          } else if (file === "omilia.js" || file === "omega7") {
            setToPrint([...omega7, " ", ...omiliaDes]);
          } else if (file === "mymalloc.c" || file === "floppy19") {
            setToPrint([...floppy19, " ", ...mymallocDes]);
          } else if (file === "bugdetect.java" || file === "butterfly19") {
            setToPrint([...butterfly19, " ", ...bugdetectDes]);
          } else if (file === "voigniersmith.js") {
            setToPrint(voigniersmithDes);
          } else if (file === "paging.c") {
            setToPrint(pagingDes);
          } else if (file === "chess.c" || file === "chessboard") {
            setToPrint([...chessboard, " ", ...chessDes]);
          } else if (file === "cryptocalc.py") {
            setToPrint(cryptocalcDes);
          } else if (file === "moodify.js") {
            setToPrint(moodifyDes);
          } else if (file === "xinu.c" || file === "xinu8") {
            setToPrint([...xinu8]);
          } else if (file === "resume.txt" || file === "resume") {
            setToPrint(resume);
          } else if (file === "me81") {
            setToPrint(me81);
          } else if (file === "me41") {
            setToPrint(me41);
          } else if (file === "raspberrypi11") {
            setToPrint(raspberrypi11);
          }
          printLines(false, 2);
        }, 1);
      } else {
        ld.push(<TerminalOutput>cat: No such file</TerminalOutput>)
      }
    } else if (input.toLocaleLowerCase().trim() === 'whoami') {
      setCharToPrint(0);
      setLineToPrint(0);
      setToPrint(me41);
      printLines(false, 1);
    } else if (input.toLocaleLowerCase().substring(0,2).trim() === 'ps') {
      setPromptStr(input.substring(3));
      document.getElementsByClassName('react-terminal-input::before')[0]?.setAttribute('content', input.substring(3));
    } else if (input.toLocaleLowerCase().substring(0,2).trim() === 'ln') {
      const file = fileCheck(input.toLocaleLowerCase().substring(3).trim());
      if (file) {
        // Ensure update happens w/ timeout
        if (file === "ppps.cpp") {
          window.open('https://github.com/voigniersmith/CS535FinalProject', '_blank');
        } else if (file === "shell.cpp" || file === "bash42") {
          window.open('https://github.com/voigniersmith/Shell', '_blank');
        } else if (file === "omilia.js" || file === "omega7") {
          window.open('https://github.com/voigniersmith/omilia', '_blank');
        } else if (file === "mymalloc.c" || file === "floppy19") {
          window.open('https://github.com/voigniersmith/myMalloc', '_blank');
        } else if (file === "bugdetect.java" || file === "butterfly19") {
          window.open('https://github.com/voigniersmith/clang-bug-detector', '_blank');
        } else if (file === "voigniersmith.js") {
          window.open('https://github.com/voigniersmith/voigniersmith.github.io', '_blank');
        } else if (file === "paging.c") {
          window.open('https://github.com/voigniersmith/pagingx86', '_blank');
        } else if (file === "chess.c" || file === "chessboard") {
          window.open('https://github.com/voigniersmith/parallel_chess', '_blank');
        } else if (file === "cryptocalc.py") {
          window.open('https://github.com/voigniersmith/cs555-algorand-mpc', '_blank');
        } else if (file === "moodify.js") {
          window.open('https://github.com/nguyldo/moodify', '_blank');
        } else if (file === "xinu.c" || file === "xinu8") {
          window.open('https://xinu.cs.purdue.edu', '_blank');
        } else if (file === "resume.txt" || file === "resume") {
          window.open('https://docs.google.com/document/d/1EPNoUclm8Qs0Vbad_wvpiwvWjLRynip3JYSporWPdGM/edit?usp=sharing', '_blank');
        } else if (file === "me81") {
          window.open('https://www.instagram.com/andrewnook4/', '_blank');
        } else if (file === "me41") {
          window.open('https://www.instagram.com/andrewnook4/', '_blank');
        } else if (file === "raspberrypi11") {
          window.open('https://www.raspberrypi.org', '_blank');
        } else if (file === "gmail") {
          window.location.href = 'mailto:voigniersmith@gmail.com';
        } else if (file === "school_email") {
          window.location.href = 'mailto:smit3407@purdue.edu';
        } else if (file === "instagram") {
          window.open('https://www.instagram.com/andrewnook4/', '_blank');
        } else if (file === "github") {
          window.open('https://github.com/voigniersmith', '_blank');
        } else if (file === "linkedin") {
          window.open('https://www.linkedin.com/in/voigniersmith/', '_blank');
        } else if (file === "README.md") {
          window.open('https://www.github.com/voigniersmith/voigniersmith.github.io', '_blank');
        }
      } else {
        ld.push(<TerminalOutput>ln: No associated link with file</TerminalOutput>)
      }
    } else if (input) {
      ld.push(<TerminalOutput>{' '}</TerminalOutput>);
      ld.push(<TerminalOutput>{"command not found: " + input}</TerminalOutput>);
    }
    setLineData0(ld);
  }

  function onInput0 (input: string) {
    let ld = [...lineData0];
    ld.push(<TerminalInput>{promptStr + ' ' + input}</TerminalInput>);
    
    argParser(input);

    setLineData0(ld);
  }

  function onInput1 (input: string) {
    let ld = [...lineData1];
    ld.push(<TerminalInput>{promptStr + ' ' + input}</TerminalInput>);
    
    argParser(input);

    setLineData1(ld);
  }

  return (
    <div className="container" >
      <Terminal name='React Terminal UI 0' colorMode={ colorMode }  onInput={ onInput0 } num={0} prompt={promptStr} curdir={curdir}>
        {lineData0}
      </Terminal>
      <Terminal name='React Terminal UI 1' colorMode={ colorMode }  onInput={ onInput1 } num={1} prompt={promptStr} curdir={curdir}>
        {lineData1}
      </Terminal>
    </div>
  );
};

export default TerminalController;