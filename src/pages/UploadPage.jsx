import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import MovieList from '../components/MovieList';
import { parseMovieTitles, readFileContent } from '../utils/fileParser';
import { Search, AlertCircle } from 'lucide-react';

const UploadPage = () => {
  const [movies, setMovies] = useState([]);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (file) => {
    if (!file) {
      setMovies([]);
      setIsFileLoaded(false);
      return;
    }

    try {
      const content = await readFileContent(file);
      const movieList = parseMovieTitles(content);

      if (movieList.length === 0) {
        setError('No movie titles found in the file');
        return;
      }

      setMovies(movieList);
      setIsFileLoaded(true);
      setError(null);
    } catch (err) {
      setError('Error reading file: ' + err.message);
      console.error('File reading error:', err);
    }
  };

  const handleToggleMovie = (movieId) => {
    setMovies(prevMovies =>
      prevMovies.map(movie =>
        movie.id === movieId
          ? { ...movie, selected: !movie.selected }
          : movie
      )
    );
  };

  const handleSelectAll = () => {
    setMovies(prevMovies =>
      prevMovies.map(movie => ({ ...movie, selected: true }))
    );
  };

  const handleDeselectAll = () => {
    setMovies(prevMovies =>
      prevMovies.map(movie => ({ ...movie, selected: false }))
    );
  };

  const handleSearch = () => {
    const selectedMovies = movies.filter(movie => movie.selected);
    if (selectedMovies.length === 0) {
      setError('Please select at least one movie to search');
      return;
    }

    navigate('/preview', { state: { movies: selectedMovies } });
  };

  const selectedCount = movies.filter(m => m.selected).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Movie Database Search
          </h1>
          <p className="text-gray-600">
            Upload a text file with movie titles to search TMDB
          </p>
        </div>

        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {isFileLoaded && (
          <>
            <MovieList
              movies={movies}
              onToggleMovie={handleToggleMovie}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            <div className="flex justify-center mt-8">
              <button
                onClick={handleSearch}
                disabled={selectedCount === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${selectedCount > 0
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <Search className="w-5 h-5" />
                <span>Search TMDB ({selectedCount} movies)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPage;