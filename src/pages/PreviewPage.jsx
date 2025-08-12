import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import MovieCard from '../components/MovieCard';
import SearchDropdown from '../components/SearchDropdown';
import FilterBar from '../components/FilterBar';
import DragOverlayComponent from '../components/DragOverlay';
import { searchMovie, getMovieDetails, getGenres } from '../services/tmdbApi';
import { validateMovie, movieExists, removeDuplicates } from '../utils/movieUtils';
import { saveAllMovies, deleteMovie, updateMovieOrder } from '../services/apiService';
import { Save, ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tmdbMovies, setTmdbMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en-US');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [failedMovies, setFailedMovies] = useState([]);
  const [activeMovie, setActiveMovie] = useState(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    if (!location.state?.movies) {
      navigate('/');
      return;
    }
    loadGenres();
    fetchMovieData();
  }, [location.state, language]);

  useEffect(() => {
    filterMoviesByGenre();
  }, [tmdbMovies, selectedGenres]);

  const loadGenres = async () => {
    const genres = await getGenres(language);
    setAllGenres(genres);
  };

  const fetchMovieData = async () => {
    setIsLoading(true);
    setError(null);
    setFailedMovies([]);

    const movies = location.state.movies;
    setLoadingProgress({ current: 0, total: movies.length });

    toast.loading(`Fetching data for ${movies.length} movies from TMDB...`, {
      id: 'fetch-movies',
      duration: Infinity,
    });

    const validMovies = [];
    const failed = [];

    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      setLoadingProgress({ current: i + 1, total: movies.length });

      try {
        const tmdbData = await searchMovie(movie.title, language);
        if (tmdbData) {
          validMovies.push(tmdbData);
        } else {
          failed.push(movie.title);
        }
      } catch (err) {
        console.error(`Error fetching ${movie.title}:`, err);
        failed.push(movie.title);
      }
    }

    if (validMovies.length === 0) {
      toast.error('No movies found in TMDB. Please check your API key or movie titles.', {
        id: 'fetch-movies',
        duration: 5000,
      });
    } else if (failed.length > 0) {
      setFailedMovies(failed);
      toast.success(`Found ${validMovies.length} movies. ${failed.length} could not be found.`, {
        id: 'fetch-movies',
        icon: '⚠️',
      });
    } else {
      toast.success(`Successfully loaded ${validMovies.length} movies!`, {
        id: 'fetch-movies',
        duration: 3000,
      });
    }

    const uniqueMovies = removeDuplicates(validMovies);
    setTmdbMovies(uniqueMovies);
    setFilteredMovies(uniqueMovies);
    setIsLoading(false);
  };

  const filterMoviesByGenre = () => {
    if (selectedGenres.length === 0) {
      setFilteredMovies(tmdbMovies);
    } else {
      const filtered = tmdbMovies.filter(movie => {
        const movieGenreNames = movie.genres || [];
        const selectedGenreNames = allGenres
          .filter(g => selectedGenres.includes(g.id))
          .map(g => g.name);

        return movieGenreNames.some(genre =>
          selectedGenreNames.includes(genre)
        );
      });
      setFilteredMovies(filtered);
    }
  };

  const handleDeleteMovie = async (tmdbId) => {
    const movieToDelete = tmdbMovies.find(m => m.tmdbId === tmdbId);
    const movieTitle = movieToDelete?.title || 'Movie';

    const loadingToast = toast.loading(`Deleting "${movieTitle}"...`);

    try {
      const response = await deleteMovie(tmdbId);

      if (response.success) {
        setTmdbMovies(prev => prev.filter(movie => movie.tmdbId !== tmdbId));
        setFilteredMovies(prev => prev.filter(movie => movie.tmdbId !== tmdbId));
        toast.success(`"${movieTitle}" deleted successfully!`, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error(`Failed to delete "${movieTitle}"`, {
        id: loadingToast,
      });
    }
  };

  const handleEditMovie = (tmdbId, updatedMovie) => {
    setTmdbMovies(prev =>
      prev.map(movie =>
        movie.tmdbId === tmdbId ? updatedMovie : movie
      )
    );
    setFilteredMovies(prev =>
      prev.map(movie =>
        movie.tmdbId === tmdbId ? updatedMovie : movie
      )
    );
  };

  const handleAddMovie = async (movieId) => {
    const loadingToast = toast.loading('Adding movie to list...');

    try {
      setError(null);
      const movieDetails = await getMovieDetails(movieId, language);

      if (movieDetails && validateMovie(movieDetails)) {
        if (movieExists(tmdbMovies, movieDetails.tmdbId)) {
          toast.error(`"${movieDetails.title}" is already in your list!`, {
            id: loadingToast,
          });
          return;
        }

        setTmdbMovies([...tmdbMovies, movieDetails]);
        setFilteredMovies([...filteredMovies, movieDetails]);

        toast.success(`"${movieDetails.title}" added to list!`, {
          id: loadingToast,
        });
      }
    } catch (err) {
      console.error('Error adding movie:', err);
      toast.error('Failed to add movie. Please try again.', {
        id: loadingToast,
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const movie = filteredMovies.find(m => m.tmdbId === active.id);
    setActiveMovie(movie);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = filteredMovies.findIndex((item) => item.tmdbId === active.id);
      const newIndex = filteredMovies.findIndex((item) => item.tmdbId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFilteredOrder = arrayMove(filteredMovies, oldIndex, newIndex);
        setFilteredMovies(newFilteredOrder);

        if (selectedGenres.length === 0) {
          setTmdbMovies(newFilteredOrder);
        } else {
          setTmdbMovies(prev => {
            const movieToMove = prev.find(m => m.tmdbId === active.id);
            if (!movieToMove) return prev;

            const filteredOut = prev.filter(m => m.tmdbId !== active.id);
            const targetMovie = prev.find(m => m.tmdbId === over.id);
            const targetIndex = filteredOut.findIndex(m => m.tmdbId === over.id);

            if (targetIndex === -1) {
              return [...filteredOut, movieToMove];
            }

            const result = [...filteredOut];
            result.splice(targetIndex, 0, movieToMove);
            return result;
          });
        }

        try {
          await updateMovieOrder(newFilteredOrder);
          toast.success('Movie order updated!', {
            icon: '🎬',
            duration: 2000,
          });
        } catch (error) {
          console.error('Error updating movie order:', error);
          toast.error('Failed to update movie order');
        }
      }
    }

    setActiveMovie(null);
  };

  const handleSave = async () => {
    setIsSavingAll(true);

    const loadingToast = toast.loading(`Saving ${filteredMovies.length} movies...`);

    const dataToSave = {
      movies: filteredMovies.map((movie, index) => ({
        tmdbId: movie.tmdbId,
        title: movie.title,
        overview: movie.overview,
        actors: movie.actors,
        genres: movie.genres,
        poster: movie.poster,
        release: movie.release,
        rating: movie.rating,
        trailer: movie.trailer,
        director: movie.director,
        duration: movie.duration,
        order: index + 1
      })),
      language: language,
      totalMovies: filteredMovies.length,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await saveAllMovies(dataToSave);

      if (response.success) {
        toast.success(
          `Successfully saved ${response.data.savedCount} movies!`,
          {
            id: loadingToast,
            duration: 5000,
            icon: '🎉',
          }
        );

        toast.success(`Batch ID: ${response.data.batchId}`, {
          duration: 5000,
          icon: '📋',
        });
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save movies. Please try again.', {
        id: loadingToast,
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Fetching movie data from TMDB...</p>
          {loadingProgress.total > 0 && (
            <div className="w-64 mx-auto">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Processing {loadingProgress.current} of {loadingProgress.total} movies
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Movie Preview
              </h1>
              <p className="text-gray-600">
                {filteredMovies.length} of {tmdbMovies.length} movies
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={filteredMovies.length === 0 || isSavingAll}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${isSavingAll
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : filteredMovies.length > 0
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isSavingAll ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save All Movies</span>
              </>
            )}
          </button>
        </div>


        {failedMovies.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Some movies could not be found:</p>
                <ul className="text-yellow-700 text-sm mt-1">
                  {failedMovies.map((title, index) => (
                    <li key={index}>• {title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <SearchDropdown
            onSelectMovie={handleAddMovie}
            language={language}
          />
        </div>

        <FilterBar
          onGenreFilter={setSelectedGenres}
          onLanguageChange={setLanguage}
          currentLanguage={language}
          selectedGenres={selectedGenres}
        />

        <div className="space-y-4">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">
                {selectedGenres.length > 0
                  ? 'No movies match the selected genres'
                  : tmdbMovies.length === 0
                    ? 'No movies were found. Try uploading a different file or check the movie titles.'
                    : 'No movies to display'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext
                items={filteredMovies.map(movie => movie.tmdbId)}
                strategy={verticalListSortingStrategy}
              >
                {filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie.tmdbId}
                    movie={movie}
                    onDelete={handleDeleteMovie}
                    onEdit={handleEditMovie}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeMovie ? (
                  <DragOverlayComponent movie={activeMovie} />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;