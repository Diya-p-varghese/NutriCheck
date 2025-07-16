import pandas as pd
import ollama
import re

# Optional: Load and preprocess the dataset
df = pd.read_csv("C:\\Users\\Diya\\Downloads\\IndianFoodDatasetCSV (4).csv")
df["text"] = "Ingredients: " + df["TranslatedIngredients"] + " Recipe: " + df["TranslatedRecipeName"]

# Function to generate top recipes using Ollama
def generate_top_recipes(ingredients, num_recipes=5):
    prompt = (
        f"Suggest {num_recipes} best recipes using these ingredients: {ingredients}. "
        f"Only return the recipe names, ingredients, and instructions for each recipe. "
        "Format each recipe like this:\n\n"
        "Recipe Name: <name>\n"
        "Ingredients: <list>\n"
        "Instructions: <steps>\n\n"
        "Do not include any extra commentary or formatting."
    )

    response = ollama.chat(
        model="llama3",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]

# Optional: Helper function to format recipes (not used directly in backend, but useful)
import re

def format_recipes(raw_response):
    formatted = []

    # Split the response by recipe sections using "Recipe Name:"
    recipe_chunks = re.split(r"Recipe Name:\s*", raw_response)[1:]  # first one is empty before the first "Recipe Name"

    for chunk in recipe_chunks:
        lines = chunk.strip().splitlines()
        if len(lines) < 2:
            continue

        name = lines[0].strip()
        ingredients_line = next((line for line in lines if line.startswith("Ingredients:")), "")
        instructions_line = next((line for line in lines if line.startswith("Instructions:")), "")

        ingredients = ingredients_line.replace("Ingredients:", "").strip()
        instructions = instructions_line.replace("Instructions:", "").strip()

        formatted.append({
            "Name": name,
            "Ingredients": [i.strip() for i in ingredients.split(",") if i.strip()],
            "Instructions": instructions
        })

    return formatted