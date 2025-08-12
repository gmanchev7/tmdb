const API_BASE_URL = 'http://localhost:3000/api';
const makeRequest = async (url, options = {}) => {
  try {
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }).catch(() => {
      console.log('⚠️ Network request failed (expected with fake endpoint)');
    });
  } catch (error) {
  }

  return null;
};

export const saveMovieEdit = async (movie) => {
  console.log('🔄 Sending PUT request to /api/movies/' + movie.tmdbId);
  console.log('📤 Request body:', movie);

  await makeRequest(`${API_BASE_URL}/movies/${movie.tmdbId}`, {
    method: 'PUT',
    body: JSON.stringify(movie)
  });

  const response = {
    status: 200,
    success: true,
    message: `Movie "${movie.title}" updated successfully`,
    data: {
      tmdbId: movie.tmdbId,
      updatedAt: new Date().toISOString(),
      changes: {
        title: movie.title,
        overview: movie.overview,
        director: movie.director,
        actors: movie.actors,
        genres: movie.genres,
        release: movie.release,
        duration: movie.duration
      }
    }
  };

  console.log('✅ PUT /api/movies/' + movie.tmdbId + ' - Success (simulated)');
  console.log('📥 Response:', response);

  return response;
};

export const saveAllMovies = async (moviesData) => {
  console.log('🔄 Sending POST request to /api/movies/save-all');
  console.log('📤 Request body:', {
    count: moviesData.movies.length,
    language: moviesData.language,
    timestamp: moviesData.timestamp
  });

  await makeRequest(`${API_BASE_URL}/movies/save-all`, {
    method: 'POST',
    body: JSON.stringify(moviesData)
  });

  const response = {
    status: 201,
    success: true,
    message: `Successfully saved ${moviesData.movies.length} movies`,
    data: {
      savedCount: moviesData.movies.length,
      timestamp: new Date().toISOString(),
      language: moviesData.language,
      batchId: `BATCH-${Date.now()}`,
      summary: {
        total: moviesData.movies.length,
        genres: [...new Set(moviesData.movies.flatMap(m => m.genres))],
        averageRating: (moviesData.movies.reduce((acc, m) => acc + (m.rating || 0), 0) / moviesData.movies.length).toFixed(2)
      }
    }
  };

  console.log('✅ POST /api/movies/save-all - Success (simulated)');
  console.log('📥 Response:', response);
  console.log('📊 Saved movies data:', moviesData);

  return response;
};

export const deleteMovie = async (tmdbId) => {
  console.log('🔄 Sending DELETE request to /api/movies/' + tmdbId);

  await makeRequest(`${API_BASE_URL}/movies/${tmdbId}`, {
    method: 'DELETE'
  });

  const response = {
    status: 200,
    success: true,
    message: `Movie with ID ${tmdbId} deleted successfully`,
    data: {
      deletedId: tmdbId,
      deletedAt: new Date().toISOString()
    }
  };

  console.log('✅ DELETE /api/movies/' + tmdbId + ' - Success (simulated)');
  console.log('📥 Response:', response);

  return response;
};

export const updateMovieOrder = async (orderedMovies) => {
  console.log('🔄 Sending PATCH request to /api/movies/reorder');
  const requestBody = {
    movieIds: orderedMovies.map(m => m.tmdbId),
    timestamp: new Date().toISOString()
  };
  console.log('📤 Request body:', requestBody);

  await makeRequest(`${API_BASE_URL}/movies/reorder`, {
    method: 'PATCH',
    body: JSON.stringify(requestBody)
  });

  const response = {
    status: 200,
    success: true,
    message: 'Movie order updated successfully',
    data: {
      reorderedCount: orderedMovies.length,
      newOrder: orderedMovies.map((m, i) => ({ tmdbId: m.tmdbId, position: i + 1 })),
      updatedAt: new Date().toISOString()
    }
  };

  console.log('✅ PATCH /api/movies/reorder - Success (simulated)');
  console.log('📥 Response:', response);

  return response;
};