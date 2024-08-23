import React from 'react'
import headerStyles from './header.module.scss'

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.headerContent}>
        <h1>{title}</h1>
      </div>
    </header>
  )
}

export default Header
