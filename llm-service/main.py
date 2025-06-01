from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import logging
import traceback
from prompts import (
    get_keywords_prompt,
    get_titles_prompt,
    get_topics_prompt,
    get_content_prompt
)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS with specific settings
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Initialize the OpenAI client
client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

@app.route('/generate', methods=['POST'])
def generate():
    try:
        logger.debug(f"Received request: {request.json}")
        if not request.json:
            logger.error("No JSON data in request")
            return jsonify({'error': 'No JSON data provided'}), 400

        data = request.json
        prompt_type = data.get('type')
        if not prompt_type:
            logger.error("No type specified in request")
            return jsonify({'error': 'No type specified'}), 400

        if prompt_type == 'keywords':
            seed = data.get('text')
            if not seed:
                logger.error("No text provided for keywords")
                return jsonify({'error': 'No text provided for keywords'}), 400
            prompt = get_keywords_prompt(seed)
        elif prompt_type == 'titles':
            keyword = data.get('text')
            if not keyword:
                logger.error("No text provided for titles")
                return jsonify({'error': 'No text provided for titles'}), 400
            prompt = get_titles_prompt(keyword)
        elif prompt_type == 'topics':
            title = data.get('text')
            if not title:
                logger.error("No text provided for topics")
                return jsonify({'error': 'No text provided for topics'}), 400
            prompt = get_topics_prompt(title)
        elif prompt_type == 'content':
            topic = data.get('topic')
            keyword = data.get('keyword')
            if not topic or not keyword:
                logger.error("Missing topic or keyword for content")
                return jsonify({'error': 'Both topic and keyword are required for content'}), 400
            prompt = get_content_prompt(topic, keyword)
        else:
            logger.error(f"Invalid type supplied: {prompt_type}")
            return jsonify({'error': 'Invalid type supplied'}), 400

        logger.debug(f"Sending prompt to OpenAI: {prompt}")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )

        text_response = response.choices[0].message.content.strip()
        logger.debug(f"Received response from OpenAI: {text_response}")
        # Split lines and return as a list
        lines = [line.strip() for line in text_response.split('\n') if line.strip()]
        return jsonify(lines)

    except Exception as e:
        logger.error(f"Error occurred: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # By default, Flask runs on port 5000; change if needed
    app.run(host='0.0.0.0', port=7002, debug=True)

# Testing endpoints:
# 1) Keywords:
#    curl -X POST http://localhost:7000/generate \
#      -H "Content-Type: application/json" \
#      -d '{"type":"keywords","text":"digital marketing"}'
# 2) Titles:
#    curl -X POST http://localhost:7000/generate \
#      -H "Content-Type: application/json" \
#      -d '{"type":"titles","text":"digital marketing"}'
# 3) Topics:
#    curl -X POST http://localhost:7000/generate \
#      -H "Content-Type: application/json" \
#      -d '{"type":"topics","text":"Best Digital Marketing Strategies"}'
# 4) Content:
#    curl -X POST http://localhost:7000/generate \
#      -H "Content-Type: application/json" \
#      -d '{"type":"content","topic":"Importance of SEO","keyword":"SEO importance"}'