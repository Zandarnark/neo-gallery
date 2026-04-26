import { notFound } from 'next/navigation'
import { mockExhibitions, mockArtworks, mockTickets } from '@/lib/mock-data'
import { ExhibitionView } from '@/components/exhibition/exhibition-view'

export function generateStaticParams() {
  return mockExhibitions.map((e) => ({ slug: e.slug }))
}

export default async function ExhibitionPage({
  params,
}: {
  params: { slug: string }
}) {
  const exhibition = mockExhibitions.find((e) => e.slug === params.slug)
  if (!exhibition) notFound()

  const artworks = mockArtworks.filter(
    (a) => a.exhibition_id === exhibition.id
  )
  const tickets = mockTickets.filter(
    (t) => t.exhibition_id === exhibition.id
  )

  return (
    <ExhibitionView
      exhibition={exhibition}
      artworks={artworks}
      tickets={tickets}
    />
  )
}
