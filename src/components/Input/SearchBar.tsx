import React, { useState } from 'react'
import { SearchNormal1, CloseCircle, TickSquare } from 'iconsax-react'

const SearchBar: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchText, setSearchText] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  if (isSearching) {
    return (
    <div className="h-14 w-full flex items-center justify-between border-b border-white/5 px-5">
        <div className="flex items-center gap-3 flex-1">
          <SearchNormal1 
            size={20} 
            color="#484848" 
            className="cursor-pointer"
          />
          <input
            type="text"
            value={searchText}
            onChange={handleSearch}
            placeholder="Search audio notes..."
            className="w-full bg-transparent text-[#484848] text-[15px] font-medium leading-tight outline-none placeholder:text-[#484848]"
            autoFocus
          />
        </div>
        <div 
          className="cursor-pointer ml-6"
          onClick={() => {
            setIsSearching(false);
            setSearchText('');
          }}
        >
          <CloseCircle size={20} color="#484848" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-14 w-full flex items-center justify-between border-b border-white/5">
        {/* left section */}
        <div className="flex items-center gap-2">
        <div className="w-5 h-5 relative cursor-pointer" onClick={() => setIsSearching(true)}>
          <SearchNormal1 size={20} color="#484848"/>
        </div>
        <div className="flex items-center">
          <div className="px-2 py-1.5 rounded-md">
            <span className="text-[15px] font-medium text-white">Meeting notes</span>
          </div>
          <div className="px-2 py-1.5">
            <span className="text-[15px] font-medium text-[#484848]">Audio notes</span>
          </div>
          <div className="px-2 py-1.5">
            <span className="text-[15px] font-medium text-[#484848]">All</span>
          </div>
        </div>
      </div>

       {/* Right section */}
      <div className="flex items-center px-4">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
        <TickSquare size={16} color="#484848"/>
        <span className="text-[15px] font-medium text-[#484848]">Select</span>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
