# BigQuery Release Notes Tracker & Social Composer

A Flask-based web application that aggregates, categorizes, and displays Google Cloud BigQuery release updates. This project serves as an operations dashboard, helping developers stay informed about cloud platform changes and easily compose formatted updates for social sharing.

---

## 🔎 Overview

Modern development teams rely heavily on cloud data warehouses like BigQuery. Staying on top of continuous feature rollouts, announcements, and deprecations is crucial. 

This project provides a clean, dark-themed, glassmorphic analytics dashboard. It automates feed fetching from Google's official BigQuery release notes RSS, parses the raw XML payloads, categorizes individual updates, and integrates a dynamic composer utility to draft and share release briefs on social media platforms.

---

## ✨ Features

* **Automated RSS Feed Parsing**: Dynamically downloads and parses the official BigQuery release notes XML stream using [get_release_notes()](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/app.py#L89).
* **Caching Layer**: Employs a time-based cache configuration to store parsed releases for 5 minutes, mitigating rate-limiting risks on Google Cloud endpoints.
* **Component Classification**: Utilizes BeautifulSoup inside [parse_feed_data()](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/app.py#L17) to split entries into labeled update blocks:
  * 🚀 **Feature** (New tools and functionalities)
  * 📢 **Announcement** (General announcements and operational updates)
  * ⚠️ **Issue** (Known issues, bug fixes, or alerts)
  * 🛑 **Deprecation** (Features slated for removal or replacement)
* **Social Post Builder**: An interactive JavaScript utility in [app.js](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/static/js/app.js) that updates character count limits in real time, formats selected release details, and launches an X/Twitter sharing intent.
* **Cache Busting**: A manual synchronization trigger on the UI that lets users force-refresh the cache at any time.
* **Connectivity Portal**: Includes a secondary verify script [hello_app.py](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/hello_app.py) serving a basic API message to confirm local port mapping.

---

## 🛠️ Installation

Ensure you have Python 3.10+ installed on your system.

### 1. Initialize Virtual Environment
Create a localized Python environment in the root directory:
```bash
python -m venv .venv
```

### 2. Activate Environment
* **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
* **macOS / Linux (Bash)**:
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Required Dependencies
Install the Flask web framework, RSS parser, and web parsing utilities:
```bash
pip install flask requests feedparser beautifulsoup4
```

---

## 🚀 Run Instructions

The workspace contains two independent services designed to run concurrently on separate ports:

### 1. Main Dashboard Tracker (Port 5000)
To boot the main release notes tracker:
```bash
python app.py
```
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your web browser.

* **Main Controller**: See routing endpoints inside [app.py](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/app.py).
* **Templates**: Uses [index.html](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/templates/index.html) (main page) and [about.html](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/templates/about.html) (about page).
* **Styles & Scripts**: Configured via [styles.css](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/static/css/styles.css) and [app.js](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/static/js/app.js).

### 2. Verification Hello App (Port 5001)
To run the verification connectivity endpoint:
```bash
python hello_app.py
```
Open [http://127.0.0.1:5001](http://127.0.0.1:5001) in your browser.
* **Verify Controller**: Defined in [hello_app.py](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/agy-cli-projects/bq-releases-notes/hello_app.py).

---

## 📸 Screenshots

### BigQuery Releases Dashboard
The dashboard UI loads releases dynamically, allows keyword searching, and provides check-boxes to stage items into the Twitter Composer panel:

![BigQuery Release Tracker Dashboard](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/screenshots/bigquery-release-tracker.png)

### Verification Web Portal
The sandbox Flask endpoint serving a connection check message:

![Hello Flask App Verification](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/screenshots/hello-flask-app.png)

---

## 🔮 Future Improvements

* **Slack / MS Teams Integration**: Expose webhooks to push categorized BigQuery releases directly to developer channels automatically.
* **Persistent DB Storage**: Store historical updates inside SQLite or BigQuery itself to analyze cloud rollout trends over long timelines.
* **AI Summarization Engine**: Integrate Google Gemini API models to summarize complex technical update blocks into one-sentence summaries tailored for social sharing.
* **Notification Preferences**: Provide user authentication enabling users to select specific tags (e.g., only `Deprecation`) and subscribe to email or SMS alerts.
