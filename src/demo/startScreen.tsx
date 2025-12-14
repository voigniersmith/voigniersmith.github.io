import TerminalController from "./terminalController";

interface StartScreenProps {
  isExpanding?: boolean;
}

const StartScreen = (props: StartScreenProps) => {
  const isExpanding = props.isExpanding ?? false;

  return (
    <div style={{
      width: '100%',
      height: '100%'
    }}>
      <TerminalController shouldAnimate={isExpanding} />
    </div>
  );
};

export default StartScreen;
