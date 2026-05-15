'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Palette, Loader2, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type RegisterRole = 'visitor' | 'artist'

export default function LoginPage() {
const { setUser } = useAuthStore()
const router = useRouter()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [isSignUp, setIsSignUp] = useState(false)
const [registerRole, setRegisterRole] = useState<RegisterRole>('visitor')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
setError('')
setLoading(true)

try {
const supabaseModule = await import('@/lib/supabase/client')
if (!supabaseModule.hasSupabaseConfig()) {
throw new Error('Supabase пока не подключен. Используйте демо-доступ или добавьте переменные окружения в Vercel.')
}
const supabase = supabaseModule.createClient()

if (isSignUp) {
const { data, error: signUpError } = await supabase.auth.signUp({
email,
password,
})
if (signUpError) throw signUpError
if (data.user) {
const { error: profileError } = await supabase.from('users').upsert({
id: data.user.id,
email: data.user.email ?? email,
role: registerRole,
avatar_url: null,
})
if (profileError) throw profileError
setUser({
id: data.user.id,
email: data.user.email ?? email,
role: registerRole,
avatarUrl: null,
})
}
} else {
const { data, error: signInError } = await supabase.auth.signInWithPassword({
email,
password,
})
if (signInError) throw signInError
if (data.user) {
const { data: profile } = await supabase
.from('users')
.select('*')
.eq('id', data.user.id)
.single()
setUser({
id: data.user.id,
email: data.user.email ?? email,
role: profile?.role ?? 'visitor',
avatarUrl: profile?.avatar_url ?? null,
})
}
}

router.push('/profile')
} catch (err: unknown) {
setError(err instanceof Error ? err.message : 'Ошибка авторизации')
} finally {
setLoading(false)
}
}

const demoUsers = [
{ label: 'Демо: посетитель', role: 'visitor' as const, id: 'demo-user', email: 'demo@neogallery.ru' },
{ label: 'Демо: автор', role: 'artist' as const, id: 'demo-artist', email: 'artist@neogallery.ru' },
{ label: 'Демо: админ', role: 'admin' as const, id: 'demo-admin', email: 'admin@neogallery.ru' },
]

return (
<div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
<div className="absolute inset-0 overflow-hidden">
<div className="animate-morph absolute left-1/4 top-1/3 h-48 w-48 bg-accent/10 blur-[100px]" />
<div className="animate-morph absolute right-1/4 bottom-1/4 h-64 w-64 bg-accent/5 blur-[120px]" style={{ animationDelay: '3s' }} />
</div>

<motion.div
initial={{ opacity: 0, y: 30, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
className="relative z-10 w-full max-w-md"
>
<div className="mb-8 text-center">
<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 animate-pulse-glow"
>
<Palette className="h-7 w-7 text-accent" />
</motion.div>
<motion.h1
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.3 }}
className="text-3xl font-bold"
>
{isSignUp ? 'Регистрация' : 'Вход'}
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="mt-2 text-sm text-muted-foreground"
>
Войдите в мир цифрового искусства
</motion.p>
</div>

<div className="glass rounded-2xl p-6 shadow-[0_0_40px_rgba(124,91,245,0.08)]">
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
<motion.div
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.3 }}
>
<label className="mb-1 block text-sm font-medium" htmlFor="email">
Email
</label>
<div className="relative">
<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<input
id="email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(124,91,245,0.1)]"
placeholder="your@email.com"
required
/>
</div>
</motion.div>

<motion.div
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.4 }}
>
<label
className="mb-1 block text-sm font-medium"
htmlFor="password"
>
Пароль
</label>
<div className="relative">
<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<input
id="password"
type={showPassword ? 'text' : 'password'}
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(124,91,245,0.1)]"
placeholder="••••••••"
required
minLength={6}
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
>
{showPassword ? (
<EyeOff className="h-4 w-4" />
) : (
<Eye className="h-4 w-4" />
)}
</button>
</div>
</motion.div>

<AnimatePresence>
{isSignUp && (
<motion.div
initial={{ opacity: 0, y: -8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
>
<label className="mb-2 block text-sm font-medium">
Тип аккаунта
</label>
<div className="grid grid-cols-2 gap-2">
{[
{ value: 'visitor' as const, label: 'Посетитель' },
{ value: 'artist' as const, label: 'Автор' },
].map((role) => (
<button
key={role.value}
type="button"
onClick={() => setRegisterRole(role.value)}
className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
registerRole === role.value
? 'border-accent bg-accent/10 text-accent'
: 'border-border bg-background/40 text-muted-foreground hover:text-foreground'
}`}
>
<UserCheck className="h-4 w-4" />
{role.label}
</button>
))}
</div>
</motion.div>
)}
</AnimatePresence>

<AnimatePresence>
{error && (
<motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive"
>
{error}
</motion.div>
)}
</AnimatePresence>

<motion.button
type="submit"
disabled={loading}
whileHover={{ scale: 1.01 }}
whileTap={{ scale: 0.98 }}
className="btn-primary w-full gap-2 py-3 disabled:opacity-50"
>
{loading ? (
<>
<Loader2 className="h-4 w-4 animate-spin" />
Загрузка...
</>
) : isSignUp
? 'Зарегистрироваться'
: 'Войти'}
</motion.button>
</form>

<p className="mt-6 text-center text-sm text-muted-foreground">
{isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
<button
onClick={() => {
setIsSignUp(!isSignUp)
setError('')
}}
className="font-medium text-accent transition-colors hover:text-accent/80"
>
{isSignUp ? 'Войти' : 'Регистрация'}
</button>
</p>

<div className="mt-6 border-t border-border/50 pt-6">
<p className="mb-3 text-center text-xs text-muted-foreground">
Демо-доступ работает без Supabase, а полноценная регистрация включится после добавления ключей Supabase в Vercel:
</p>
<div className="flex flex-col gap-2">
{demoUsers.map((demo, i) => (
<motion.button
key={demo.role}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.6 + i * 0.1 }}
onClick={() => {
setUser({
id: demo.id,
email: demo.email,
role: demo.role,
avatarUrl: null,
})
router.push('/profile')
}}
className="btn-secondary w-full py-2 text-sm transition-all hover:border-accent/30 hover:shadow-[0_0_15px_rgba(124,91,245,0.08)]"
>
{demo.label}
</motion.button>
))}
</div>
</div>
</div>
</motion.div>
</div>
)
}
