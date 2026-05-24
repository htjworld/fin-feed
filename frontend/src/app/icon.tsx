import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 25,
          fontStyle: 'italic',
          fontWeight: 700,
          color: '#0E3B30',
          lineHeight: 1,
          marginTop: 2,
        }}
      >
        F
      </span>
    </div>,
    { ...size }
  )
}
