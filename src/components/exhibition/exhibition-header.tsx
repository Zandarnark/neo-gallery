import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ExhibitionHeaderProps {
  exhibition: {
    id: string
    title: string
    slug: string
    status: string
    start_date: string
    end_date: string | null
    cover_url: string | null
    description: string | null
  }
}

export function ExhibitionHeader({ exhibition }: ExhibitionHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/exhibitions"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Все выставки
        </Link>
        <h1 className="mb-2 text-3xl font-bold">{exhibition.title}</h1>
        {exhibition.description && (
          <p className="mb-3 max-w-2xl text-muted-foreground">
            {exhibition.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(exhibition.start_date).toLocaleDateString('ru-RU')} —{' '}
          {exhibition.end_date
            ? new Date(exhibition.end_date).toLocaleDateString('ru-RU')
            : 'Бессрочно'}
        </div>
      </div>
    </div>
  )
}
