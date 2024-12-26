const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:3000";


// Fetch recommendations based on product name
export const fetchRecommendations = async (productName, category = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_name: productName, category }),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

// Fetch top-rated products
export const fetchTopRatedProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/top-rated`);
    if (!response.ok) throw new Error("Failed to fetch top-rated products");
    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

// Fetch personalized recommendations
export const fetchSearchHistoryRecommendations = async (userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/recommendations/search-history?user_id=${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error(error.message);
    return [];
  }
};
