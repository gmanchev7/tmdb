export const parseMovieTitles = (fileContent) => {
  const lines = fileContent.split('\n');
  const seenTitles = new Set();
  const movies = [];

  lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .forEach((title, index) => {
      const normalizedTitle = title.toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        movies.push({
          id: `movie-${index}`,
          title: title,
          selected: true,
        });
      } else {
        console.warn(`Duplicate movie title detected and skipped: "${title}"`);
      }
    });

  return movies;
};

export const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};