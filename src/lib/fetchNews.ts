export interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  image: string;
  summary: string;
}

export async function fetchTopHeadlines(): Promise<NewsItem[]> {
  try {
    // Using Saurav.tech Proxy for NewsAPI (No Key Required for Demo)
    // Sourcing US Technology News
    const response = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json');
    const data = await response.json();

    if (!data.articles) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.articles.map((article: any, index: number) => ({
      id: index,
      title: article.title,
      source: article.source.name,
      date: new Date(article.publishedAt).toLocaleDateString(),
      image: article.urlToImage || `https://picsum.photos/seed/${index}/800/600`, // Fallback
      summary: article.description || "Content corrupted. No summary available for this transmission."
    }));
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}
