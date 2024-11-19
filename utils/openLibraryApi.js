import fetch from 'node-fetch';

const BASE_URL = 'https://openlibrary.org';

export async function fetchBookByISBN(isbn) {
  try {
    const response = await fetch(`${BASE_URL}/isbn/${isbn}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Fetch additional author information
    let authorName = 'Unknown';
    if (data.authors && data.authors[0] && data.authors[0].key) {
      const authorResponse = await fetch(`${BASE_URL}${data.authors[0].key}.json`);
      if (authorResponse.ok) {
        const authorData = await authorResponse.json();
        authorName = authorData.name || 'Unknown';
      }
    }

    return {
      title: data.title,
      author: authorName,
      description: data.description?.value || data.description || 'No description available',
      isbn: isbn,
      coverImage: data.cover ? `https://covers.openlibrary.org/b/id/${data.cover.large || data.cover.medium || data.cover.small}-L.jpg` : null,
      publisher: data.publishers?.[0] || 'Unknown',
      publicationDate: data.publish_date,
      language: data.languages?.[0]?.key.split('/').pop() || 'Unknown',
      pages: data.number_of_pages || 0,
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}

export async function searchBooks(query, limit = 10) {
  try {
    const response = await fetch(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    return data.docs.map(book => ({
      title: book.title,
      author: book.author_name?.[0] || 'Unknown',
      isbn: book.isbn?.[0] || 'Unknown',
      coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
      publishYear: book.first_publish_year,
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}