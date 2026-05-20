'use client'

import { useUIStore } from '@/stores/ui-store'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { Scene3D } from '@/components/exhibition/scene-3d'
import { Gallery25D } from '@/components/exhibition/gallery-25d'
import { ExhibitionHeader } from '@/components/exhibition/exhibition-header'
import { TicketPanel } from '@/components/exhibition/ticket-panel'
import { ArtworkModal } from '@/components/exhibition/artwork-modal'
import { ExhibitionArtworkProvider } from '@/components/exhibition/exhibition-artwork-context'
import { ModeAnnouncer } from '@/components/layout/mode-announcer'
import type { ArtworkWithArtist } from '@/lib/db/types'
import type { TicketDto } from '@/lib/api/types'

interface ExhibitionViewProps {
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
  artworks: ArtworkWithArtist[]
  tickets: TicketDto[]
}

export function ExhibitionView({
  exhibition,
  artworks,
  tickets,
}: ExhibitionViewProps) {
  const { mode } = useUIStore()

  useDeviceDetection()

  return (
    <ExhibitionArtworkProvider artworks={artworks}>
      <div className="flex flex-col">
        <ModeAnnouncer />
        <ExhibitionHeader exhibition={exhibition} />

        <div className="relative min-h-[70vh]">
          {mode === '3d' ? (
            <Scene3D
              artworks={artworks as unknown as Record<string, unknown>[]}
              exhibitionId={exhibition.id}
            />
          ) : (
            <Gallery25D
              artworks={artworks as unknown as Record<string, unknown>[]}
              exhibitionId={exhibition.id}
            />
          )}
        </div>

        <TicketPanel tickets={tickets} exhibitionTitle={exhibition.title} />
        <ArtworkModal />
      </div>
    </ExhibitionArtworkProvider>
  )
}
