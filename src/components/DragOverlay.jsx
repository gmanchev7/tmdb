import React from 'react';
import { Star, Calendar, Clock, GripVertical } from 'lucide-react';

const DragOverlay = ({ movie }) => {
  if (!movie) return null;

  return (
    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-blue-500 opacity-95 transform rotate-2">
      <div className="flex">
        <div className="flex items-center px-3 bg-blue-50">
          <GripVertical className="w-5 h-5 text-blue-500" />
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
          <div className="mb-2">
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

          <p className="text-gray-700 text-sm line-clamp-2">{movie.overview}</p>
        </div>
      </div>
    </div>
  );
};

export default DragOverlay;