from flask import Flask, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=[
    \"http://localhost:3000\",
    \"https://filenova.in\",
    \"https://www.filenova.in\"
])

# Health check endpoint
@app.route('/api/healthz', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'services': {
            'database': 'connected',
            'storage': 'available'
        }
    })

# Root endpoint
@app.route('/api', methods=['GET'])
def api_root():
    return jsonify({
        'message': 'FileNova API Server',
        'status': 'running',
        'endpoints': {
            'health': '/api/healthz',
            'docs': '/api/docs'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
