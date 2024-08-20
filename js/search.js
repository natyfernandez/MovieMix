const apiKey = 'eb786160';

// Capturar el término de búsqueda de la URL
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('query');

if (searchQuery) {
    fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; // Limpiar resultados anteriores

            if (data.Response === 'True') {
                data.Search.forEach(movie => {
                    if (movie.Poster !== 'N/A') {
                        const movieElement = document.createElement('div');
                        movieElement.classList.add('card', 'mb-3');
                        movieElement.innerHTML = `
                            <div class="row g-0">
                                <div class="col-md-4">
                                    <img src="${movie.Poster}" class="img-fluid rounded-start" alt="${movie.Title}">
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                        <h5 class="card-title">${movie.Title}</h5>
                                        <p class="card-text">Year: ${movie.Year}</p>
                                        <p class="card-text">Type: ${movie.Type}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                        resultsDiv.appendChild(movieElement);
                    }
                });
            } else {
                resultsDiv.innerHTML = `<p>No results found for "${searchQuery}".</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('results').innerHTML = `<p>There was an error processing your request. Please try again later.</p>`;
        });
} else {
    document.getElementById('results').innerHTML = `<p>No search query provided.</p>`;
}
