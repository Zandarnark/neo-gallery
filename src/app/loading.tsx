export default function Loading() {
return (
<div className="flex min-h-[60vh] items-center justify-center px-4">
<div className="flex flex-col items-center gap-6">
<div className="relative h-16 w-16">
<div className="absolute inset-0 animate-rotate-slow rounded-full border-2 border-border" />
<div className="absolute inset-0 animate-rotate-slow rounded-full border-2 border-t-accent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
<div className="absolute inset-2 animate-pulse-glow rounded-full bg-accent/10" />
</div>
<div className="flex gap-1">
<span className="h-2 w-2 animate-float rounded-full bg-accent/60" />
<span className="h-2 w-2 animate-float-delayed rounded-full bg-accent/40" />
<span className="h-2 w-2 animate-float rounded-full bg-accent/20" style={{ animationDelay: '0.5s' }} />
</div>
</div>
</div>
)
}
