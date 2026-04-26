'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Environment,
  Float,
  Html,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  Text,
  useProgress,
} from '@react-three/drei'
import { useAnalytics } from '@/hooks/use-analytics'
import { useUIStore } from '@/stores/ui-store'
import * as THREE from 'three'

type SpaceTheme = 'pagoda' | 'neon' | 'cosmos'

interface ArtworkData {
  id: string
  title: string
  media_type: string
  thumb_url?: string | null
  file_url?: string | null
  price?: number | null
  license_type?: string | null
  [key: string]: unknown
}

const spaces: { id: SpaceTheme; name: string; description: string }[] = [
  {
    id: 'pagoda',
    name: 'Sakura Pavilion',
    description: 'Гладкий сад-павильон с сакурой и музейным светом',
  },
  {
    id: 'neon',
    name: 'Neon Atrium',
    description: 'Премиальный cyber-музей с голографическими арт-панелями',
  },
  {
    id: 'cosmos',
    name: 'Orbit Museum',
    description: 'Космическая галерея с орбитами, планетами и парящими работами',
  },
]

function createProceduralArtworkTexture(
  artwork: ArtworkData,
  accent: string
): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture()
  }

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 360
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const seed = Array.from(artwork.id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  )

  const palette =
    artwork.media_type === '3d'
      ? ['#180d36', '#6336ff', '#00e6ff', '#ffffff']
      : artwork.media_type === 'video'
      ? ['#210718', '#ff2ed1', '#ff9f1c', '#ffffff']
      : artwork.media_type === 'audio'
      ? ['#03171e', '#00ff9d', '#7df9ff', '#faff00']
      : ['#130d25', '#7c5bf5', '#ff8fc7', '#ffe7b3']

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, palette[0])
  gradient.addColorStop(0.48, palette[1])
  gradient.addColorStop(1, accent)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 18; i++) {
    const x = ((Math.sin(seed + i * 7.13) + 1) / 2) * canvas.width
    const y = ((Math.cos(seed + i * 5.91) + 1) / 2) * canvas.height
    const radius = 35 + ((seed + i * 37) % 190)
    const radial = ctx.createRadialGradient(x, y, 0, x, y, radius)
    radial.addColorStop(0, `${palette[(i % 3) + 1]}dd`)
    radial.addColorStop(1, `${palette[(i % 3) + 1]}00`)
    ctx.fillStyle = radial
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = 'rgba(255,255,255,0.24)'
  ctx.lineWidth = 4
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    const offset = (seed % 120) + i * 72
    ctx.moveTo(-120 + offset, canvas.height + 60)
    ctx.bezierCurveTo(
      220 + offset * 0.4,
      420 - i * 22,
      590 - offset * 0.25,
      245 + i * 19,
      canvas.width + 90,
      -80 + i * 54
    )
    ctx.stroke()
  }

  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(((seed % 24) - 12) * (Math.PI / 180))
  ctx.globalAlpha = 0.42
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 6
  const sides = artwork.media_type === 'audio' ? 32 : artwork.media_type === '3d' ? 7 : 5
  const radius = 80 + (seed % 48)
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides
    const x = Math.cos(a) * radius
    const y = Math.sin(a) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = 'rgba(0,0,0,0.42)'
  ctx.fillRect(0, canvas.height - 170, canvas.width, 170)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 29px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(artwork.title.slice(0, 26), canvas.width / 2, canvas.height - 105)

  ctx.fillStyle = accent
  ctx.font = '700 14px Arial, sans-serif'
  ctx.fillText(artwork.media_type.toUpperCase(), canvas.width / 2, canvas.height - 52)

  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 9
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true

  return texture
}

function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="rounded-2xl border border-white/15 bg-black/70 px-6 py-4 text-center text-white shadow-2xl backdrop-blur-md">
        <div className="mb-3 h-2 w-56 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-300 via-cyan-300 to-amber-200 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Loading gallery
        </p>
        <p className="text-lg font-bold">{Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

function BackgroundImage({
  url,
  position = [0, 4.2, -24],
  size = [34, 19],
  opacity = 0.82,
}: {
  url: string
  position?: [number, number, number]
  size?: [number, number]
  opacity?: number
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()

    loader.load(
      url,
      (loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.anisotropy = 4
        loadedTexture.needsUpdate = true
        setTexture(loadedTexture)
      },
      undefined,
      () => {
        if (!cancelled) {
          setTexture(null)
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [url])

  if (!texture) return null

  return (
    <mesh position={position} renderOrder={-10}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

function LightEnvironmentShell({
  color = '#efd1dc',
  url,
  opacity = 0.62,
}: {
  color?: string
  url?: string
  opacity?: number
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!url) {
      setTexture(null)
      return
    }

    let cancelled = false
    const loader = new THREE.TextureLoader()

    loader.load(
      url,
      (loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.anisotropy = 4
        loadedTexture.wrapS = THREE.RepeatWrapping
        loadedTexture.repeat.x = -1
        loadedTexture.needsUpdate = true
        setTexture(loadedTexture)
      },
      undefined,
      () => {
        if (!cancelled) {
          setTexture(null)
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <mesh position={[0, 4, -10]} scale={[1, 0.58, 1]}>
      <sphereGeometry args={[42, 32, 16]} />
      <meshBasicMaterial
        color={color}
        map={texture || undefined}
        side={THREE.BackSide}
        transparent={Boolean(texture)}
        opacity={texture ? opacity : 1}
        depthWrite={false}
      />
    </mesh>
  )
}

function PolishedColumn({
  position,
  height = 3.2,
  color = '#f0d6ae',
}: {
  position: [number, number, number]
  height?: number
  color?: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.2, height, 18]} />
        <meshStandardMaterial color={color} roughness={0.34} metalness={0.12} />
      </mesh>
      <mesh position={[0, height + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 24]} />
        <meshStandardMaterial color="#d8a55f" roughness={0.28} metalness={0.28} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.16, 24]} />
        <meshStandardMaterial color="#d8a55f" roughness={0.35} metalness={0.22} />
      </mesh>
    </group>
  )
}

function SmoothPavilion({ position = [0, 0, -13] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.65, 2.95, 0.32, 48]} />
        <meshStandardMaterial color="#d6b985" roughness={0.42} metalness={0.08} />
      </mesh>
      {[
        [-1.7, 0, -1.7],
        [1.7, 0, -1.7],
        [-1.7, 0, 1.7],
        [1.7, 0, 1.7],
      ].map(([x, y, z], i) => (
        <PolishedColumn key={i} position={[x, y + 0.32, z]} height={2.75} />
      ))}
      <mesh position={[0, 3.22, 0]} castShadow>
        <coneGeometry args={[3.25, 0.92, 48]} />
        <meshStandardMaterial color="#b73542" roughness={0.32} metalness={0.18} />
      </mesh>
      <mesh position={[0, 3.65, 0]} castShadow>
        <torusGeometry args={[1.95, 0.045, 8, 64]} />
        <meshStandardMaterial color="#ffd584" emissive="#9f5c1a" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 4.02, 0]} castShadow>
        <coneGeometry args={[1.65, 0.62, 48]} />
        <meshStandardMaterial color="#c8404c" roughness={0.28} metalness={0.2} />
      </mesh>
      <mesh position={[0, 4.42, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ffe0a3" emissive="#ffb84d" emissiveIntensity={0.45} />
      </mesh>
    </group>
  )
}

function SakuraTree({ position, size = 1 }: { position: [number, number, number]; size?: number }) {
  const blossoms = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: Math.sin(i * 1.55) * (0.62 + (i % 3) * 0.18) * size,
        y: (1.55 + (i % 5) * 0.16) * size,
        z: Math.cos(i * 1.24) * (0.62 + (i % 2) * 0.2) * size,
        r: (0.35 + (i % 4) * 0.045) * size,
        c: i % 3 === 0 ? '#ff77b3' : i % 3 === 1 ? '#ffb1d1' : '#ffd9e8',
      })),
    [size]
  )

  return (
    <group position={position}>
      <mesh position={[0, 0.8 * size, 0]} castShadow>
        <cylinderGeometry args={[0.13 * size, 0.24 * size, 1.6 * size, 12]} />
        <meshStandardMaterial color="#6b4026" roughness={0.62} />
      </mesh>
      <mesh position={[0.22 * size, 1.35 * size, 0]} rotation={[0.15, 0, -0.55]} castShadow>
        <cylinderGeometry args={[0.055 * size, 0.1 * size, 1.1 * size, 10]} />
        <meshStandardMaterial color="#6b4026" roughness={0.62} />
      </mesh>
      <mesh position={[-0.25 * size, 1.3 * size, 0.08 * size]} rotation={[0.2, 0.35, 0.55]} castShadow>
        <cylinderGeometry args={[0.05 * size, 0.09 * size, 1.0 * size, 10]} />
        <meshStandardMaterial color="#6b4026" roughness={0.62} />
      </mesh>
      {blossoms.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow>
          <sphereGeometry args={[b.r, 14, 14]} />
          <meshStandardMaterial
            color={b.c}
            emissive="#9d2f63"
            emissiveIntensity={0.08}
            roughness={0.52}
          />
        </mesh>
      ))}
    </group>
  )
}

function GalleryLamp({ position, color = '#ffcc7a' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 1.5, 12]} />
        <meshStandardMaterial color="#29232a" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} />
      </mesh>
      <pointLight position={[0, 1.62, 0]} intensity={0.75} color={color} distance={5} />
    </group>
  )
}

function ArtworkFrame({
  artwork,
  position,
  rotation = [0, 0, 0],
  accent,
  onClick,
}: {
  artwork: ArtworkData
  position: [number, number, number]
  rotation?: [number, number, number]
  accent: string
  onClick: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const fallbackTexture = useMemo(
    () => createProceduralArtworkTexture(artwork, accent),
    [artwork, accent]
  )
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null)

  const previewUrl = useMemo(
    () =>
      artwork.media_type === 'image'
        ? artwork.file_url || artwork.thumb_url
        : artwork.thumb_url || artwork.file_url,
    [artwork.file_url, artwork.media_type, artwork.thumb_url]
  )

  useEffect(() => {
    if (!previewUrl) {
      setLoadedTexture(null)
      return
    }

    let cancelled = false
    const loader = new THREE.TextureLoader()

    loader.load(
      previewUrl,
      (texture) => {
        if (cancelled) {
          texture.dispose()
          return
        }

        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 4
        texture.needsUpdate = true
        setLoadedTexture(texture)
      },
      undefined,
      () => {
        if (!cancelled) {
          setLoadedTexture(null)
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [previewUrl])

  const texture = loadedTexture || fallbackTexture

  const mediaLabel =
    artwork.media_type === '3d'
      ? '3D OBJECT'
      : artwork.media_type === 'video'
      ? 'VIDEO ART'
      : artwork.media_type === 'audio'
      ? 'AUDIO PIECE'
      : 'DIGITAL ART'

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={() => onClick(artwork.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={hovered ? 2.1 : 0.85} floatIntensity={hovered ? 0.14 : 0.035} rotationIntensity={0.025}>
        <mesh position={[0, 0, -0.055]} castShadow receiveShadow>
          <planeGeometry args={[2.55, 1.92]} />
          <meshStandardMaterial color="#0d0d13" roughness={0.32} metalness={0.35} />
        </mesh>

        <mesh position={[0, 0, 0.015]} castShadow>
          <planeGeometry args={[2.16, 1.52]} />
          <meshStandardMaterial map={texture} roughness={0.28} metalness={0.03} />
        </mesh>

        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[2.24, 1.6]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.35}
            transparent
            opacity={0.16}
            roughness={0.04}
            metalness={0}
          />
        </mesh>

        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[2.36, 1.72]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={hovered ? 0.62 : 0.18}
            transparent
            opacity={hovered ? 0.18 : 0.07}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, -1.08, 0.06]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.08, 36]} />
          <meshStandardMaterial color="#07080c" roughness={0.24} metalness={0.42} />
        </mesh>

        <Text
          position={[0, -0.98, 0.13]}
          fontSize={0.09}
          maxWidth={1.55}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
        >
          {artwork.title}
        </Text>
        <Text
          position={[0, -1.15, 0.13]}
          fontSize={0.052}
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
          color={accent}
        >
          {mediaLabel}
        </Text>
      </Float>

      <pointLight
        position={[0, 0.15, 0.75]}
        intensity={hovered ? 1.2 : 0.45}
        color={accent}
        distance={3.2}
      />

      {hovered && (
        <Html position={[0, 1.25, 0.2]} distanceFactor={7} center>
          <div className="whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-3 py-1 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
            Открыть работу
          </div>
        </Html>
      )}
    </group>
  )
}

function SakuraPavilion({ artworks, onArtworkClick }: { artworks: ArtworkData[]; onArtworkClick: (id: string) => void }) {
  const positions: [number, number, number][] = [
    [-5.2, 1.75, -7.4],
    [0, 1.95, -6.5],
    [5.2, 1.75, -7.4],
    [-4.1, 1.8, -14.2],
    [4.1, 1.8, -14.2],
    [0, 2.0, -16.5],
  ]
  const rotations: [number, number, number][] = [
    [0, 0.38, 0],
    [0, 0, 0],
    [0, -0.38, 0],
    [0, 0.72, 0],
    [0, -0.72, 0],
    [0, 0, 0],
  ]

  return (
    <group>
      <color attach="background" args={['#efd1dc']} />
      <fog attach="fog" args={['#efd1dc', 14, 34]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[-5, 9, 4]} intensity={1.35} color="#ffe2bc" />
      <spotLight position={[0, 7, -6]} angle={0.55} penumbra={0.8} intensity={1.45} color="#ffd8ef" />
      <pointLight position={[5, 3, -12]} intensity={1.2} color="#9ee7ff" />

      <LightEnvironmentShell url="/backgrounds/sakura-bg.png" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -10]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#24311f" roughness={0.52} metalness={0.08} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -9.2]}>
        <ringGeometry args={[2.7, 8.7, 64]} />
        <meshStandardMaterial color="#d8be8a" roughness={0.58} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -9.2]}>
        <ringGeometry args={[8.9, 9.05, 64]} />
        <meshStandardMaterial color="#ffb3d2" emissive="#c44d82" emissiveIntensity={0.2} />
      </mesh>

      <SmoothPavilion />
      <SakuraTree position={[-7.4, 0, -5.4]} size={1.25} />
      <SakuraTree position={[7.1, 0, -5.9]} size={1.05} />
      <SakuraTree position={[-7.1, 0, -14.4]} size={1.0} />
      <SakuraTree position={[7.4, 0, -14.8]} size={1.18} />

      {[-7.5, -5.3, 5.3, 7.5].map((x, i) => (
        <GalleryLamp key={i} position={[x, 0, -8.2 - (i % 2) * 4]} color={i % 2 ? '#ffd27b' : '#ff9ac8'} />
      ))}

      <Sparkles count={28} scale={[17, 5, 18]} size={1.4} speed={0.12} color="#ffd4ee" position={[0, 2.9, -10]} />

      {artworks.map((artwork, i) => (
        <ArtworkFrame
          key={artwork.id}
          artwork={artwork}
          position={positions[i] || [0, 1.8, -8 - i * 1.8]}
          rotation={rotations[i] || [0, 0, 0]}
          accent="#ff8fc7"
          onClick={onArtworkClick}
        />
      ))}
      <Environment preset="sunset" />
    </group>
  )
}

function NeonAtrium({ artworks, onArtworkClick }: { artworks: ArtworkData[]; onArtworkClick: (id: string) => void }) {
  const positions: [number, number, number][] = [
    [-5.8, 2.1, -7.1],
    [-2.1, 2.35, -9.4],
    [2.1, 2.35, -9.4],
    [5.8, 2.1, -7.1],
    [-3.6, 2.15, -14.5],
    [3.6, 2.15, -14.5],
  ]

  return (
    <group>
      <color attach="background" args={['#020512']} />
      <fog attach="fog" args={['#020512', 12, 34]} />
      <ambientLight intensity={0.24} />
      <pointLight position={[0, 3, -6]} intensity={2.6} color="#00e6ff" />
      <pointLight position={[-5, 4, -11]} intensity={2.3} color="#ff2ed1" />
      <pointLight position={[5, 4, -13]} intensity={1.9} color="#f7ff4b" />
      <spotLight position={[0, 7, -9]} angle={0.6} penumbra={0.8} intensity={1.7} color="#b7f7ff" />

      <BackgroundImage url="/backgrounds/neon-bg.png" opacity={0.76} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <circleGeometry args={[10.2, 64]} />
        <meshStandardMaterial color="#050a18" roughness={0.24} metalness={0.5} />
      </mesh>

      {[2.5, 4.6, 6.7, 8.8].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05 + i * 0.006, -10]}>
          <ringGeometry args={[r, r + 0.025, 64]} />
          <meshStandardMaterial
            color={i % 2 ? '#ff2ed1' : '#00e6ff'}
            emissive={i % 2 ? '#ff2ed1' : '#00e6ff'}
            emissiveIntensity={0.95}
          />
        </mesh>
      ))}

      {[-7.6, -3.8, 3.8, 7.6].map((x, i) => (
        <Float key={x} speed={0.75 + i * 0.05} floatIntensity={0.12} rotationIntensity={0.05}>
          <group position={[x, 1.7, -12]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.18, 0.26, 3.4, 24]} />
              <meshStandardMaterial color="#071323" roughness={0.22} metalness={0.72} />
            </mesh>
            <mesh position={[0, 1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.68, 0.035, 8, 48]} />
              <meshStandardMaterial
                color={i % 2 ? '#ff2ed1' : '#00e6ff'}
                emissive={i % 2 ? '#ff2ed1' : '#00e6ff'}
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        </Float>
      ))}

      <mesh position={[0, 3.2, -16.4]} castShadow>
        <torusGeometry args={[5.0, 0.06, 8, 80]} />
        <meshStandardMaterial color="#00e6ff" emissive="#00e6ff" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 3.2, -16.42]}>
        <planeGeometry args={[9.4, 4.9]} />
        <meshPhysicalMaterial color="#081126" roughness={0.12} metalness={0.72} transparent opacity={0.72} />
      </mesh>

      <Sparkles count={36} scale={[18, 7, 18]} size={1.25} speed={0.18} color="#80f6ff" position={[0, 3, -10]} />

      {artworks.map((artwork, i) => (
        <ArtworkFrame
          key={artwork.id}
          artwork={artwork}
          position={positions[i] || [0, 2, -8 - i * 1.7]}
          rotation={[0, i < 2 ? 0.28 : i > 3 ? -0.28 : 0, 0]}
          accent={i % 2 ? '#ff2ed1' : '#00e6ff'}
          onClick={onArtworkClick}
        />
      ))}
      <Environment preset="night" />
    </group>
  )
}

function CosmosMuseum({ artworks, onArtworkClick }: { artworks: ArtworkData[]; onArtworkClick: (id: string) => void }) {
  const positions: [number, number, number][] = [
    [-5.8, 2, -8.2],
    [0, 2.35, -7.2],
    [5.8, 2, -8.2],
    [-4.3, 2.1, -13.6],
    [4.3, 2.1, -13.6],
    [0, 2.45, -17],
  ]

  return (
    <group>
      <color attach="background" args={['#01030b']} />
      <fog attach="fog" args={['#01030b', 16, 44]} />
      <ambientLight intensity={0.34} />
      <pointLight position={[0, 4, -9]} intensity={2.5} color="#95c9ff" />
      <pointLight position={[6, 3, -14]} intensity={1.8} color="#ff9b5c" />
      <spotLight position={[-4, 7, -6]} angle={0.58} penumbra={0.85} intensity={1.3} color="#e1edff" />

      <BackgroundImage url="/backgrounds/cosmos-bg.png" position={[0, 4.4, -26]} size={[38, 21]} opacity={0.86} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <circleGeometry args={[9.6, 64]} />
        <meshStandardMaterial color="#101a35" roughness={0.28} metalness={0.42} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -10]}>
        <ringGeometry args={[6.5, 9.6, 64]} />
        <meshStandardMaterial color="#6aa7ff" emissive="#2e67ff" emissiveIntensity={0.42} transparent opacity={0.34} />
      </mesh>

      <Float speed={0.55} rotationIntensity={0.18} floatIntensity={0.28}>
        <mesh position={[0, 4.5, -13]} castShadow>
          <sphereGeometry args={[1.1, 28, 28]} />
          <meshStandardMaterial color="#d5e8ff" emissive="#5c9cff" emissiveIntensity={0.34} roughness={0.32} />
        </mesh>
      </Float>
      <mesh rotation={[0.75, 0.2, 0.35]} position={[0, 4.5, -13]}>
        <torusGeometry args={[1.68, 0.035, 8, 64]} />
        <meshStandardMaterial color="#ffb35c" emissive="#ff8c2b" emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation={[1.1, -0.45, 0.1]} position={[0, 4.5, -13]}>
        <torusGeometry args={[2.05, 0.02, 8, 64]} />
        <meshStandardMaterial color="#8ec8ff" emissive="#418cff" emissiveIntensity={0.62} />
      </mesh>

      {[-6, -3, 0, 3, 6].map((x, i) => (
        <Float key={x} speed={0.75 + i * 0.08} floatIntensity={0.16} rotationIntensity={0.12}>
          <mesh position={[x, 0.55, -5.2 - i * 2.2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.78, 0.92, 0.28, 32]} />
            <meshStandardMaterial color="#2c385f" emissive="#173c75" emissiveIntensity={0.16} roughness={0.24} metalness={0.52} />
          </mesh>
        </Float>
      ))}

      <Sparkles count={42} scale={[22, 10, 24]} size={1.5} speed={0.1} color="#dbeaff" position={[0, 4, -10]} />

      {artworks.map((artwork, i) => (
        <ArtworkFrame
          key={artwork.id}
          artwork={artwork}
          position={positions[i] || [0, 2, -8 - i * 1.8]}
          rotation={[0, i === 0 || i === 3 ? 0.45 : i === 2 || i === 4 ? -0.45 : 0, 0]}
          accent={i % 2 ? '#ffb35c' : '#8ec8ff'}
          onClick={onArtworkClick}
        />
      ))}
      <Environment preset="dawn" />
    </group>
  )
}

function ExhibitionSpace({
  theme,
  artworks,
  onArtworkClick,
}: {
  theme: SpaceTheme
  artworks: ArtworkData[]
  onArtworkClick: (id: string) => void
}) {
  if (theme === 'neon') {
    return <NeonAtrium artworks={artworks} onArtworkClick={onArtworkClick} />
  }

  if (theme === 'cosmos') {
    return <CosmosMuseum artworks={artworks} onArtworkClick={onArtworkClick} />
  }

  return <SakuraPavilion artworks={artworks} onArtworkClick={onArtworkClick} />
}

function Controls3D() {
  const { reducedMotion } = useUIStore()

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={4}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2.05}
      autoRotate={!reducedMotion}
      autoRotateSpeed={0.2}
      target={[0, 1.9, -10]}
    />
  )
}

interface Scene3DProps {
  artworks: Record<string, unknown>[]
  exhibitionId: string
}

export function Scene3D({ artworks, exhibitionId }: Scene3DProps) {
  const { openArtworkModal } = useUIStore()
  const { log } = useAnalytics()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [theme, setTheme] = useState<SpaceTheme>('pagoda')

  const typedArtworks = artworks as ArtworkData[]

  const handleArtworkClick = useCallback(
    (id: string) => {
      openArtworkModal(id)
      log('artwork_click', exhibitionId, { artwork_id: id, mode: '3d', theme })
    },
    [openArtworkModal, log, exhibitionId, theme]
  )

  const currentSpace = spaces.find((space) => space.id === theme) || spaces[0]

  return (
    <div
      className="relative h-[78vh] w-full overflow-hidden"
      role="region"
      aria-label="3D виртуальная выставка"
    >
      <Canvas
        ref={canvasRef}
        dpr={1}
        gl={{
          antialias: false,
          powerPreference: 'low-power',
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1
          gl.shadowMap.enabled = false
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 4.2, 4.8]} fov={58} />
        <Suspense fallback={<Loader />}>
          <ExhibitionSpace
            theme={theme}
            artworks={typedArtworks}
            onArtworkClick={handleArtworkClick}
          />
        </Suspense>
        <Controls3D />
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-2xl border border-white/10 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-md">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.38em] text-white/45">
          Immersive room
        </p>
        <h2 className="text-xl font-bold">{currentSpace.name}</h2>
        <p className="text-xs text-white/65">{currentSpace.description}</p>
      </div>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-black/55 p-2 shadow-2xl backdrop-blur-md">
        {spaces.map((space) => (
          <button
            key={space.id}
            onClick={() => setTheme(space.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              theme === space.id
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {space.name}
          </button>
        ))}
        <button
          onClick={() => useUIStore.getState().setMode('2.5d')}
          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
          aria-label="Переключить на 2.5D режим"
        >
          2.5D
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-24 left-4 right-4 flex justify-center">
        <p className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs text-white/70 backdrop-blur-sm">
          Вращайте мышью · Приближайте колесом · Кликните по картине, чтобы открыть карточку
        </p>
      </div>
    </div>
  )
}
