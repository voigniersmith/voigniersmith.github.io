import { useEffect, useState, KeyboardEvent } from "react";
import StartScreen from "./startScreen";
import TerminalController from "./terminalController";

const ScreenState = (props = {}) => {
    const [state, setState] = useState(<StartScreen />);
    const [initEnter, setInitEnter] = useState(false);

    function switchScreen () {
        setState(<TerminalController />);
    }

    const handleKeyboardInput = (event: KeyboardEvent<HTMLInputElement>) => {
        if (initEnter) return;

        event.preventDefault();

        switchScreen();
        setInitEnter(true);
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyboardInput as any);
        return () => {
            document.removeEventListener("keydown", handleKeyboardInput as any);
        };
    });

    return state;
}

export default ScreenState;