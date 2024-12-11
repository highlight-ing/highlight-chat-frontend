import { type MouseEvent } from 'react'
import { VoiceSquare } from 'iconsax-react'

import { Meeting } from '@/types/conversations'

export interface IconPropTypes {
  color?: string
  size?: number | string
  width?: number
  height?: number
  onClick?: (event: MouseEvent) => void
}

export const PaperclipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.07086 17.6622C9.07086 20.0579 11.0716 22 13.5397 22H14.5313C16.9993 22 19 20.0579 19 17.6622V8.07292C19 4.71895 16.199 2 12.7437 2H11.2563C7.80107 2 5 4.71895 5 8.07292V16.7889C5 17.268 5.40016 17.6565 5.89376 17.6565C6.38739 17.6565 6.78753 17.268 6.78753 16.7889V12.4309V8.07292C6.78753 5.67722 8.78829 3.73512 11.2563 3.73512H12.7437C15.2118 3.73512 17.2126 5.67722 17.2126 8.07292V17.6622C17.2126 19.0996 16.0121 20.2649 14.5313 20.2649H13.5397C12.0588 20.2649 10.8584 19.0996 10.8584 17.6622V8.77037C10.8584 8.15834 11.3695 7.66218 12 7.66218C12.6298 7.66218 13.1417 8.15888 13.1417 8.77165V16.7889C13.1417 17.268 13.5419 17.6565 14.0355 17.6565C14.5291 17.6565 14.9292 17.268 14.9292 16.7889V8.77165C14.9292 7.20206 13.6185 5.92706 12 5.92706C10.3823 5.92706 9.07086 7.20005 9.07086 8.77037V17.6622Z"
      fill="#6e6e6e"
    />
  </svg>
)

export const AssistantIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="16" fill="#181818" />
    <rect width="32" height="32" rx="16" fill="url(#paint0_linear_273_196)" fillOpacity="0.2" />
    <path
      d="M7 10.3469C7 9.30616 7.83947 8.46249 8.875 8.46249C9.91053 8.46249 10.75 9.30616 10.75 10.3469V21.6531C10.75 22.6938 9.91053 23.5375 8.875 23.5375C7.83947 23.5375 7 22.6938 7 21.6531V10.3469Z"
      fill="white"
      fillOpacity="0.6"
    />
    <path
      d="M21.25 10.3469C21.25 9.30616 22.0895 8.46249 23.125 8.46249C24.1605 8.46249 25 9.30616 25 10.3469V21.6531C25 22.6938 24.1605 23.5375 23.125 23.5375C22.0895 23.5375 21.25 22.6938 21.25 21.6531V10.3469Z"
      fill="white"
      fillOpacity="0.6"
    />
    <path
      d="M20.5 16C20.5 18.4977 18.4853 20.5225 16 20.5225C13.5147 20.5225 11.5 18.4977 11.5 16C11.5 13.5023 13.5147 11.4775 16 11.4775C18.4853 11.4775 20.5 13.5023 20.5 16Z"
      fill="white"
      fillOpacity="0.6"
    />
    <defs>
      <linearGradient id="paint0_linear_273_196" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AFAFAF" stopOpacity="0.5" />
        <stop offset="1" />
      </linearGradient>
    </defs>
  </svg>
)

export const CloseIcon = ({ size, color = 'currentColor' }: IconPropTypes) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width={size} height={size} rx="12" fill="black" />
    <path
      d="M12 0C5.388 0 0 5.388 0 12C0 18.612 5.388 24 12 24C18.612 24 24 18.612 24 12C24 5.388 18.612 0 12 0ZM16.032 14.76C16.38 15.108 16.38 15.684 16.032 16.032C15.852 16.212 15.624 16.296 15.396 16.296C15.168 16.296 14.94 16.212 14.76 16.032L12 13.272L9.24 16.032C9.06 16.212 8.832 16.296 8.604 16.296C8.376 16.296 8.148 16.212 7.968 16.032C7.62 15.684 7.62 15.108 7.968 14.76L10.728 12L7.968 9.24C7.62 8.892 7.62 8.316 7.968 7.968C8.316 7.62 8.892 7.62 9.24 7.968L12 10.728L14.76 7.968C15.108 7.62 15.684 7.62 16.032 7.968C16.38 8.316 16.38 8.892 16.032 9.24L13.272 12L16.032 14.76Z"
      fill={color}
    />
  </svg>
)

export const HighlightIcon = ({ withText, size, color }: { withText?: boolean; size?: number; color?: string }) => (
  <svg
    width={withText ? 705 : (size ?? 48)}
    height={size ?? 48}
    viewBox={`0 0 ${withText ? 705 : 141} 141`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 30.614C0 23.2712 5.87626 17.3187 13.125 17.3187C20.3737 17.3187 26.25 23.2712 26.25 30.614V110.386C26.25 117.729 20.3737 123.681 13.125 123.681C5.87626 123.681 0 117.729 0 110.386V30.614Z"
      fill={color ?? 'white'}
    />
    <path
      d="M99.75 30.614C99.75 23.2712 105.626 17.3187 112.875 17.3187C120.124 17.3187 126 23.2712 126 30.614V110.386C126 117.729 120.124 123.681 112.875 123.681C105.626 123.681 99.75 117.729 99.75 110.386V30.614Z"
      fill={color ?? 'white'}
    />
    <path
      d="M94.5 70.5C94.5 88.1227 80.397 102.409 63 102.409C45.603 102.409 31.5 88.1227 31.5 70.5C31.5 52.8773 45.603 38.5912 63 38.5912C80.397 38.5912 94.5 52.8773 94.5 70.5Z"
      fill={color ?? 'white'}
    />
    {withText && (
      <path
        d="M241.08 75.48H199.08V114H184.5V27.24H199.08V63.06H241.08V27.24H255.66V114H241.08V75.48ZM289.449 51.96V114H275.409V51.96H289.449ZM289.629 27.3V41.1H275.169V27.3H289.629ZM334.273 134.52C323.833 134.52 315.813 133.12 310.213 130.32C304.613 127.52 301.813 123.68 301.813 118.8C301.813 116.6 302.353 114.76 303.433 113.28C304.513 111.8 305.793 110.58 307.273 109.62C308.753 108.66 310.113 107.92 311.353 107.4C312.593 106.88 313.393 106.5 313.753 106.26C313.073 105.86 312.173 105.34 311.053 104.7C309.933 104.06 308.913 103.18 307.993 102.06C307.113 100.94 306.673 99.48 306.673 97.68C306.673 95.6 307.653 93.68 309.613 91.92C311.613 90.16 314.593 88.9 318.553 88.14C314.673 86.26 311.693 83.72 309.613 80.52C307.533 77.32 306.493 74 306.493 70.56C306.493 66.48 307.673 62.98 310.033 60.06C312.433 57.14 315.753 54.9 319.993 53.34C324.273 51.78 329.213 51 334.813 51C338.973 51 342.413 51.46 345.133 52.38C347.853 53.3 350.393 54.54 352.753 56.1C353.553 55.78 354.673 55.34 356.113 54.78C357.593 54.18 359.193 53.54 360.913 52.86C362.633 52.14 364.273 51.46 365.833 50.82C367.433 50.14 368.793 49.58 369.913 49.14L369.793 61.2L359.053 63.12C359.573 64.28 359.973 65.54 360.253 66.9C360.573 68.26 360.733 69.46 360.733 70.5C360.733 74.1 359.713 77.44 357.673 80.52C355.673 83.56 352.653 86 348.613 87.84C344.613 89.68 339.613 90.6 333.613 90.6C333.013 90.6 332.193 90.58 331.153 90.54C330.113 90.5 329.273 90.46 328.633 90.42C325.393 90.54 323.173 90.92 321.973 91.56C320.773 92.2 320.173 92.9 320.173 93.66C320.173 94.74 321.073 95.46 322.873 95.82C324.673 96.18 327.553 96.5 331.513 96.78C332.913 96.86 334.753 96.96 337.033 97.08C339.313 97.2 341.853 97.36 344.653 97.56C351.733 98 357.093 99.78 360.733 102.9C364.373 105.98 366.193 109.98 366.193 114.9C366.193 120.62 363.553 125.32 358.273 129C352.993 132.68 344.993 134.52 334.273 134.52ZM336.733 125.94C341.973 125.94 345.853 125.22 348.373 123.78C350.893 122.34 352.153 120.22 352.153 117.42C352.153 115.26 351.293 113.5 349.573 112.14C347.853 110.78 345.293 109.98 341.893 109.74L326.233 108.78C324.513 108.66 322.873 108.98 321.313 109.74C319.793 110.46 318.553 111.48 317.593 112.8C316.633 114.08 316.153 115.5 316.153 117.06C316.153 119.98 317.833 122.18 321.193 123.66C324.553 125.18 329.733 125.94 336.733 125.94ZM334.093 82.02C337.893 82.02 340.973 81.06 343.333 79.14C345.693 77.18 346.873 74.42 346.873 70.86C346.873 67.18 345.693 64.32 343.333 62.28C340.973 60.2 337.893 59.16 334.093 59.16C330.213 59.16 327.073 60.2 324.673 62.28C322.313 64.36 321.133 67.22 321.133 70.86C321.133 74.3 322.273 77.02 324.553 79.02C326.833 81.02 330.013 82.02 334.093 82.02ZM381.616 114V24.84H396.016V60.96C397.016 59.4 398.336 57.9 399.976 56.46C401.616 54.98 403.616 53.78 405.976 52.86C408.376 51.9 411.236 51.42 414.556 51.42C418.516 51.42 422.136 52.18 425.416 53.7C428.696 55.22 431.316 57.42 433.276 60.3C435.236 63.14 436.216 66.54 436.216 70.5V114H421.576V72.96C421.576 69.76 420.436 67.28 418.156 65.52C415.916 63.76 413.076 62.88 409.636 62.88C407.356 62.88 405.176 63.28 403.096 64.08C401.016 64.88 399.336 66.08 398.056 67.68C396.816 69.24 396.196 71.2 396.196 73.56V114H381.616ZM469.691 114.9C465.691 114.9 462.491 114.4 460.091 113.4C457.691 112.4 455.891 111.06 454.691 109.38C453.491 107.7 452.711 105.82 452.351 103.74C451.991 101.62 451.811 99.46 451.811 97.26V24.84H466.091V95.58C466.091 98.26 466.631 100.34 467.711 101.82C468.831 103.3 470.631 104.16 473.111 104.4L476.231 104.52V113.7C475.151 114.02 474.051 114.3 472.931 114.54C471.811 114.78 470.731 114.9 469.691 114.9ZM504.02 51.96V114H489.98V51.96H504.02ZM504.2 27.3V41.1H489.74V27.3H504.2ZM548.843 134.52C538.403 134.52 530.383 133.12 524.783 130.32C519.183 127.52 516.383 123.68 516.383 118.8C516.383 116.6 516.923 114.76 518.003 113.28C519.083 111.8 520.363 110.58 521.843 109.62C523.323 108.66 524.683 107.92 525.923 107.4C527.163 106.88 527.963 106.5 528.323 106.26C527.643 105.86 526.743 105.34 525.623 104.7C524.503 104.06 523.483 103.18 522.563 102.06C521.683 100.94 521.243 99.48 521.243 97.68C521.243 95.6 522.223 93.68 524.183 91.92C526.183 90.16 529.163 88.9 533.123 88.14C529.243 86.26 526.263 83.72 524.183 80.52C522.103 77.32 521.063 74 521.063 70.56C521.063 66.48 522.243 62.98 524.603 60.06C527.003 57.14 530.323 54.9 534.563 53.34C538.843 51.78 543.783 51 549.383 51C553.543 51 556.983 51.46 559.703 52.38C562.423 53.3 564.963 54.54 567.323 56.1C568.123 55.78 569.243 55.34 570.683 54.78C572.163 54.18 573.763 53.54 575.483 52.86C577.203 52.14 578.843 51.46 580.403 50.82C582.003 50.14 583.363 49.58 584.483 49.14L584.363 61.2L573.623 63.12C574.143 64.28 574.543 65.54 574.823 66.9C575.143 68.26 575.303 69.46 575.303 70.5C575.303 74.1 574.283 77.44 572.243 80.52C570.243 83.56 567.223 86 563.183 87.84C559.183 89.68 554.183 90.6 548.183 90.6C547.583 90.6 546.763 90.58 545.723 90.54C544.683 90.5 543.843 90.46 543.203 90.42C539.963 90.54 537.743 90.92 536.543 91.56C535.343 92.2 534.743 92.9 534.743 93.66C534.743 94.74 535.643 95.46 537.443 95.82C539.243 96.18 542.123 96.5 546.083 96.78C547.483 96.86 549.323 96.96 551.603 97.08C553.883 97.2 556.423 97.36 559.223 97.56C566.303 98 571.663 99.78 575.303 102.9C578.943 105.98 580.763 109.98 580.763 114.9C580.763 120.62 578.123 125.32 572.843 129C567.563 132.68 559.563 134.52 548.843 134.52ZM551.303 125.94C556.543 125.94 560.423 125.22 562.943 123.78C565.463 122.34 566.723 120.22 566.723 117.42C566.723 115.26 565.863 113.5 564.143 112.14C562.423 110.78 559.863 109.98 556.463 109.74L540.803 108.78C539.083 108.66 537.443 108.98 535.883 109.74C534.363 110.46 533.123 111.48 532.163 112.8C531.203 114.08 530.723 115.5 530.723 117.06C530.723 119.98 532.403 122.18 535.763 123.66C539.123 125.18 544.303 125.94 551.303 125.94ZM548.663 82.02C552.463 82.02 555.543 81.06 557.903 79.14C560.263 77.18 561.443 74.42 561.443 70.86C561.443 67.18 560.263 64.32 557.903 62.28C555.543 60.2 552.463 59.16 548.663 59.16C544.783 59.16 541.643 60.2 539.243 62.28C536.883 64.36 535.703 67.22 535.703 70.86C535.703 74.3 536.843 77.02 539.123 79.02C541.403 81.02 544.583 82.02 548.663 82.02ZM596.186 114V24.84H610.586V60.96C611.586 59.4 612.906 57.9 614.546 56.46C616.186 54.98 618.186 53.78 620.546 52.86C622.946 51.9 625.806 51.42 629.126 51.42C633.086 51.42 636.706 52.18 639.986 53.7C643.266 55.22 645.886 57.42 647.846 60.3C649.806 63.14 650.786 66.54 650.786 70.5V114H636.146V72.96C636.146 69.76 635.006 67.28 632.726 65.52C630.486 63.76 627.646 62.88 624.206 62.88C621.926 62.88 619.746 63.28 617.666 64.08C615.586 64.88 613.906 66.08 612.626 67.68C611.386 69.24 610.766 71.2 610.766 73.56V114H596.186ZM698.498 62.28H684.638L684.698 97.86C684.698 99.7 684.898 101.06 685.298 101.94C685.738 102.78 686.418 103.34 687.338 103.62C688.298 103.86 689.578 103.98 691.178 103.98H698.798V113.22C697.998 113.54 696.778 113.82 695.138 114.06C693.538 114.34 691.378 114.48 688.658 114.48C683.738 114.48 679.918 113.84 677.198 112.56C674.518 111.24 672.658 109.38 671.618 106.98C670.578 104.58 670.058 101.72 670.058 98.4V62.28H659.978V51.96H670.478L674.138 33.54H684.638V51.9H698.498V62.28Z"
        fill={color ?? 'white'}
      />
    )}
  </svg>
)

export const MenuDots = ({ size = 24, color = 'white' }: IconPropTypes) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1.5" cy="1.5" r="1.5" transform="matrix(-1 0 0 1 8.5 10.5)" fill={color} />
      <circle cx="1.5" cy="1.5" r="1.5" transform="matrix(-1 0 0 1 13.5 10.5)" fill={color} />
      <circle cx="1.5" cy="1.5" r="1.5" transform="matrix(-1 0 0 1 18.5 10.5)" fill={color} />
    </svg>
  )
}

export const ConversationsIcon = ({ width = 32, height = 32, color = '#4D8C6E' }: IconPropTypes) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_conversations)">
      <rect width={width} height={height} rx={width / 6} fill="#A2A6A7" />
      <rect width={width} height={height} rx={width / 3.6} fill="white" />
      <rect width={width} height={height} rx={width / 3.6} fill="url(#paint0_linear_conversations)" fillOpacity="0.2" />
      <path
        d={`M${width * 0.258} ${height * 0.303}C${width * 0.258} ${height * 0.275} ${width * 0.285} ${height * 0.252} ${width * 0.306} ${height * 0.252}C${width * 0.327} ${height * 0.252} ${width * 0.354} ${height * 0.275} ${width * 0.354} ${height * 0.303}V${height * 0.697}C${width * 0.354} ${height * 0.725} ${width * 0.327} ${height * 0.748} ${width * 0.306} ${height * 0.748}C${width * 0.285} ${height * 0.748} ${width * 0.258} ${height * 0.725} ${width * 0.258} ${height * 0.697}V${height * 0.303}Z`}
        fill={color}
      />
      <path
        d={`M${width * 0.642} ${height * 0.303}C${width * 0.642} ${height * 0.275} ${width * 0.669} ${height * 0.252} ${width * 0.69} ${height * 0.252}C${width * 0.711} ${height * 0.252} ${width * 0.738} ${height * 0.275} ${width * 0.738} ${height * 0.303}V${height * 0.697}C${width * 0.738} ${height * 0.725} ${width * 0.711} ${height * 0.748} ${width * 0.69} ${height * 0.748}C${width * 0.669} ${height * 0.748} ${width * 0.642} ${height * 0.725} ${width * 0.642} ${height * 0.697}V${height * 0.303}Z`}
        fill={color}
      />
      <path
        d={`M${width * 0.621} ${height * 0.5}C${width * 0.621} ${height * 0.567} ${width * 0.567} ${height * 0.622} ${width * 0.5} ${height * 0.622}C${width * 0.433} ${height * 0.622} ${width * 0.379} ${height * 0.567} ${width * 0.379} ${height * 0.5}C${width * 0.379} ${height * 0.433} ${width * 0.433} ${height * 0.378} ${width * 0.5} ${height * 0.378}C${width * 0.567} ${height * 0.378} ${width * 0.621} ${height * 0.433} ${width * 0.621} ${height * 0.5}Z`}
        fill={color}
      />
      <path
        d={`M${width * 0.125} ${height * 0.429}C${width * 0.125} ${height * 0.401} ${width * 0.148} ${height * 0.378} ${width * 0.175} ${height * 0.378}C${width * 0.202} ${height * 0.378} ${width * 0.225} ${height * 0.401} ${width * 0.225} ${height * 0.429}V${height * 0.571}C${width * 0.225} ${height * 0.599} ${width * 0.202} ${height * 0.622} ${width * 0.175} ${height * 0.622}C${width * 0.148} ${height * 0.622} ${width * 0.125} ${height * 0.599} ${width * 0.125} ${height * 0.571}L${width * 0.125} ${height * 0.429}Z`}
        fill={color}
      />
      <path
        d={`M${width * 0.775} ${height * 0.429}C${width * 0.775} ${height * 0.401} ${width * 0.798} ${height * 0.378} ${width * 0.825} ${height * 0.378}C${width * 0.852} ${height * 0.378} ${width * 0.875} ${height * 0.401} ${width * 0.875} ${height * 0.429}V${height * 0.571}C${width * 0.875} ${height * 0.599} ${width * 0.852} ${height * 0.622} ${width * 0.825} ${height * 0.622}C${width * 0.798} ${height * 0.622} ${width * 0.775} ${height * 0.599} ${width * 0.775} ${height * 0.571}V${height * 0.429}Z`}
        fill={color}
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_conversations"
        x1={width / 2}
        y1="0"
        x2={width / 2}
        y2={height}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#AFAFAF" stopOpacity="0.5" />
        <stop offset="1" />
      </linearGradient>
      <clipPath id="clip0_conversations">
        <rect width={width} height={height} rx={width / 3.6} fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const PersonalizeIcon = ({ size = 24, color = 'white' }: IconPropTypes) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 8.00004C9.84095 8.00004 11.3333 6.50766 11.3333 4.66671C11.3333 2.82576 9.84095 1.33337 8 1.33337C6.15905 1.33337 4.66667 2.82576 4.66667 4.66671C4.66667 6.50766 6.15905 8.00004 8 8.00004Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.42446 12.7632C9.1602 11.9715 9.47251 10.9958 10.3374 10.7238C10.7858 10.5879 11.3464 10.6999 11.6667 11.1237C11.971 10.6839 12.5475 10.5879 12.996 10.7238C13.8608 10.9878 14.1731 11.9715 13.9089 12.7632C13.5005 14.0188 12.0671 14.6666 11.6667 14.6666C11.2663 14.6666 9.84888 14.0268 9.42446 12.7632Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.27332 14.6667C2.27332 12.0867 4.84 10 8 10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const LinearIcon = ({ size = 24 }: IconPropTypes) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 512 512">
      <path fill="url(#a)" d="M0 0h512v512H0z"></path>
      <g filter="url(#b)" opacity="0.8">
        <path
          fill="#fff"
          d="M346.112 342.268c1.674 1.674 4.369 1.77 6.112.168 58.502-53.763 61.2-148.753 4.505-205.448-56.694-56.695-151.684-53.996-205.447 4.505-1.602 1.743-1.506 4.439.168 6.113l194.662 194.662z"
          shapeRendering="crispEdges"
          style={{ mixBlendMode: 'multiply' }}
        ></path>
      </g>
      <g filter="url(#c)" opacity="0.3">
        <path
          fill="url(#d)"
          d="M346.112 342.268c1.674 1.674 4.369 1.77 6.112.168 58.502-53.763 61.2-148.753 4.505-205.448-56.694-56.695-151.684-53.996-205.447 4.505-1.602 1.743-1.506 4.439.168 6.113l194.662 194.662z"
        ></path>
      </g>
      <g filter="url(#e)" opacity="0.3">
        <path
          fill="url(#f)"
          d="M261.607 324.792c2.441-1.434 2.844-4.786.912-6.855L126.121 171.95c-2.018-2.16-5.535-1.831-7.017.727a148.996 148.996 0 00-6.49 12.537c-.774 1.688-.389 3.673.926 4.984l137.088 136.598a4.513 4.513 0 004.985.944c2.702-1.176 4.021-1.79 5.994-2.948z"
        ></path>
      </g>
      <path
        fill="url(#g)"
        d="M357.358 374.306c1.758 1.758 4.581 1.866 6.416.189a163.595 163.595 0 005.316-5.081c62.547-62.547 62.547-163.956 0-226.504-62.548-62.547-163.957-62.547-226.504 0a163.595 163.595 0 00-5.081 5.316c-1.677 1.835-1.569 4.658.189 6.416l219.664 219.664z"
      ></path>
      <path
        fill="url(#h)"
        d="M357.358 374.306c1.758 1.758 4.581 1.866 6.416.189a163.595 163.595 0 005.316-5.081c62.547-62.547 62.547-163.956 0-226.504-62.548-62.547-163.957-62.547-226.504 0a163.595 163.595 0 00-5.081 5.316c-1.677 1.835-1.569 4.658.189 6.416l219.664 219.664z"
      ></path>
      <path
        fill="url(#i)"
        d="M336.333 394.672c2.627-1.528 3.024-5.118.875-7.267L124.595 174.792c-2.149-2.149-5.739-1.752-7.267.875a158.87 158.87 0 00-7.119 13.725c-.811 1.771-.41 3.852.968 5.229l206.201 206.202c1.378 1.378 3.459 1.779 5.23.968a158.87 158.87 0 0013.725-7.119z"
      ></path>
      <path
        fill="url(#j)"
        d="M336.333 394.672c2.627-1.528 3.024-5.118.875-7.267L124.595 174.792c-2.149-2.149-5.739-1.752-7.267.875a158.87 158.87 0 00-7.119 13.725c-.811 1.771-.41 3.852.968 5.229l206.201 206.202c1.378 1.378 3.459 1.779 5.23.968a158.87 158.87 0 0013.725-7.119z"
      ></path>
      <path
        fill="url(#k)"
        d="M286.659 413.348c3.619-.707 4.86-5.136 2.253-7.743L106.395 223.088c-2.607-2.607-7.036-1.366-7.743 2.253a160.813 160.813 0 00-2.502 18.462 4.666 4.666 0 001.366 3.654l167.027 167.027a4.667 4.667 0 003.654 1.366 160.834 160.834 0 0018.462-2.502z"
      ></path>
      <path
        fill="url(#l)"
        d="M286.659 413.348c3.619-.707 4.86-5.136 2.253-7.743L106.395 223.088c-2.607-2.607-7.036-1.366-7.743 2.253a160.813 160.813 0 00-2.502 18.462 4.666 4.666 0 001.366 3.654l167.027 167.027a4.667 4.667 0 003.654 1.366 160.834 160.834 0 0018.462-2.502z"
      ></path>
      <path
        fill="url(#m)"
        d="M217.031 411.577c4.45 1.107 7.201-4.155 3.959-7.398L107.821 291.01c-3.243-3.242-8.504-.491-7.398 3.959 6.784 27.279 20.838 53.121 42.163 74.445 21.324 21.324 47.166 35.379 74.445 42.163z"
      ></path>
      <path
        fill="url(#n)"
        d="M217.031 411.577c4.45 1.107 7.201-4.155 3.959-7.398L107.821 291.01c-3.243-3.242-8.504-.491-7.398 3.959 6.784 27.279 20.838 53.121 42.163 74.445 21.324 21.324 47.166 35.379 74.445 42.163z"
      ></path>
      <path
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="5"
        d="M362.088 372.649c-.816.746-2.119.733-2.963-.111L139.462 152.875c-.844-.844-.857-2.147-.111-2.963a160.661 160.661 0 015.003-5.234c61.571-61.57 161.397-61.57 222.968 0 61.571 61.571 61.571 161.397 0 222.968a160.661 160.661 0 01-5.234 5.003zm-26.648 16.523c1.038 1.038.786 2.67-.364 3.34a156.562 156.562 0 01-13.51 7.006c-.794.364-1.761.197-2.42-.462L112.944 192.854c-.659-.659-.826-1.626-.462-2.42a156.562 156.562 0 017.006-13.51c.67-1.15 2.302-1.402 3.34-.364L335.44 389.172zm-48.296 18.201c1.276 1.276.574 3.221-.964 3.521a158.269 158.269 0 01-18.175 2.463 2.167 2.167 0 01-1.694-.64L99.283 245.689a2.167 2.167 0 01-.64-1.694 158.313 158.313 0 012.463-18.175c.3-1.538 2.245-2.24 3.521-.964l182.517 182.517zm-67.922-1.426c.81.81.812 1.735.464 2.391-.333.63-1.007 1.072-2.052.813-26.85-6.678-52.286-20.51-73.28-41.505-20.995-20.994-34.827-46.43-41.505-73.28-.259-1.045.183-1.719.813-2.052.656-.348 1.581-.346 2.391.464l113.169 113.169z"
        style={{ mixBlendMode: 'soft-light' }}
      ></path>
      <defs>
        <linearGradient id="a" x1="256" x2="256" y1="0" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2D2E31"></stop>
          <stop offset="1" stopColor="#0F1012"></stop>
        </linearGradient>
        <linearGradient id="d" x1="256.306" x2="256.306" y1="95.332" y2="379.492" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#C5C5C5"></stop>
        </linearGradient>
        <linearGradient id="f" x1="178.365" x2="178.365" y1="167.248" y2="351.126" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#C5C5C5"></stop>
        </linearGradient>
        <linearGradient id="g" x1="256" x2="256" y1="96" y2="416" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#CCC"></stop>
        </linearGradient>
        <linearGradient id="i" x1="256" x2="256" y1="96" y2="416" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#CCC"></stop>
        </linearGradient>
        <linearGradient id="k" x1="256" x2="256" y1="96" y2="416" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#CCC"></stop>
        </linearGradient>
        <linearGradient id="m" x1="256" x2="256" y1="96" y2="416" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#CCC"></stop>
        </linearGradient>
        <radialGradient
          id="h"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(0 320 -320 0 256 96)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff"></stop>
          <stop offset="0.598" stopColor="#fff" stopOpacity="0"></stop>
        </radialGradient>
        <radialGradient
          id="j"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(0 320 -320 0 256 96)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff"></stop>
          <stop offset="0.598" stopColor="#fff" stopOpacity="0"></stop>
        </radialGradient>
        <radialGradient
          id="l"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(0 320 -320 0 256 96)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff"></stop>
          <stop offset="0.598" stopColor="#fff" stopOpacity="0"></stop>
        </radialGradient>
        <radialGradient
          id="n"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(0 320 -320 0 256 96)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff"></stop>
          <stop offset="0.598" stopColor="#fff" stopOpacity="0"></stop>
        </radialGradient>
        <filter
          id="b"
          width="295.583"
          height="295.582"
          x="126.135"
          y="66.88"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-5.12"></feOffset>
          <feGaussianBlur stdDeviation="12"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"></feColorMatrix>
          <feBlend in2="BackgroundImageFix" mode="plus-lighter" result="effect1_dropShadow_14134_4654"></feBlend>
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_14134_4654" result="shape"></feBlend>
        </filter>
        <filter
          id="c"
          width="267.583"
          height="267.582"
          x="140.135"
          y="86"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur result="effect1_foregroundBlur_14134_4654" stdDeviation="5"></feGaussianBlur>
        </filter>
        <filter
          id="e"
          width="171.522"
          height="177.592"
          x="102.218"
          y="160.522"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur result="effect1_foregroundBlur_14134_4654" stdDeviation="5"></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  )
}

export const NotionIcon = ({ size = 24 }: IconPropTypes) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
        fill="#fff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
        fill="#000"
      />
    </svg>
  )
}

export const GoogleIcon = ({ size = 24 }: { size: number }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}

export const GoogleMeetIcon = ({ size = 24 }: { size: number }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={size} height={size}>
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M166 106v90h-90" fill="#ea4335"></path>
        <path d="M166 106v90h120v62l90-73v-49q0-30-30-30" fill="#ffba00"></path>
        <path d="M164 406v-90h122v-60l90 71v49q0 30-30 30" fill="#00ac47"></path>
        <path d="M286 256l90-73v146" fill="#00832d"></path>
        <path d="M376 183l42-34c9-7 18-7 18 7v200c0 14-9 14-18 7l-42-34" fill="#00ac47"></path>
        <path d="M76 314v62q0 30 30 30h60v-92" fill="#0066da"></path>
        <path d="M76 196h90v120h-90" fill="#2684fc"></path>
      </g>
    </svg>
  )
}

export const SlackIcon = ({ size = 24 }: IconPropTypes) => {
  return (
    <svg
      width={size}
      height={size}
      enableBackground="new 0 0 2447.6 2452.5"
      viewBox="0 0 2447.6 2452.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipRule="evenodd" fillRule="evenodd">
        <path
          d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z"
          fill="#36c5f0"
        />
        <path
          d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z"
          fill="#2eb67d"
        />
        <path
          d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z"
          fill="#ecb22e"
        />
        <path
          d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0"
          fill="#e01e5a"
        />
      </g>
    </svg>
  )
}

export const MeetingIcon = ({ meeting, size }: { meeting: Meeting; size: number }) => {
  switch (meeting.app.name) {
    case 'Google Meet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_3598_55)">
            <mask
              id="mask0_3598_55"
              contentStyleType="mask-type:luminance"
              maskUnits="userSpaceOnUse"
              x="1"
              y="1"
              width="22"
              height="22"
            >
              <path d="M23 1H1V23H23V1Z" fill="white" />
            </mask>
            <g mask="url(#mask0_3598_55)">
              <path
                d="M16.8125 14.9736V14.4399V13.7028V10.2333V9.49617L17.3804 8.31424L20.2201 6.06479C20.5987 5.74707 21.1667 6.01396 21.1667 6.5096V17.2612C21.1667 17.7569 20.5861 18.0238 20.2075 17.706L16.8125 14.9736Z"
                fill="#00AC47"
              />
              <path d="M7.41666 4.4375L2.83333 9.02083H7.41666V4.4375Z" fill="#FE2C25" />
              <path d="M7.41665 9.02084H2.83332V14.9792H7.41665V9.02084Z" fill="#2684FC" />
              <path
                d="M2.83332 14.9792V18.0347C2.83332 18.875 3.52082 19.5625 4.36111 19.5625H7.41665V14.9792H2.83332Z"
                fill="#0066DA"
              />
              <path
                d="M17.3854 5.94775C17.3854 5.11712 16.7125 4.4375 15.8901 4.4375H12.8995H7.41666V9.02083H13.0312V12L17.3854 11.8629V5.94775Z"
                fill="#FFBA00"
              />
              <path
                d="M13.0312 14.9792H7.41666V19.5625H12.8995H15.8901C16.7125 19.5625 17.3854 18.8839 17.3854 18.0544V12H13.0312V14.9792Z"
                fill="#00AC47"
              />
              <path d="M17.3854 8.33334V15.4375L13.0312 12L17.3854 8.33334Z" fill="#00832D" />
            </g>
          </g>
          <defs>
            <clipPath id="clip0_3598_55">
              <rect width="22" height="22" fill="white" transform="translate(1 1)" />
            </clipPath>
          </defs>
        </svg>
      )

    case 'Zoom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_3598_48)">
            <path
              d="M22 12C22 13.0694 21.9143 14.1179 21.75 15.1404C21.2064 18.5251 18.525 21.2061 15.14 21.7498C14.1179 21.914 13.0693 22 12 22C10.9307 22 9.88212 21.914 8.86 21.7498C5.475 21.2061 2.79359 18.5251 2.24998 15.1404C2.08571 14.1179 2 13.0694 2 12C2 10.9306 2.08571 9.88207 2.24998 8.85964C2.79359 5.47493 5.47499 2.79386 8.86 2.25021C9.88212 2.086 10.9307 2 12 2C13.0693 2 14.1179 2.086 15.14 2.25021C18.525 2.79386 21.2064 5.47493 21.75 8.85964C21.9143 9.88207 22 10.9306 22 12Z"
              fill="#0B5CFF"
            />
            <path
              d="M22 12C22 13.0694 21.9143 14.1179 21.75 15.1404C21.2064 18.5251 18.525 21.2061 15.14 21.7498C14.1179 21.914 13.0693 22 12 22C10.9307 22 9.88212 21.914 8.86 21.7498C5.475 21.2061 2.79359 18.5251 2.24998 15.1404C2.08571 14.1179 2 13.0694 2 12C2 10.9306 2.08571 9.88207 2.24998 8.85964C2.79359 5.47493 5.47499 2.79386 8.86 2.25021C9.88212 2.086 10.9307 2 12 2C13.0693 2 14.1179 2.086 15.14 2.25021C18.525 2.79386 21.2064 5.47493 21.75 8.85964C21.9143 9.88207 22 10.9306 22 12Z"
              fill="url(#paint0_radial_3598_48)"
            />
            <path
              d="M22 12C22 13.0694 21.9143 14.1179 21.75 15.1404C21.2057 18.5251 18.525 21.2061 15.14 21.7498C14.1179 21.914 13.0693 22 12 22C10.9307 22 9.88212 21.914 8.85931 21.7498C5.475 21.2061 2.79359 18.5251 2.24998 15.1404C2.08571 14.1179 2 13.0694 2 12C2 10.9307 2.08571 9.88207 2.24998 8.85957C2.79359 5.47493 5.47499 2.79379 8.85931 2.25014C9.88212 2.08593 10.9307 2 12 2C13.0693 2 14.1179 2.08593 15.14 2.25014C18.525 2.79378 21.2064 5.47493 21.75 8.85957C21.9143 9.88207 22 10.9306 22 12Z"
              fill="url(#paint1_radial_3598_48)"
            />
            <path
              d="M14.1429 14.5C14.1429 15.0917 13.6629 15.5714 13.0714 15.5714H8.42857C7.24501 15.5714 6.28571 14.6121 6.28571 13.4286V9.5C6.28571 8.90829 6.76571 8.42857 7.35714 8.42857H12C13.1836 8.42857 14.1429 9.38793 14.1429 10.5714V14.5ZM16.8571 9.07136L15.2857 10.2499C15.0157 10.4523 14.8571 10.7699 14.8571 11.1071V12.8928C14.8571 13.2301 15.0157 13.5476 15.2857 13.7499L16.8571 14.9285C17.21 15.1934 17.7143 14.9414 17.7143 14.4999V9.49993C17.7143 9.0585 17.21 8.8065 16.8571 9.07136Z"
              fill="white"
            />
          </g>
          <defs>
            <radialGradient
              id="paint0_radial_3598_48"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(12 10.8379) scale(13.4826 11.2685)"
            >
              <stop offset="0.82" stopColor="#365CFA" stopOpacity="0" />
              <stop offset="0.98" stopColor="#233EAD" />
            </radialGradient>
            <radialGradient
              id="paint1_radial_3598_48"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(12.0003 13.158) scale(13.4781 11.2647)"
            >
              <stop offset="0.8" stopColor="#365CFA" stopOpacity="0" />
              <stop offset="1" stopColor="#80A2ED" />
            </radialGradient>
            <clipPath id="clip0_3598_48">
              <rect width="20" height="20" fill="white" transform="translate(2 2)" />
            </clipPath>
          </defs>
        </svg>
      )

    default:
      return <VoiceSquare size={size} variant="Bold" />
  }
}

export const XIcon = ({ size = 24, color = 'currentColor' }: IconPropTypes) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.16663 15.8333L15.8333 4.16663"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8333 15.8333L4.16663 4.16663"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
