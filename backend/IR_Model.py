import sys
import argparse
import subprocess
import pandas as pd
import pyterrier as pt
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Run the run_spiders.py script
try:
    subprocess.run(["python3", "./run_spiders.py"], check=True)
except subprocess.CalledProcessError as e:
    print("Failed to run run_spiders.py")
    print(e)
    exit()

# Initialize PyTerrier
if not pt.started():
    pt.init()

# Function to read JSONL data
def read_jsonl_data(file_path):
    data = []
    with open(file_path, 'r') as file:
        for line in file:
            data.append(json.loads(line))
    return data

# Load JSONL data
jsonl_file_path = './scraper_output.jsonl'
data = read_jsonl_data(jsonl_file_path)

# Prepare data with key checks
extracted_data = [{
    'docno': index + 1,  # Assuming docno to be a unique identifier starting from 1
    'name': item.get('name', ''),
    'symbol': item.get('symbol', ''),
    'price': item.get('price', ''),
    'market_cap': item.get('market_cap', ''),
    'percent_change_1h': item.get('percent_change_1h', ''),
    'percent_change_24h': item.get('percent_change_24h', ''),
    'percent_change_7d': item.get('percent_change_7d', ''),
    'volume_change_24h': item.get('volume_change_24h', ''),
    'logo_url': item.get('logo_url', ''),
    'source': item.get('source', '')
} for index, item in enumerate(data)]


df = pd.DataFrame(extracted_data)

# Function to create and index data
def create_and_index_data(df):
    df['text'] = df.apply(lambda row: f"Name: {row['name']}, Symbol: {row['symbol']}, Price: {row['price']}, Market Cap: {row['market_cap']}, Percent Change 1h: {row['percent_change_1h']}, Percent Change 24h: {row['percent_change_24h']}, Percent Change 7d: {row['percent_change_7d']}, Volume Change 24h: {row['volume_change_24h']}", axis=1)
    df['docno'] = df['docno'].astype(str)

    indexer = pt.DFIndexer("./crypto_index", meta=["docno"], overwrite=True)
    return indexer.index(df['text'], df['docno'])

# Create the index
index_ref = create_and_index_data(df)

## Function to search cryptocurrencies and automatically mark all as relevant
def search_and_feedback(query):
    # Directly filter the DataFrame for names containing the query substring
    filtered_results = df[df['name'].str.contains(query, case=False, na=False)].copy()

    if not filtered_results.empty:
        # Automatically mark all documents as relevant
        filtered_results['relevant'] = True

        # Provide automatic recommendations
        recommendations = get_recommendations(query)

        # Gather results and recommendations in JSON format
        json_data = create_json_results(filtered_results, recommendations)

        # Write the JSON content to a file
        write_json_to_file(json_data, 'search_results.json')
    else:
        print("No results found")
        
def collect_user_feedback(results):
    relevant_docs = []
    print("\nPlease provide feedback on the relevance of the search results:")
    for index, row in results.iterrows():
        feedback = input(f"Is document {row['docno']} relevant? (y/n): ").strip().lower()
        if feedback == 'y':
            relevant_docs.append(row['docno'])
    return relevant_docs

def display_results(results):
    for _, row in results.iterrows():
        snippet = df[df['docno'] == row['docno']]['text'].values[0]
        print(f"Docno: {row['docno']}, Snippet: {snippet}\n")

def display_recommendations(recommendations):
    for _, row in recommendations.iterrows():
        print(f"Name: {row['name']}, Symbol: {row['symbol']}, Price: {row['price']}, Market Cap: {row['market_cap']}")

# Prepare the TF-IDF matrix and cosine similarity matrix for recommendations
df['text'] = df.apply(lambda row: f"{row['name']} {row['symbol']} {row['price']} {row['market_cap']}", axis=1)
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['text'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Function to get recommendations based on similarity scores
def get_recommendations(query, cosine_sim=cosine_sim):
    # Get the index of the cryptocurrency that matches the name
    idx = df.index[df['name'].str.contains(query, case=False)].tolist()
    if not idx: # If no match found, return empty DataFrame
        return pd.DataFrame()

    idx = idx[0] # Take the first match

    # Get the pairwise similarity scores of all cryptocurrencies with that cryptocurrency
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort the cryptocurrencies based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get the scores of the most similar cryptocurrencies
    sim_scores = sim_scores[1:7] # Top 6 recommendations

    # Get the cryptocurrency indices
    crypto_indices = [i[0] for i in sim_scores]

    # Return the most similar cryptocurrencies
    return df.iloc[crypto_indices]

# Function to create JSON results
def create_json_results(results, recommendations):
    results_data = []
    for _, row in results.iterrows():
        result = {
            'docno': row['docno'],
            'name': row['name'],
            'symbol': row['symbol'],
            'price': row['price'],
            'market_cap': row['market_cap'],
            'percent_change_1h': row['percent_change_1h'],
            'percent_change_24h': row['percent_change_24h'],
            'percent_change_7d': row['percent_change_7d'],
            'logo_url': row['logo_url'],
            'source': row['source']
        }
        results_data.append(result)

    recommendations_data = []
    for _, row in recommendations.iterrows():
        recommendation = {
            'name': row['name'],
            'symbol': row['symbol'],
            'price': row['price'],
            'market_cap': row['market_cap'],
            'logo_url': row['logo_url'],
            'source': row['source']
        }
        recommendations_data.append(recommendation)

    return {
        'results': results_data,
        'recommendations': recommendations_data
    }

def write_json_to_file(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)
        
# Function to handle feedback from HTML page
def handle_html_feedback(docno, is_relevant):
    # Ensure the 'relevant' column exists and is properly initialized
    if 'relevant' not in df.columns:
        df['relevant'] = True  # Default all as relevant

    # Update the relevance of the specific document
    df.loc[df['docno'] == str(docno), 'relevant'] = is_relevant

    # Filter out only relevant documents
    relevant_results = df[df['relevant']].copy()

    # Provide automatic recommendations
    recommendations = get_recommendations("Your Query Here")

    # Gather results and recommendations in JSON format
    json_data = create_json_results(relevant_results, recommendations)

    # Write the JSON content to a file
    write_json_to_file(json_data, 'search_results.json')

# Example Usage
# search_and_feedback("eth")
# handle_html_feedback(4, False)
if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="Run a function with parameters from the command line.")

    # Add arguments
    parser.add_argument("param1", type=str, help="First parameter")
    
    # Parse arguments
    args = parser.parse_args()

    # Call the function with parsed arguments
    search_and_feedback(args.param1)