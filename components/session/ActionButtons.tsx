export const ACTIONS = [
  { label: "Explain Simply", instruction: "Explain the current topic simply." },
  { label: "Give Example", instruction: "Give me a simple example for the current topic." },
  { label: "Quiz Me", instruction: "Quiz me on the current topic. Ask one question only." },
  { label: "Show Steps", instruction: "Show the steps, but ask me to attempt each step first." },
  { label: "Harder Question", instruction: "Give me a harder question." },
  { label: "Easier Question", instruction: "Give me an easier question." },
  { label: "Save as Weak Topic", instruction: "Save the current topic as a weak topic." },
  { label: "Continue", instruction: "Continue the session." },
] as const;

interface ActionButtonsProps {
  onAction: (instruction: string) => void;
  disabled?: boolean;
}

export default function ActionButtons({
  onAction,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {ACTIONS.map(({ label, instruction }) => (
        <button
          key={label}
          type="button"
          onClick={() => onAction(instruction)}
          disabled={disabled}
          className="shrink-0 text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
