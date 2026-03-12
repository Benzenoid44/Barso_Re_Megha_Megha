import pickle
import sklearn
import sys

print(f"Python version: {sys.version}")
print(f"Sklearn version: {sklearn.__version__}")

models = ['urban_flood_classifier.pkl', 'urban_time_regressor.pkl']

for model_path in models:
    print(f"\nAttempting to load: {model_path}")
    try:
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
        print(f"Successfully loaded {model_path}")
        print(f"Type: {type(data)}")
    except Exception as e:
        print(f"Failed to load {model_path}")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
