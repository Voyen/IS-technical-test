from counter import decrement_counter, get_current_count, reset_counter
from flask import Flask, Response

app = Flask(__name__)


@app.route('/health-check')
def health_check():
    return Response(None, 200)


@app.route('/api/decrement', methods=["PUT"])
def decrement():
    counter = decrement_counter()
    return str(counter)


@app.route('/api/counter')
def get_count():
    counter = get_current_count()
    return str(counter)


@app.route('/api/reset', methods=["PUT"])
def reset():
    counter = reset_counter()
    return str(counter)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
