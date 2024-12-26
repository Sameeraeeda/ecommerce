#server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from models.recommendation_model import recommend_products_by_name, recommend_products_from_search_history
from pymongo import MongoClient
import requests
# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')  # Update this with your MongoDB connection string
db = client['Ecommerce']  # Access the Ecommerce database
users_collection = db['users']  # Access the users collection

# Initialize Flask application
app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": "*"}})  # Enable CORS for cross-origin requests

# Path to the dataset for top-rated products
DATASET_PATH = "./models/data/products.json"

# Function to fetch top-rated products
def get_top_rated_products():
    try:
        with open(DATASET_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        required_keys = ["ID", "Name", "discounted_price", "Rating", "Image"]
        for product in data:
            for key in required_keys:
                if key not in product:
                    return {"error": f"Missing key in dataset: {key}"}
        top_rated = sorted(
        (product for product in data if product.get("Rating") and product["Rating"].replace('.', '', 1).isdigit()),
        key=lambda x: float(x["Rating"]),
        reverse=True)[:10]
        products = [
            {
                "product_id": product["ID"],  # Include product_id
                "product_name": product["Name"],
                "price": product["discounted_price"],
                "rating": product["Rating"],
                "image_url": product["Image"]
            }
            for product in top_rated
        ]
        return products
    except Exception as e:
        print("Error:", str(e))
        return {"error": str(e)}

# Root endpoint
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the E-commerce Recommendation System API!"})
# API endpoint: Recommendations for the search page
@app.route("/recommendations", methods=["POST"])
def recommend():
    try:
        if not request.is_json:
            return jsonify({
                "error": "Unsupported Media Type: Content-Type must be 'application/json'."
            }), 415

        data = request.get_json()
        if not data:
            return jsonify({
                "error": "No data provided. Please send JSON with 'product_name' and optionally 'category'."
            }), 400

        product_name = data.get("product_name")
        category = data.get("category")

        if not product_name:
            return jsonify({
                "error": "Invalid input. Provide 'product_name' in the request JSON."
            }), 400

        # Call the recommendation function
        recommendations = recommend_products_by_name(Name=product_name, category=category)

        if isinstance(recommendations, dict) and "error" in recommendations:
            return jsonify({"error": recommendations["error"]}), 404

        return jsonify({"recommendations": recommendations}), 200

    except Exception as e:
        return jsonify({
            "error": f"An internal error occurred: {str(e)}"
        }), 500


# API endpoint: Top-rated products for the homepage
@app.route("/api/top-rated", methods=["GET"])
def top_rated_products():
    products = get_top_rated_products()
    if "error" in products:
        return jsonify({"error": products["error"]}), 500
    return jsonify(products)

# API endpoint: Recommendations based on user search history
@app.route("/api/recommendations/search-history", methods=["GET"])
def recommend_based_on_search_history():
    try:
        # Get user_id from query parameters
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "Invalid input. Provide 'user_id' as a query parameter."}), 400

        # Fetch the user's search history
        search_history = requests.get(f"http://localhost:5000/getSearchHistory/{user_id}")
        search_history = search_history.json()

        # Fetch recommendations based on search history
        recommendations = recommend_products_from_search_history(user_id)
        print(f"Recommendations fetched: {recommendations}")  # Debug log

        # Return recommendations
        return jsonify({"recommendations": recommendations}), 200

    except Exception as e:
        # Log and return the exception for debugging
        print(f"Error occurred: {str(e)}")
        return jsonify({
            "error": f"An internal error occurred: {str(e)}"
        }), 500
@app.route("/api/product/<product_id>", methods=["GET"])
def get_product_details(product_id):
    try:
        with open(DATASET_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print("Product ID received:", product_id)
            product = next((item for item in data if item["ID"] == product_id), None)
            print("Matched Product:", product)
            if not product:
                return jsonify({"error": "Product not found"}), 404

            return jsonify({
                "product_id": product["ID"],
                "product_name": product["Name"],
                "price": product["discounted_price"],
                "rating": product["Rating"],
                "description": product["Description"],
                "image_url": product["Image"]
            }), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True,port=3000)
