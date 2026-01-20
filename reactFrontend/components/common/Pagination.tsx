import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemsPerPage?: number;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  itemsPerPage,
  totalItems
}) => {
  const [jumpToPage, setJumpToPage] = useState('');

  if (totalPages <= 1) return null;

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      setJumpToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 sm:px-6 ${className}`}>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          {totalItems !== undefined && itemsPerPage !== undefined && (
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-l-md rounded-r-none border-r-0"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Simple page indicator for now. Complex pagination (1 ... 5 6 7 ... 10) can be added later */}
            <div className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-r-md rounded-l-none"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </Button>
          </nav>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Go to page"
              min={1}
              max={totalPages}
              className="w-28 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleJumpToPage}
              disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
            >
              Go
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="flex flex-col items-center space-y-2 w-full sm:hidden">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
             {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Go to page"
            min={1}
            max={totalPages}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToPage}
            disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
};
