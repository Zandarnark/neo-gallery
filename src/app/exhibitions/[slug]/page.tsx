import { notFound } from 'next/navigation'
import { ExhibitionView } from '@/components/exhibition/exhibition-view'
import { initializeDatabase } from '@/lib/db/init'
import { getExhibitionBySlug } from '@/lib/db/repositories/exhibitions'

export const dynamic = 'force-dynamic'

export default async function ExhibitionPage({
  params,
}: {
  params: { slug: string }
}) {
  initializeDatabase()
  const data = await getExhibitionBySlug(params.slug)

  if (!data) notFound()

  return (
    <ExhibitionView
      exhibition={data.exhibition}
      artworks={data.artworks}
      tickets={data.tickets}
    />
  )
}
