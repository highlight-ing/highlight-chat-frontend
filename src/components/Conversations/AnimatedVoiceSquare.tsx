import React from 'react'

interface AnimatedVoiceSquareProps {
  width?: number
  height?: number
  backgroundColor?: string
  lineColor?: string
}

const AnimatedVoiceSquare: React.FC<AnimatedVoiceSquareProps> = ({
  width = 24,
  height = 24,
  backgroundColor = '#4CED9F',
  lineColor,
}) => {
  const viewBox = `0 0 ${width} ${height}`
  const strokeColor = lineColor || 'currentColor'
  const strokeWidth = width / 12
  const lineSpacing = width / 6
  const centerX = width / 2
  const centerY = height / 2

  const getLineHeight = (index: number) => {
    const maxHeight = height * 0.4
    if (index === 2) return maxHeight
    if (index === 1 || index === 3) return maxHeight * 0.7
    if (index === 0 || index === 4) return maxHeight * 0.25
    return maxHeight * 0.5
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animated-voice-square"
    >
      <rect width={width} height={height} rx={width / 4.8} fill={backgroundColor} />
      {[0, 1, 2, 3, 4].map((index) => {
        const lineHeight = getLineHeight(index)
        const x = centerX + (index - 2) * lineSpacing
        return (
          <line
            key={index}
            x1={x}
            y1={centerY - lineHeight / 2}
            x2={x}
            y2={centerY + lineHeight / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`voice-line voice-line-${index + 1}`}
          />
        )
      })}
    </svg>
  )
}

export default AnimatedVoiceSquare
