import React, { useState, useEffect, useRef } from 'react';
import { Filter, Globe } from 'lucide-react';
import { getGenres, getLanguages } from '../services/tmdbApi';

const FilterBar = ({ onGenreFilter, onLanguageChange, currentLanguage, selectedGenres }) => {
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const genreDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  useEffect(() => {
    loadGenres();
    loadLanguages();
  }, [currentLanguage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadGenres = async () => {
    const genreList = await getGenres(currentLanguage);
    setGenres(genreList);
  };

  const loadLanguages = async () => {
    const langList = await getLanguages();
    const commonLanguages = langList.filter(lang =>
      ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'].includes(lang.iso_639_1)
    );
    setLanguages(commonLanguages);
  };

  const handleGenreToggle = (genreId) => {
    const newSelection = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    onGenreFilter(newSelection);
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.iso_639_1 === currentLanguage);
    return lang ? lang.english_name : 'English';
  };

  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative" ref={genreDropdownRef}>
        <button
          onClick={() => setShowGenreDropdown(!showGenreDropdown)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filter by Genre</span>
          {selectedGenres.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {selectedGenres.length}
            </span>
          )}
        </button>

        {showGenreDropdown && (
          <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              {genres.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.id)}
                    onChange={() => handleGenreToggle(genre.id)}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{genre.name}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => {
                  onGenreFilter([]);
                  setShowGenreDropdown(false);
                }}
                className="w-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={languageDropdownRef}>
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{getCurrentLanguageName()}</span>
        </button>

        {showLanguageDropdown && (
          <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.iso_639_1}
                onClick={() => {
                  onLanguageChange(lang.iso_639_1);
                  setShowLanguageDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${currentLanguage === lang.iso_639_1 ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
              >
                {lang.english_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;