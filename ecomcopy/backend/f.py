import pandas as pd

try:
    product_data = pd.read_csv('./models/data/merged_amazon_flipkart_rowwise.csv')
    print(product_data.head())
except Exception as e:
    print(f"Error loading CSV: {e}")
