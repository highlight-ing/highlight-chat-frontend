import React from 'react'
import headerStyles from './header.module.scss'

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className={headerStyles.header}>
      <h1>{title}</h1>
    </div>
  )
}

export default Header
