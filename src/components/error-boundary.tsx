'use client'

import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
children: ReactNode
fallback?: ReactNode
}

interface ErrorBoundaryState {
hasError: boolean
error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
constructor(props: ErrorBoundaryProps) {
super(props)
this.state = { hasError: false, error: null }
}

static getDerivedStateFromError(error: Error) {
return { hasError: true, error }
}

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
console.error('ErrorBoundary caught:', error, errorInfo)
}

render() {
if (this.state.hasError) {
if (this.props.fallback) return this.props.fallback

return (
<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
<div className="relative">
<div className="animate-morph h-24 w-24 bg-accent/20" />
<div className="absolute inset-0 flex items-center justify-center">
<span className="text-4xl font-bold text-accent">!</span>
</div>
</div>
<h1 className="text-2xl font-bold">Что-то пошло не так</h1>
<p className="max-w-md text-muted-foreground">
Произошла непредвиденная ошибка. Попробуйте обновить страницу.
</p>
<button
onClick={() => {
this.setState({ hasError: false, error: null })
window.location.reload()
}}
className="btn-primary"
>
Обновить страницу
</button>
</div>
)
}

return this.props.children
}
}
