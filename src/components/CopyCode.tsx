type CopyCodeProps = {
  text: string;
  className?: string;
};

export function CopyCode({ text, className }: CopyCodeProps) {
  return <code className={className}>{text}</code>;
}
