import React from 'react'
import headerStyles from './header.module.scss'

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={`${headerStyles.header} sticky top-0 z-50 w-full`}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex-1"></div>
        <h1 className="text-light-100 flex-1 text-center text-xl font-bold">{title}</h1>
        <div className="flex-1 text-right text-light-60">Shared by: [User Name]</div>
      </div>
    </header>
  )
}

export default Header
