# Smart Inventory Management System

Welcome to the Smart Inventory Management System project!  
This application is designed to manage product inventories, predict future sales, and generate sales summaries using advanced SQL queries and a seamless integration between a Node.js backend and a React frontend.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Endpoints](#endpoints)
- [SQL Queries](#sql-queries)
- [Project Structure](#project-structure)

## Features
- **Product Management**: Add, update, delete, and view products.
- **Sales Prediction**: Predict future sales for products using a Python script.
- **Sales Summaries**: Generate monthly sales summaries and best-selling products lists.
- **SQL Emphasis**: Advanced SQL queries for data retrieval and manipulation, including CRUD operations.

## Technologies Used
- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Other**: Python for sales prediction, Git for version control




## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/smart-inventory.git
   cd smart-inventory

2. **Install Backend Dependencies**
   ```bash
   npm install

3. **Install Backend Dependencies**
   ```bash
   Copy code
   cd smart-inventory-frontend
   npm install
   cd ..

4. **Database Setup**
   ```sql
    CREATE DATABASE inventory_management;
    
    \c inventory_management
    
    CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        reorder_level INT NOT NULL
    );
  
    CREATE TABLE sales (
        sale_id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(product_id),
        quantity_sold INT NOT NULL,
        sale_date DATE NOT NULL
    );

5. **Run the Application**  
   Ensure you have PostgreSQL installed and running. Create a database named inventory_management and run the provided SQL script to set up the required tables.
   ```bash
   npm start
   cd smart-inventory-frontend
   npm start
## Usage (Demos Coming soon)

**Viewing Products**
- Navigate to the products Section to view a list of all products in the inventory.

**Predicting Sales**
- Use the predict sales header to get a sales prediction for a specific product on a future date.

**Sales Summaries**
- Generate monthly sales summaries or best-selling products under the respective heading.
## Endpoints

### Product Endpoints
- **GET /products**: Retrieve all products.
- **POST /products**: Add a new product.
- **PUT /products/:product_id**: Update an existing product.
- **DELETE /products/:product_id**: Delete a product.

### Sales Prediction Endpoint
- **GET /predict-sales/:product_id/:future_date**: Predict future sales for a product.

### Sales Summary Endpoints
- **GET /sales-summary**: Retrieve monthly sales summary.
- **GET /sales-summary?start=[start_date]&end=[end_date]**: Retrieve sales summary within a date range.
- **GET /best-sellers**: Retrieve best-selling products.

## SQL Queries

### CRUD Operations

#### Create a Product
```sql
INSERT INTO products (product_name, price, category, reorder_level)
VALUES ($1, $2, $3, $4)
RETURNING *;
```

#### Read (Find) a Product
```sql
SELECT * FROM products;
```


#### Update a Product
```sql
UPDATE products
SET product_name = $1, price = $2, category = $3, reorder_level = $4
WHERE product_id = $5
RETURNING *;
```


#### Delete a Product
```sql
BEGIN;
DELETE FROM inventory WHERE product_id = $1;
DELETE FROM sales WHERE product_id = $1;
DELETE FROM products WHERE product_id = $1
RETURNING *;
COMMIT;
```

## Project Structure

```java
smart-inventory/
│
├── node_modules/
├── smart-inventory-frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── predict.py
└── README.md
