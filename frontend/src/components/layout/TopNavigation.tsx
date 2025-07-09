import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

const TopNavigation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 tracking-tight">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#2563eb" />
            <path d="M10 16l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CTEM SYSTEM
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search"
            className="rounded-lg border border-gray-300 pl-9 pr-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none transition"
          />
          <SearchIcon
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            fontSize="small"
          />
        </div>
        <button className="rounded-full bg-blue-600 p-2 text-white shadow hover:bg-blue-700 transition">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v6m0 0l-1.405 1.405M9 17h6" />
          </svg>
        </button>
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="User"
          className="h-9 w-9 rounded-full border-2 border-blue-600 shadow"
        />
      </div>
    </nav>
  );
};

export default TopNavigation;