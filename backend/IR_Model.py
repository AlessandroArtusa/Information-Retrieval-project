import pandas as pd
import pyterrier as pt
import json

# Initialize PyTerrier
if not pt.started():
    pt.init()

# JSON data
json_data = """
{
    "data": [
        {
            "id": 1,
            "name": "Bitcoin",
            "symbol": "BTC",
            "quote": {
                "USD": {
                    "price": 9283.92,
                    "market_cap": 852164659250.2758
                }
            }
        },
        {
            "id": 1027,
            "name": "Ethereum",
            "symbol": "ETH",
            "quote": {
                "USD": {
                    "price": 1283.92,
                    "market_cap": 158055024432
                }
            }
        }
    ]
}
"""

# Parse JSON and prepare data
data = json.loads(json_data)['data']
extracted_data = [{
    'docno': item['id'],
    'name': item['name'],
    'symbol': item['symbol'],
    'price': item['quote']['USD']['price'],
    'market_cap': item['quote']['USD']['market_cap']
} for item in data]

df = pd.DataFrame(extracted_data)

# Function to create and index data
def create_and_index_data(df):
    df['text'] = df.apply(lambda row: f"Name: {row['name']}, Symbol: {row['symbol']}, Price: {row['price']}, Market Cap: {row['market_cap']}", axis=1)
    df['docno'] = df['docno'].astype(str)

    indexer = pt.DFIndexer("./crypto_index", meta=["docno"], overwrite=True)
    return indexer.index(df['text'], df['docno'])

# Create the index
index_ref = create_and_index_data(df)

# Function to search cryptocurrencies
def search_cryptocurrencies(query):
    bm25 = pt.BatchRetrieve(index_ref, wmodel="BM25")
    results = bm25.search(query)
    if not results.empty:
        return results
    else:
        return "No results found"

# Example Usage
search_results = search_cryptocurrencies("Bitcoin")
print(search_results)
