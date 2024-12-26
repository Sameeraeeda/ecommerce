#recommendation_model.py
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel
import torch
from pymongo import MongoClient
from bson import ObjectId
from nltk.stem import PorterStemmer
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import nltk

# Download necessary NLTK data (ensure this is run once)
nltk.download('wordnet')
nltk.download('omw-1.4')

# Initialize Stemmer and Lemmatizer
ps = PorterStemmer()
lemmatizer = WordNetLemmatizer()
# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')  # Update this with your MongoDB connection string
db = client['Ecommerce']  # Access the Ecommerce database
users_collection = db['users']  # Access the users collection

# Load the tokenizer and model from Hugging Face
tokenizer = AutoTokenizer.from_pretrained("vaishnaviiiiii/recommendation")
model = AutoModel.from_pretrained("vaishnaviiiiii/recommendation")
print("Model loaded successfully.")

# Load the dataset
try:
    product_data = pd.read_json('./models/data/products.json')
except FileNotFoundError:
    raise Exception("Dataset file not found. Check the file path.")
except ValueError as e:
    raise Exception(f"Error loading JSON dataset: {e}")
def preprocess_text(text, method="lemmatization"):
    """
    Preprocess text using stemming or lemmatization.
    """
    words = text.lower().split()
    if method == "stemming":
        processed_words = [ps.stem(word) for word in words]
    else:  # Default to lemmatization
        processed_words = [lemmatizer.lemmatize(word) for word in words]
    return " ".join(processed_words)


def get_bert_embeddings(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).numpy().astype(float)


def recommend_products_by_name(Name=None, category=None, confidence_threshold=0.5):
    if Name:
        # Preprocess query
        query_processed = preprocess_text(Name)
        print(f"Query after preprocessing: {query_processed}")  # Debugging line

        # Preprocess product names
        product_data['processed_name'] = product_data['Name'].apply(preprocess_text)
        print(f"Processed product names:\n{product_data[['Name', 'processed_name']].head()}")  # Debugging line

        # Filter products based on preprocessed names
        filtered_data = product_data[
            product_data['processed_name'].str.contains(query_processed, case=False, na=False)
        ]

        if filtered_data.empty:
            print(f"No products found after filtering with query: {query_processed}")  # Debugging line
            return {"error": f"Product with name '{Name}' not found."}

        if category:
            filtered_data = filtered_data[
                filtered_data['Category'].str.contains(category, case=False, na=False)
            ]

        if filtered_data.empty:
            return {"error": f"No products found matching '{Name}' in category '{category}'."}

        # Use product descriptions for BERT embeddings
        descriptions = filtered_data['Description'].fillna('').tolist()
        product_embeddings = get_bert_embeddings(descriptions)

        query_embedding = get_bert_embeddings([Name])
        cosine_sim = cosine_similarity(query_embedding, product_embeddings).flatten()

        # Filter products based on similarity score
        similarity_scores = [(i, score) for i, score in enumerate(cosine_sim) if score > confidence_threshold]
        similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

        if not similarity_scores:
            print(f"No products found with similarity scores above the threshold ({confidence_threshold})")  # Debugging line

        similar_products = [
            {
                "product_id": filtered_data.iloc[i[0]]['ID'],
                "product_name": filtered_data.iloc[i[0]]['Name'],
                "category": filtered_data.iloc[i[0]].get('Category', ''),
                "similarity_score": float(round(i[1], 2)),
                "image_url": filtered_data.iloc[i[0]].get('Image', ''),
            }
            for i in similarity_scores
        ]

        return similar_products

    return {"error": "Provide a valid product_name"}
def get_user_search_history(user_id):
    """
    Retrieve the search history of a user by their _id.
    """
    try:
        print(f"Fetching search history for user_id: {user_id}")  # Debug log

        # Convert user_id to ObjectId
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"searchHistory.searchQuery": 1})

        if not user:
            print(f"No user found with user_id: {user_id}")  # Debug log
            return []
        if "searchHistory" not in user:
            print(f"No 'searchHistory' field for user_id: {user_id}")  # Debug log
            return []
        
        search_queries = [entry["searchQuery"] for entry in user["searchHistory"]]
        print(f"Search history for user_id {user_id}: {search_queries}")  # Debug log
        return search_queries

    except Exception as e:
        print(f"Error fetching user search history: {e}")
        return []



def recommend_products_from_search_history(user_id, confidence_threshold=0.5):
    """
    Recommend products based on a user's search history.
    """
    try:
        search_history = get_user_search_history(user_id)
        print(f"Search history retrieved: {search_history}")  # Debug log

        if not search_history:
            print(f"No search history for user_id: {user_id}")  # Debug log
            return {"error": "No search history found for the user."}

        all_recommendations = []
        for query in search_history:
            recommendations = recommend_products_by_name(Name=query, confidence_threshold=confidence_threshold)
            print(f"Recommendations for query '{query}': {recommendations}")  # Debug log
            if isinstance(recommendations, list):  # Only append valid results
                all_recommendations.extend(recommendations)

        # Deduplicate recommendations based on product_id
        unique_recommendations = {rec["product_id"]: rec for rec in all_recommendations}
        sorted_recommendations = sorted(
            unique_recommendations.values(),
            key=lambda x: x["similarity_score"],
            reverse=True
        )
        print(f"Final recommendations: {sorted_recommendations}")  # Debug log
        return sorted_recommendations
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return {"error": "Failed to generate recommendations due to an internal error."}
