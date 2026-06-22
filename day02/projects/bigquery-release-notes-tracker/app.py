from flask import Flask, render_template, jsonify, request
import requests
import feedparser
from bs4 import BeautifulSoup
import time
import os

app = Flask(__name__)

# Simple cache structure
cache = {
    'data': None,
    'last_updated': 0,
    'expiry': 300 # 5 minutes
}

def parse_feed_data(xml_content):
    feed = feedparser.parse(xml_content)
    parsed_entries = []

    for entry in feed.entries:
        date_str = entry.title
        link = entry.get('link', 'https://cloud.google.com/bigquery/docs/release-notes')
        updated = entry.get('updated', '')
        summary = entry.get('summary', '')

        if not summary and 'content' in entry:
            summary = entry.content[0].value

        soup = BeautifulSoup(summary, 'html.parser')

        # Split into blocks based on h3 or h4 tags
        blocks = []
        current_type = "General"
        current_nodes = []

        for child in soup.contents:
            if child.name in ['h3', 'h4']:
                if current_nodes:
                    block_html = "".join([str(n) for n in current_nodes]).strip()
                    block_soup = BeautifulSoup(block_html, 'html.parser')
                    block_text = block_soup.get_text().strip()
                    blocks.append({
                        'type': current_type,
                        'content_html': block_html,
                        'content_text': block_text
                    })
                    current_nodes = []
                current_type = child.get_text().strip()
            else:
                # Store node
                if child.name or (isinstance(child, str) and child.strip()):
                    current_nodes.append(child)

        # Add the last block
        if current_nodes or current_type != "General":
            block_html = "".join([str(n) for n in current_nodes]).strip() if current_nodes else ""
            block_soup = BeautifulSoup(block_html, 'html.parser')
            block_text = block_soup.get_text().strip()
            blocks.append({
                'type': current_type,
                'content_html': block_html,
                'content_text': block_text
            })

        # Fallback if no blocks were extracted
        if not blocks and summary.strip():
            blocks.append({
                'type': "General",
                'content_html': summary,
                'content_text': soup.get_text().strip()
            })

        # Give each block an ID for front-end selection
        for idx, block in enumerate(blocks):
            # Clean type name for id safety
            clean_type = block['type'].lower().replace(' ', '_')
            block['id'] = f"{date_str.replace(' ', '_').replace(',', '')}_{clean_type}_{idx}"

        parsed_entries.append({
            'date': date_str,
            'updated': updated,
            'link': link,
            'blocks': blocks
        })

    return parsed_entries

def get_release_notes(force=False):
    now = time.time()
    if not force and cache['data'] and (now - cache['last_updated'] < cache['expiry']):
        return cache['data'], cache['last_updated'], False

    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        xml_content = response.text
        data = parse_feed_data(xml_content)

        # Update cache
        cache['data'] = data
        cache['last_updated'] = now
        return data, now, True
    except Exception as e:
        print(f"Error fetching release notes: {e}")
        # If fetch fails, return cached data if available
        if cache['data']:
            return cache['data'], cache['last_updated'], False
        raise e

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/releases')
def api_releases():
    force = request.args.get('force', 'false').lower() == 'true'
    try:
        data, last_updated, fetched_new = get_release_notes(force=force)
        return jsonify({
            'success': True,
            'releases': data,
            'last_updated': last_updated,
            'fetched_new': fetched_new
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Default port is 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
