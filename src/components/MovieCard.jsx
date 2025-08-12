import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Trash2, Star, Calendar, Clock, User, Film, Edit2, Save, X, GripVertical, ExternalLink, Loader, Check } from 'lucide-react';
import { saveMovieEdit } from '../services/apiService';

const MovieCard = ({ movie, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMovie, setEditedMovie] = useState(movie);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setEditedMovie(movie);
  }, [movie]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: movie.tmdbId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const loadingToast = toast.loading(`Saving "${editedMovie.title}"...`);

    try {
      const response = await saveMovieEdit(editedMovie);

      if (response.success) {
        onEdit(movie.tmdbId, editedMovie);
        setSaveSuccess(true);

        toast.success(`Movie "${editedMovie.title}" saved successfully!`, {
          id: loadingToast,
        });

        setTimeout(() => {
          setIsEditing(false);
          setSaveSuccess(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error(`Failed to save "${editedMovie.title}"`, {
        id: loadingToast,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedMovie(movie);
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setEditedMovie(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-md p-4 mb-4"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Edit Movie Details</h3>
          <div className="space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded transition-colors ${saveSuccess
                  ? 'bg-green-600 text-white'
                  : isSaving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
              {isSaving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editedMovie.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Director</label>
            <input
              type="text"
              value={editedMovie.director || ''}
              onChange={(e) => handleFieldChange('director', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
            <textarea
              value={editedMovie.overview}
              onChange={(e) => handleFieldChange('overview', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actors (comma-separated)</label>
            <input
              type="text"
              value={editedMovie.actors.join(', ')}
              onChange={(e) => handleFieldChange('actors', e.target.value.split(',').map(a => a.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genres (comma-separated)</label>
            <input
              type="text"
              value={editedMovie.genres.join(', ')}
              onChange={(e) => handleFieldChange('genres', e.target.value.split(',').map(g => g.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
            <input
              type="date"
              value={editedMovie.release}
              onChange={(e) => handleFieldChange('release', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={editedMovie.duration || ''}
              onChange={(e) => handleFieldChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md overflow-hidden mb-4 transition-all ${isDragging ? 'opacity-50 shadow-2xl z-50' : 'hover:shadow-lg'
        }`}
      {...attributes}
    >
      <div className="flex">
        <div
          className="flex items-center px-3 bg-gray-50 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {movie.poster && (
          <div className="w-32 h-48 flex-shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{movie.title}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                {movie.release && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(movie.release).getFullYear()}
                  </span>
                )}
                {movie.duration && (
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {movie.duration} min
                  </span>
                )}
                {movie.rating && (
                  <span className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {movie.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(movie.tmdbId)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{movie.overview}</p>

          <div className="space-y-2">
            {movie.director && (
              <div className="flex items-start">
                <Film className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">Director:</span> {movie.director}
                </span>
              </div>
            )}

            {movie.actors && movie.actors.length > 0 && (
              <div className="flex items-start">
                <User className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">Cast:</span> {movie.actors.join(', ')}
                </span>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {movie.trailer && (
              <a
                href={movie.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;