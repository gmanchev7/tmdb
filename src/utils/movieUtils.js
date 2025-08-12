
export const removeDuplicates = (movies) => {
  const seen = new Set();
  const uniqueMovies = [];

  for (const movie of movies) {
    if (!seen.has(movie.tmdbId)) {
      seen.add(movie.tmdbId);
      uniqueMovies.push(movie);
    } else {
      console.warn(`Duplicate movie detected and removed: ${movie.title} (ID: ${movie.tmdbId})`);
    }
  }

  return uniqueMovies;
};

export const movieExists = (movies, tmdbId) => {
  return movies.some(movie => movie.tmdbId === tmdbId);
};

export const validateMovie = (movie) => {
  if (!movie) return false;
  if (!movie.tmdbId) return false;
  if (!movie.title) return false;
  return true;
};

export const safeArrayMove = (array, fromIndex, toIndex) => {
  if (fromIndex === toIndex) return array;
  if (fromIndex < 0 || fromIndex >= array.length) return array;
  if (toIndex < 0 || toIndex >= array.length) return array;

  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);

  return removeDuplicates(newArray);
};