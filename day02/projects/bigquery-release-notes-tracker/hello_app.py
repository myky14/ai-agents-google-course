from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Antigravity CLI"

if __name__ == '__main__':
    # Run on port 5001 to avoid port 5000 conflicts
    app.run(debug=True, host='0.0.0.0', port=5001)
