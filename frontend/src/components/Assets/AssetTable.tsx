import { useState } from 'react';
import { 
    Search, Visibility, Edit, Delete, Computer, PhoneAndroid, Storage, Router
} from '@mui/icons-material';

// Types
export interface Asset {
    id: string;
    name: string;
    ipAddress: string;
    operatingSystem: string;
    services: string[];
    lastUpdated: string;
}

interface AssetTableProps {
    assets: Asset[];
}

// SearchBar Component
const SearchBar = ({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (term: string) => void }) => (
    <div className="relative mt-4 mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" />
        </div>
        <input
            type="text"
            placeholder="Search assets..."
            className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </div>
);

// TableHeader Component
const TableHeader = () => (
    <thead className="bg-blue-50">
        <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Host/Device Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">IP Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Operating System</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Services</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Updated</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
        </tr>
    </thead>
);

// AssetRow Component
const AssetRow = ({ asset }: { asset: Asset }) => {
    // Get icon based on operating system
    const getOsIcon = (os: string) => {
        if (os.toLowerCase().includes('windows') || os.toLowerCase().includes('linux') || os.toLowerCase().includes('macos')) {
            return <Computer className="text-sm" />;
        } else if (os.toLowerCase().includes('android') || os.toLowerCase().includes('ios')) {
            return <PhoneAndroid className="text-sm" />;
        } else if (os.toLowerCase().includes('server')) {
            return <Storage className="text-sm" />;
        }
        return <Router className="text-sm" />;
    };
    
    return (
        <tr key={asset.id} className="hover:bg-gray-50 odd:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{asset.ipAddress}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    {getOsIcon(asset.operatingSystem)}
                    <span>{asset.operatingSystem}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                    {asset.services.map((service, idx) => (
                        <span 
                            key={idx} 
                            className="px-2 py-1 text-xs border border-blue-500 text-blue-600 rounded-full"
                        >
                            {service}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{asset.lastUpdated}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <ActionButtons />
            </td>
        </tr>
    );
};

// ActionButtons Component
const ActionButtons = () => (
    <>
        <button className="p-1 text-blue-400 hover:text-blue-600 mr-1" title="View">
            <Visibility className="text-sm" />
        </button>
        <button className="p-1 text-blue-600 hover:text-blue-800 mr-1" title="Edit">
            <Edit className="text-sm" />
        </button>
        <button className="p-1 text-red-500 hover:text-red-700" title="Delete">
            <Delete className="text-sm" />
        </button>
    </>
);

// Pagination Component
const Pagination = ({ 
    page, 
    rowsPerPage, 
    totalItems, 
    handleChangePage, 
    handleChangeRowsPerPage 
}: { 
    page: number; 
    rowsPerPage: number; 
    totalItems: number; 
    handleChangePage: (event: unknown, newPage: number) => void; 
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) => (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
            <button 
                onClick={() => handleChangePage(null, page - 1)} 
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                Previous
            </button>
            <button 
                onClick={() => handleChangePage(null, page + 1)} 
                disabled={page >= Math.ceil(totalItems / rowsPerPage) - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                Next
            </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                        {Math.min((page + 1) * rowsPerPage, totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{totalItems}</span> results
                </p>
            </div>
            <div>
                <select 
                    value={rowsPerPage} 
                    onChange={(e) => handleChangeRowsPerPage(e as any)}
                    className="mr-4 border border-gray-300 rounded px-2 py-1"
                >
                    {[5, 10, 25].map((rows) => (
                        <option key={rows} value={rows}>
                            {rows} per page
                        </option>
                    ))}
                </select>
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={() => handleChangePage(null, page - 1)}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {[...Array(Math.min(5, Math.ceil(totalItems / rowsPerPage)))].map((_, idx) => {
                        const pageNumber = page + idx - Math.min(page, 2);
                        if (pageNumber < 0 || pageNumber >= Math.ceil(totalItems / rowsPerPage)) return null;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleChangePage(null, pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                    ${page === pageNumber
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNumber + 1}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => handleChangePage(null, page + 1)}
                        disabled={page >= Math.ceil(totalItems / rowsPerPage) - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
    </div>
);

// Main AssetTable Component
const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    // Handle page change
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter assets based on search term
    const filteredAssets = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.operatingSystem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-100">
                <h2 className="text-lg font-bold text-blue-600">Assets</h2>
                
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <TableHeader />
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAssets
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((asset) => (
                                    <AssetRow key={asset.id} asset={asset} />
                                ))}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalItems={filteredAssets.length}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </div>
        </div>
    );
};

export default AssetTable;