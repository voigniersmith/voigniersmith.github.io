import { useEffect, useState, useRef, useCallback } from "react";
import StartScreen from "./startScreen";
import { AnimatedTerminalSplit } from "../components/AnimatedTerminalSplit";
import { useTypewriter } from "../hooks/useTypewriter";
import { me81 } from "../data";
import { AnimationSpeed } from "../utils/animationSpeed";
import { initializeStats } from "../utils/visitorStats";
import { recordPageLoad } from "../utils/firebase";

const ScreenState = (props = {}) => {
    const [isExpanding, setIsExpanding] = useState(false);
    const [initEnter, setInitEnter] = useState(false);
    const handleKeyboardRef = useRef<((event: KeyboardEvent) => void) | null>(null);

    // Initialize visitor stats and Firebase tracking on mount
    useEffect(() => {
        initializeStats();
        recordPageLoad();
    }, []);

    // Load me81 startup image
    const { displayLines } = useTypewriter({
        content: me81,
        speed: AnimationSpeed.VERY_SLOW,
        enabled: true,
        lineByLine: true,
    });

    const handleKeyboardInput = useCallback((event: KeyboardEvent) => {
        if (initEnter) return;

        event.preventDefault();

        setIsExpanding(true);
        setInitEnter(true);
    }, [initEnter]);

    // Only listen for keyboard input before expansion
    useEffect(() => {
        if (initEnter) {
            // After init, remove the listener
            if (handleKeyboardRef.current) {
                document.removeEventListener("keydown", handleKeyboardRef.current as any);
                handleKeyboardRef.current = null;
            }
        } else {
            // Before init, add the listener
            handleKeyboardRef.current = handleKeyboardInput;
            document.addEventListener("keydown", handleKeyboardRef.current as any);
            return () => {
                if (handleKeyboardRef.current) {
                    document.removeEventListener("keydown", handleKeyboardRef.current as any);
                }
            };
        }
    }, [initEnter, handleKeyboardInput]);

    // Show startup screen with me81 before expanding
    if (!initEnter) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AnimatedTerminalSplit
                    isExpanding={false}
                    topTerminalContent={displayLines.map((line, i) => (
                        <pre
                            key={i}
                            style={{
                                margin: 0,
                                lineHeight: '1.4'
                            }}
                        >
                            {line}
                        </pre>
                    ))}
                    bottomTerminalContent={null}
                    isBeforeExpansion={true}
                />
            </div>
        );
    }

    return <StartScreen isExpanding={isExpanding} />;
}

export default ScreenState;
