import fetch from 'node-fetch';

const BASE_URL = 'https://openlibrary.org';

export async function fetchBookByISBN(isbn) {
  try {
    const response = await fetch(`${BASE_URL}/isbn/${isbn}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Extract author name from the title if it contains it
    let authorName = 'Unknown';
    if (data.authors && data.authors[0] && data.authors[0].key) {
      try {
        const authorResponse = await fetch(`${BASE_URL}${data.authors[0].key}.json`);
        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          authorName = authorData.name;
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    }

    // Handle cover image
    const coverImage = data.covers 
      ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
      : 'https://covers.openlibrary.org/b/id/-1-M.jpg';

    // Extract publication year
    const publicationYear = data.publish_date 
      ? parseInt(data.publish_date.match(/\d{4}/)?.[0]) 
      : new Date().getFullYear();

    return {
      title: data.title,
      author: authorName,
      description: data.description?.value || data.description || 'No description available',
      isbn: isbn,
      coverImage: coverImage,
      category: 'Other', // Default category
      publisher: data.publishers?.[0] || 'Unknown',
      publicationYear: publicationYear
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    throw error;
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
      coverImage: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
        : 'https://covers.openlibrary.org/b/id/-1-M.jpg',
      publicationYear: book.first_publish_year
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}