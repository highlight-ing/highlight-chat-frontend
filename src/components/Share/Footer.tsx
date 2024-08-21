'use client'

import React from 'react'
import { SocialIcon } from 'react-social-icons'
import footerStyles from './footer.module.scss'

const Footer: React.FC = () => {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerContent}>
        <div className="text-light-60">© 2024 Highlight</div>
        <div className="flex gap-4">
          <SocialIcon
            url="https://x.com/tryhighlight"
            network="x"
            style={{ height: 30, width: 30 }}
            fgColor="#999999"
            bgColor="transparent"
            className="transition-opacity hover:opacity-80"
          />
          <SocialIcon
            url="https://discord.gg/DfaduA53"
            network="discord"
            style={{ height: 30, width: 30 }}
            fgColor="#999999"
            bgColor="transparent"
            className="transition-opacity hover:opacity-80"
          />
        </div>
      </div>
    </footer>
  )
}

export default Footer
