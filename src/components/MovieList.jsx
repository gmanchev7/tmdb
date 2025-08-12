import React from 'react';
import { Check } from 'lucide-react';

const MovieList = ({ movies, onToggleMovie, onSelectAll, onDeselectAll }) => {
  const selectedCount = movies.filter(movie => movie.selected).length;
  const totalCount = movies.length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Movie List ({selectedCount}/{totalCount} selected)
            </h2>
            <div className="space-x-2">
              <button
                onClick={onSelectAll}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={onDeselectAll}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {movies.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No movies loaded. Please upload a .txt file.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {movies.map((movie) => (
                <li
                  key={movie.id}
                  className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                >
                  <label className="flex items-center cursor-pointer flex-1">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={movie.selected}
                        onChange={() => onToggleMovie(movie.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-colors ${movie.selected
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                          }`}
                      >
                        {movie.selected && (
                          <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span
                      className={`ml-3 ${movie.selected ? 'text-gray-900' : 'text-gray-500'
                        }`}
                    >
                      {movie.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieList;