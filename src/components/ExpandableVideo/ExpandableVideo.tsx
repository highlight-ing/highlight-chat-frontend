import { CSSProperties, ReactElement, useEffect, useRef, useState } from 'react'
import { ExportSquare, VideoCircle } from 'iconsax-react'
import styles from './expandablevideo.module.scss'
import variables from '@/variables.module.scss'
import CloseButton from '@/components/CloseButton/CloseButton'

interface ExampleVideoProps {
  src: string
  description?: string | ReactElement
  icon?: ReactElement | string
  style?: CSSProperties
  onPlay?: () => void
}
const ExpandableVideo = (props: ExampleVideoProps) => {
  const { src, description, icon, style, onPlay } = props
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)
  const [large, setLarge] = useState(false)

  useEffect(() => {
    const onPlayHandler = () => {
      setPaused(false)
      onPlay?.()
    }
    const onPause = () => {
      setPaused(true)
    }
    videoRef.current?.addEventListener('play', onPlayHandler)
    videoRef.current?.addEventListener('pause', onPause)
    return () => {
      videoRef.current?.removeEventListener('play', onPlayHandler)
      videoRef.current?.removeEventListener('pause', onPause)
    }
  }, [onPlay])

  useEffect(() => {
    if (!large && !videoRef.current?.paused) {
      videoRef.current?.pause()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLarge(false)
      }
    }

    if (large) {
      window.addEventListener('keydown', onKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [large])

  return (
    <div
      className={styles.example}
      // @ts-ignore
      style={{ '--is-fullscreen': large, ...style }}
      onMouseEnter={() => (videoRef.current?.paused ? videoRef.current.play() : {})}
      onMouseLeave={() => (!large && videoRef.current?.paused === false ? videoRef.current.pause() : {})}
      onClick={() => (!large ? setLarge(true) : {})}
    >
      {large && <div className={styles.largeOverlay} onClick={() => setLarge(false)} />}
      <div
        className={'relative'}
        style={
          large
            ? {
                position: 'fixed',
                top: '10%',
                left: '10%',
                right: '10%',
                zIndex: '3',
                height: 'fit-content',
                cursor: 'normal',
              }
            : undefined
        }
      >
        <video
          ref={videoRef}
          controls={false}
          loop={true}
          muted={true}
          preload={'metadata'}
          style={
            large
              ? {
                  opacity: '1',
                  aspectRatio: 'initial',
                  borderRadius: '12px',
                  boxShadow: '0 0 128px 32px rgba(0, 0, 0, 1)',
                  maxHeight: '80vh',
                  backgroundColor: 'black',
                  border: `1px solid ${variables.light20}`,
                }
              : undefined
          }
        >
          <source src={src} type={'video/mp4'} />
        </video>
        <div className={styles.videoControls}>
          {paused && <VideoCircle variant={'Bold'} color={variables.light40} size={64} />}
          {!paused && !large && (
            <div className={styles.open} onClick={() => setLarge(!large)}>
              <ExportSquare variant={'Linear'} size={24} />
            </div>
          )}
          {large && <CloseButton className={'close'} size={'32px'} onClick={() => setLarge(false)} />}
          {large && description && (
            <div
              className={'flex items-center'}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                gap: '8px',
                color: 'white',
                lineHeight: '1',
              }}
            >
              {icon && icon}
              {description}
            </div>
          )}
        </div>
      </div>
      {description && (
        <div className={styles.description}>
          {icon && icon}
          <span>{description}</span>
        </div>
      )}
    </div>
  )
}

export default ExpandableVideo
