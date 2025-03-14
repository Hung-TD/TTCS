from flask import Flask
import subprocess
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/start-fastapi', methods=['GET'])
def start_fastapi():
    try:
        subprocess.Popen(
        ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
        )


        return {"status": "FastAPI started successfully!"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
