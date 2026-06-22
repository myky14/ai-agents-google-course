// Global State
let allReleases = [];      // Raw data from server
let selectedBlocks = [];   // List of currently selected block objects
let currentFilter = 'all';  // Current type filter ('all', 'feature', etc.)
let searchQuery = '';      // Current search string
let activeTemplate = 'standard'; // Current tweet format style

// DOM Elements
const skeletonLoader = document.getElementById('skeleton-loader');
const feedContainer = document.getElementById('feed-container');
const emptyState = document.getElementById('empty-state');
const showingCountEl = document.getElementById('showing-count');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const refreshBtn = document.getElementById('refresh-btn');
const refreshBtnText = document.getElementById('refresh-btn-text');
const syncText = document.getElementById('sync-text');
const statusDot = document.querySelector('.status-indicator-dot');

const filterPills = document.querySelectorAll('.filter-pill');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

const selectAllVisibleBtn = document.getElementById('select-all-visible');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const selectionBadgeCount = document.getElementById('selection-badge-count');

// Composer Elements
const composerPane = document.getElementById('composer-pane');
const composerCountBadge = document.getElementById('composer-count');
const selectedListEl = document.getElementById('selected-list');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCountEl = document.getElementById('char-count');
const progressRing = document.querySelector('.progress-ring');
const progressRingCircle = document.getElementById('progress-ring-circle');
const templateBtns = document.querySelectorAll('.template-btn');
const copyTweetBtn = document.getElementById('copy-tweet-btn');
const tweetBtn = document.getElementById('tweet-btn');
const closeComposerBtn = document.getElementById('close-composer');

// Mobile Floating Composer Button
const mobileComposerTrigger = document.getElementById('mobile-composer-trigger');
const mobileComposerBadge = document.getElementById('mobile-composer-badge');

// Toast Notification Elements
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

// Initialize Progress Ring Math
const radius = progressRingCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressRingCircle.style.strokeDashoffset = circumference;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchReleases(false);

    // Search Events
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        handleSearch();
    });

    // Refresh Event
    refreshBtn.addEventListener('click', () => {
        fetchReleases(true);
    });

    // Filter Events
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-type');
            applyFilters();
        });
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilter = 'all';
        filterPills.forEach(p => p.classList.remove('active'));
        document.querySelector('.filter-pill[data-type="all"]').classList.add('active');
        applyFilters();
    });

    // Selection Header Events
    selectAllVisibleBtn.addEventListener('click', selectAllVisible);
    clearSelectionBtn.addEventListener('click', clearSelection);

    // Composer Template Events
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            templateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTemplate = btn.getAttribute('data-template');
            generateTweetDraft();
        });
    });

    // Tweet Input Counter
    tweetTextarea.addEventListener('input', () => {
        updateCharCounter();
    });

    // Composer Copy & Tweet Actions
    copyTweetBtn.addEventListener('click', copyTweetToClipboard);
    tweetBtn.addEventListener('click', openTwitterIntent);

    // Mobile Composer Toggle
    mobileComposerTrigger.addEventListener('click', () => {
        composerPane.classList.add('active');
    });
    closeComposerBtn.addEventListener('click', () => {
        composerPane.classList.remove('active');
    });
});

// Toast notification function
function showToast(message) {
    toastMessageEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// Fetch from API
async function fetchReleases(force = false) {
    setLoadingState(true);
    try {
        const url = `/api/releases${force ? '?force=true' : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            allReleases = data.releases;
            updateSyncTime(data.last_updated);
            renderFeed();
            applyFilters();
            if (force) {
                showToast("Feed refreshed successfully!");
            }
        } else {
            console.error("Server returned error:", data.error);
            showToast(`Failed to fetch releases: ${data.error}`);
        }
    } catch (err) {
        console.error("Network error:", err);
        showToast("Network error. Unable to fetch release notes.");
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (isLoading) {
        skeletonLoader.style.display = 'block';
        feedContainer.style.display = 'none';
        emptyState.style.display = 'none';
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
        refreshBtnText.textContent = 'Syncing...';
        statusDot.classList.add('syncing');
        syncText.textContent = 'Fetching feed...';
    } else {
        skeletonLoader.style.display = 'none';
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
        refreshBtnText.textContent = 'Refresh Feed';
        statusDot.classList.remove('syncing');
    }
}

function updateSyncTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    syncText.textContent = `Last synced at ${timeStr}`;
}

// Search input handler
function handleSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    applyFilters();
}

// Parse release block date helper to get clean short date
function getShortDate(dateStr) {
    // E.g. "June 17, 2026"
    return dateStr;
}

// Main rendering logic
function renderFeed() {
    feedContainer.innerHTML = '';

    if (allReleases.length === 0) {
        return;
    }

    allReleases.forEach(release => {
        // Create Date Group container
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';
        dateGroup.setAttribute('data-date', release.date);

        // Group Header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-title';
        dateHeader.innerHTML = `
            <span>${release.date}</span>
            <a class="date-link" href="${release.link}" target="_blank" title="Open source documentation">
                Official notes
                <svg class="date-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"></path>
                </svg>
            </a>
        `;
        dateGroup.appendChild(dateHeader);

        // Process each update block on this date
        let hasBlocks = false;
        release.blocks.forEach(block => {
            hasBlocks = true;
            const isSelected = selectedBlocks.some(b => b.id === block.id);

            const card = document.createElement('div');
            card.className = `update-card ${isSelected ? 'selected' : ''}`;
            card.setAttribute('data-id', block.id);
            card.setAttribute('data-type', block.type);

            // Add custom visual metadata
            card.innerHTML = `
                <div class="card-header-row">
                    <span class="type-badge">${block.type}</span>
                    <div class="checkbox-container">
                        <div class="custom-checkbox">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    ${block.content_html}
                </div>
                <div class="card-actions">
                    <button class="btn btn-card-tweet" data-tweet-single="true">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>Tweet Update</span>
                    </button>
                </div>
            `;

            // Card Click Handler (Select update)
            card.addEventListener('click', (e) => {
                // If clicked on quick-tweet button, trigger separate handler
                if (e.target.closest('[data-tweet-single]')) {
                    e.stopPropagation();
                    tweetSingleBlock(release, block);
                    return;
                }

                // If clicked link in card body, handle navigation normally
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    e.stopPropagation();
                    return;
                }

                toggleBlockSelection(release, block);
            });

            dateGroup.appendChild(card);
        });

        if (hasBlocks) {
            feedContainer.appendChild(dateGroup);
        }
    });
}

// Filter and Search logic
function applyFilters() {
    let visibleCardsCount = 0;
    const dateGroups = feedContainer.querySelectorAll('.date-group');

    dateGroups.forEach(group => {
        const cards = group.querySelectorAll('.update-card');
        let visibleCardsInGroup = 0;

        cards.forEach(card => {
            const type = card.getAttribute('data-type').toLowerCase();
            const content = card.querySelector('.card-body').innerText.toLowerCase();
            const date = group.getAttribute('data-date').toLowerCase();

            // Check type filter
            const matchesFilter = (currentFilter === 'all') || (type === currentFilter);

            // Check search query
            const matchesSearch = !searchQuery ||
                                  content.includes(searchQuery) ||
                                  type.includes(searchQuery) ||
                                  date.includes(searchQuery);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                visibleCardsInGroup++;
                visibleCardsCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Hide date group if it contains no visible cards
        if (visibleCardsInGroup > 0) {
            group.style.display = 'flex';
        } else {
            group.style.display = 'none';
        }
    });

    // Display feed or empty state
    if (visibleCardsCount > 0) {
        feedContainer.style.display = 'flex';
        emptyState.style.display = 'none';
        showingCountEl.textContent = searchQuery || currentFilter !== 'all'
            ? `Showing ${visibleCardsCount} matching update(s)`
            : `Showing all updates`;
    } else {
        feedContainer.style.display = 'none';
        emptyState.style.display = 'flex';
        showingCountEl.textContent = 'No updates matching criteria';
    }
}

// Toggle Selection
function toggleBlockSelection(release, block) {
    const index = selectedBlocks.findIndex(b => b.id === block.id);
    const card = feedContainer.querySelector(`.update-card[data-id="${block.id}"]`);

    if (index === -1) {
        // Add to selection
        selectedBlocks.push({
            id: block.id,
            date: release.date,
            link: release.link,
            type: block.type,
            text: block.content_text
        });
        if (card) card.classList.add('selected');
    } else {
        // Remove from selection
        selectedBlocks.splice(index, 1);
        if (card) card.classList.remove('selected');
    }

    updateComposerUI();
}

// Select All Visible Updates
function selectAllVisible() {
    const visibleCards = feedContainer.querySelectorAll('.update-card:not([style*="display: none"])');
    if (visibleCards.length === 0) return;

    visibleCards.forEach(card => {
        const blockId = card.getAttribute('data-id');
        const isAlreadySelected = selectedBlocks.some(b => b.id === blockId);

        if (!isAlreadySelected) {
            // Find in raw data
            for (const release of allReleases) {
                const block = release.blocks.find(b => b.id === blockId);
                if (block) {
                    selectedBlocks.push({
                        id: block.id,
                        date: release.date,
                        link: release.link,
                        type: block.type,
                        text: block.content_text
                    });
                    card.classList.add('selected');
                    break;
                }
            }
        }
    });

    updateComposerUI();
    showToast(`Selected all ${visibleCards.length} visible updates`);
}

// Clear Selection
function clearSelection() {
    selectedBlocks = [];
    const selectedCards = feedContainer.querySelectorAll('.update-card.selected');
    selectedCards.forEach(card => card.classList.remove('selected'));

    updateComposerUI();
}

// Composer updates
function updateComposerUI() {
    const count = selectedBlocks.length;

    // Update Badges
    composerCountBadge.textContent = count;
    mobileComposerBadge.textContent = count;
    selectionBadgeCount.textContent = count;

    if (count > 0) {
        clearSelectionBtn.style.display = 'inline-flex';
        mobileComposerTrigger.style.display = 'flex';
    } else {
        clearSelectionBtn.style.display = 'none';
        mobileComposerTrigger.style.display = 'none';
        // Auto-close composer sidebar if empty on tablet screen widths
        if (window.innerWidth <= 1100) {
            composerPane.classList.remove('active');
        }
    }

    // Render Selected List Tags in Composer
    selectedListEl.innerHTML = '';

    if (count === 0) {
        selectedListEl.innerHTML = '<p class="placeholder-text">No updates selected. Click checkboxes or select cards in the feed to draft a tweet.</p>';
    } else {
        selectedBlocks.forEach(block => {
            const tag = document.createElement('div');
            tag.className = 'selected-item-tag';

            // Clean text representation
            const truncatedText = block.text.length > 40 ? block.text.substring(0, 40) + '...' : block.text;

            tag.innerHTML = `
                <span class="item-tag-text">
                    <strong>[${block.type}]</strong> ${truncatedText}
                </span>
                <button class="remove-tag-btn" title="Remove selection">&times;</button>
            `;

            // Click to remove tag
            tag.querySelector('.remove-tag-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                // Find in releases and toggle off
                for (const release of allReleases) {
                    const foundBlock = release.blocks.find(b => b.id === block.id);
                    if (foundBlock) {
                        toggleBlockSelection(release, foundBlock);
                        break;
                    }
                }
            });

            selectedListEl.appendChild(tag);
        });
    }

    // Regather drafted tweet contents
    generateTweetDraft();
}

// Generate Tweet Draft Text based on templates
function generateTweetDraft() {
    if (selectedBlocks.length === 0) {
        tweetTextarea.value = '';
        updateCharCounter();
        return;
    }

    let draftText = '';

    if (activeTemplate === 'standard') {
        if (selectedBlocks.length === 1) {
            const b = selectedBlocks[0];
            draftText = `BigQuery Update (${b.date}):\n\n[${b.type}] ${cleanTextForTweet(b.text)}\n\nRead details: ${b.link}`;
        } else {
            draftText = `Latest Google BigQuery Updates:\n\n`;
            selectedBlocks.forEach(b => {
                const summary = b.text.length > 80 ? b.text.substring(0, 80) + '...' : b.text;
                draftText += `• [${b.type}] ${cleanTextForTweet(summary)}\n`;
            });
            draftText += `\nRead details: ${selectedBlocks[0].link}`;
        }
    } else if (activeTemplate === 'bullet') {
        draftText = `🚀 New #BigQuery updates parsed:\n\n`;
        selectedBlocks.forEach((b, i) => {
            const summary = b.text.length > 70 ? b.text.substring(0, 70) + '...' : b.text;
            draftText += `${i+1}. [${b.type}] ${cleanTextForTweet(summary)} (${b.date})\n`;
        });
        draftText += `\nLearn more at GCP release notes portal!`;
    } else if (activeTemplate === 'minimal') {
        if (selectedBlocks.length === 1) {
            const b = selectedBlocks[0];
            const summary = b.text.length > 140 ? b.text.substring(0, 140) + '...' : b.text;
            draftText = `#BigQuery: [${b.type}] ${cleanTextForTweet(summary)} ${b.link}`;
        } else {
            draftText = `#BigQuery Release: ${selectedBlocks.length} updates detailed. Check details here: ${selectedBlocks[0].link}`;
        }
    }

    tweetTextarea.value = draftText;
    updateCharCounter();
}

// Clean tags and whitespace for tweets
function cleanTextForTweet(text) {
    // Standardize spacing and normalize characters
    return text.replace(/\s+/g, ' ').replace(/`/g, "'").trim();
}

// Update character counter and progress ring
function updateCharCounter() {
    const text = tweetTextarea.value;
    const len = text.length;

    charCountEl.textContent = `${len} / 280`;

    // Set colors & warning levels
    if (len > 280) {
        charCountEl.className = 'char-counter danger';
        progressRing.className = 'progress-ring danger';
        setProgress(100);
    } else if (len > 250) {
        charCountEl.className = 'char-counter warning';
        progressRing.className = 'progress-ring warning';
        setProgress(len / 280 * 100);
    } else {
        charCountEl.className = 'char-counter';
        progressRing.className = 'progress-ring';
        setProgress(len / 280 * 100);
    }

    // Enable/disable buttons based on input
    tweetBtn.disabled = len === 0;
    copyTweetBtn.disabled = len === 0;
}

function setProgress(percent) {
    const cappedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (cappedPercent / 100 * circumference);
    progressRingCircle.style.strokeDashoffset = offset;
}

// Copy Tweet Text
function copyTweetToClipboard() {
    const text = tweetTextarea.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Tweet draft copied to clipboard!");
    }).catch(err => {
        console.error("Copy failed:", err);
        showToast("Failed to copy. Please manually select and copy text.");
    });
}

// Single block quick tweet utility
function tweetSingleBlock(release, block) {
    const cleanText = cleanTextForTweet(block.content_text);
    const summaryText = cleanText.length > 180 ? cleanText.substring(0, 180) + '...' : cleanText;
    const tweetText = `BigQuery Update (${release.date}):\n\n[${block.type}] ${summaryText}\n\nRead details: ${release.link}`;

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(intentUrl, '_blank');
}

// Batch tweet intent handler
function openTwitterIntent() {
    const text = tweetTextarea.value;
    if (!text) return;

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, '_blank');
}
