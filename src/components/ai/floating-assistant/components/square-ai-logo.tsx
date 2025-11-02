interface SquareAILogoProps {
  className?: string;
  size?: number;
}

export function SquareAILogo({ className, size = 32 }: SquareAILogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Square AI Logo"
      width={size}
      height={size}
      className={className}
    />
  );
}
