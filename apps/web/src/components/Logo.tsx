interface LogoProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function Logo({ variant = 'light', className = '' }: LogoProps) {
  return (
    <span
      className={`text-lg font-extrabold tracking-tight ${
        variant === 'light' ? 'text-white' : 'text-ink-950'
      } ${className}`}
    >
      Festiv<span className="text-accent-400">'</span>Guinée
    </span>
  )
}