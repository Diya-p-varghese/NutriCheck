from flask import Flask, request, jsonify 
from flask_cors import CORS  
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv() 
import datetime
import bcrypt
import certifi
import sys
import os
import json


sys.path.append(os.path.abspath('../nutricheck-AI'))

from ai_module import generate_top_recipes, format_recipes  # Imported AI recipe generator

app = Flask(__name__)
CORS(app)  # Allow all origins.

# MongoDB Connection
 MONGO_URI = os.getenv("MONGO_URI")  
try:
    client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
    db = client["Nutricheckapp"]
    users = db["user"]
    food_collection = db["food"]  # Define food_collection here
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print("🚨 MongoDB Connection Error:", e)
    exit(1)

def get_status(expiry_date_str): 
    try:
        expiry_date = datetime.datetime.strptime(expiry_date_str, "%d/%m/%Y").date()
    except ValueError:
        try:
            expiry_date = datetime.datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
        except ValueError:
            print(f"🚨 Invalid date format: {expiry_date_str}")
            return "Unknown"

    today = datetime.date.today()
    days_left = (expiry_date - today).days

    if days_left > 15:
        return "Fresh"
    elif 8 <= days_left <= 15:
        return "Expiring Soon"
    elif 1 <= days_left <= 7:
        return "Urgent"
    elif days_left == 0:
        return "Expiring Today"
    elif days_left < 0:
        return "Expired"
    return "Unknown"

@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and Password are required"}), 400

        if users.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        users.insert_one({"email": email, "password": hashed_password.decode("utf-8")})
        
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and Password are required"}), 400
        
        user = users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        stored_hashed_password = user["password"]
        if bcrypt.checkpw(password.encode("utf-8"), stored_hashed_password.encode("utf-8")):
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid password"}), 401  
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/addfood", methods=["POST"])
def add_food():
    try:
        data = request.json
        email = data.get("email")
        name = data.get("name")
        expiry = data.get("expiry")
        quantity = data.get("quantity")
        location = data.get("location")
        nutrients = data.get("nutrients", {})
        image_url = data.get("image_url", None)

        if not all([email, name, expiry, quantity, location]):
            return jsonify({"error": "All fields (except image) are required"}), 400

        status = get_status(expiry)

        food_item = {
            "email": email,
            "name": name,
            "expiry": expiry,
            "quantity": quantity,
            "location": location,
            "nutrients": nutrients,
            "image_url": image_url,
            "status": status
        }

        food_collection.insert_one(food_item)
        return jsonify({"message": "Food item added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/getFoodItems", methods=["GET"])
def get_food_items():
    try:
        food_items = list(food_collection.find({}, {"_id": 0}))  # Exclude MongoDB's default _id field
        
        for item in food_items:
            item["status"] = get_status(item["expiry"])
        
        return jsonify({"success": True, "foodItems": food_items}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ✅ AI-Powered Recipe Generator Endpoint
@app.route("/generateRecipes", methods=["POST"])
def generate_recipes():
    try:
        data = request.json
        ingredients = data.get("ingredients", [])

        if not ingredients or not isinstance(ingredients, list):
            print("❌ No valid ingredients provided.")
            return jsonify({"success": False, "error": "No ingredients provided"}), 400

        ingredients_str = ", ".join(ingredients)
        print("🧂 Ingredients String:", ingredients_str)

        try:
            raw_response = generate_top_recipes(ingredients_str, num_recipes=5)
            print("🤖 RAW AI Response:", raw_response)
        except Exception as e:
            print("🚨 Error in generate_top_recipes:", e)
            return jsonify({"success": False, "error": "AI recipe generation failed."}), 500

        try:
            formatted_recipes = format_recipes(raw_response)
            print("🍽️ Formatted Recipes:", formatted_recipes)
        except Exception as e:
            print("🚨 Error in format_recipes:", e)
            return jsonify({"success": False, "error": "Recipe formatting failed."}), 500

        if not formatted_recipes:
            print("⚠️ format_recipes returned empty.")
            return jsonify({"success": False, "error": "No recipes generated. Try different ingredients."}), 500

        return jsonify({"success": True, "recipes": formatted_recipes}), 200

    except Exception as e:
        print("❗ Unexpected Error:", e)
        return jsonify({"success": False, "error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)