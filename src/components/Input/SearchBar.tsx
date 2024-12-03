import React, { useState } from 'react'
import { SearchNormal1, CloseCircle, TickSquare } from 'iconsax-react'

const SearchBar: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [searchText, setSearchText] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  if (isSelecting) {
    return (
      <div className="h-14 w-full flex items-center justify-between border-b border-white/5">
        {/* left section */}
        <div className="flex items-center gap-2 pl-4">
          <div className="w-6 h-6 relative">
            <div className="w-4 h-4 left-[4px] top-[4px] absolute bg-[#222222] rounded-md shadow border border-[#3a3a3a]" />
          </div>
          <span className="text-[#eeeeee] text-[15px] font-semibold font-inter leading-tight">Select audio</span>
        </div>

        {/* Right section */}
        <div className="flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5">
              <span className="text-[#6e6e6e] text-[15px] font-normal font-inter leading-tight">Merge</span>
            </div>
            <div className="px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5">
              <span className="text-[#6e6e6e] text-[15px] font-normal font-inter leading-tight">Delete</span>
            </div>
            <div 
              className="px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5"
              onClick={() => setIsSelecting(false)}
            >
              <span className="text-[#6e6e6e] text-[15px] font-normal font-inter leading-tight">Cancel</span>
            </div>
          </div>
        </div>
      </div>
    )
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
            setIsSearching(false)
            setSearchText('')
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
        <div 
          className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-white/5"
          onClick={() => setIsSelecting(true)}
        >
          <TickSquare size={16} color="#484848"/>
          <span className="text-[15px] font-medium text-[#484848]">Select</span>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
