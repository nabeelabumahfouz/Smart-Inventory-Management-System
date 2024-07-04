import pandas as pd
import psycopg2
from sklearn.linear_model import LinearRegression
import numpy as np
import sys
import json

# Get command-line arguments
product_id = int(sys.argv[1])
future_date = sys.argv[2]

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname='inventory_management', user='postgres', password='password', host='localhost'
)
cur = conn.cursor()

# Fetch sales data for the specific product_id
query = """
    SELECT product_id, SUM(quantity_sold) as total_sold, DATE_TRUNC('month', sale_date) as month
    FROM Sales
    WHERE product_id = %s
    GROUP BY product_id, month
"""
sales_data = pd.read_sql(query, conn, params=(product_id,))

# Prepare data for the predictive model
if not sales_data.empty:
    X = sales_data[['month']].apply(lambda x: x.astype(np.int64) // 10**9).values.reshape(-1, 1)
    y = sales_data['total_sold'].values

    # Train the model
    model = LinearRegression()
    model.fit(X, y)

    # Function to predict future sales
    def predict_sales(product_id, future_date):
        future_timestamp = pd.to_datetime(future_date).timestamp()
        prediction = model.predict([[future_timestamp]])
        return prediction[0]

    # Get the prediction
    prediction = predict_sales(product_id, future_date)

    # Print the prediction in JSON format
    print(json.dumps({
        'product_id': product_id,
        'future_date': future_date,
        'predicted_sales': prediction
    }))
else:
    print(json.dumps({
        'product_id': product_id,
        'future_date': future_date,
        'predicted_sales': None
    }))

# Close the database connection
cur.close()
conn.close()
