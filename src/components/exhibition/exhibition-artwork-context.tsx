'use client'

import { createContext, useContext } from 'react'
import type { ArtworkWithArtist } from '@/lib/db/types'

const ExhibitionArtworkContext = createContext<ArtworkWithArtist[]>([])

export function ExhibitionArtworkProvider({
  artworks,
  children,
}: {
  artworks: ArtworkWithArtist[]
  children: React.ReactNode
}) {
  return (
    <ExhibitionArtworkContext.Provider value={artworks}>
      {children}
    </ExhibitionArtworkContext.Provider>
  )
}

export function useExhibitionArtworks() {
  return useContext(ExhibitionArtworkContext)
}
