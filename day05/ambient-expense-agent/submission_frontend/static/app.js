document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const pendingGrid = document.getElementById('pending-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const statsPending = document.getElementById('stats-pending');
    const refreshBtn = document.getElementById('refresh-btn');

    // Modal Elements
    const detailsModal = document.getElementById('details-modal');
    const closeModal = document.getElementById('close-modal');
    const modalSessionId = document.getElementById('modal-session-id');
    const modalUserId = document.getElementById('modal-user-id');
    const modalTime = document.getElementById('modal-time');
    const modalStateJson = document.getElementById('modal-state-json');
    const modalTimeline = document.getElementById('modal-timeline');

    // Load Data initially
    loadPendingSessions();

    // Event Listeners
    refreshBtn.addEventListener('click', loadPendingSessions);
    closeModal.addEventListener('click', hideModal);

    // Close modal on overlay click
    document.querySelector('.modal-overlay').addEventListener('click', hideModal);

    // API: Fetch and render active sessions
    async function loadPendingSessions() {
        showLoading();
        try {
            const response = await fetch('/api/pending');
            if (!response.ok) throw new Error('Failed to retrieve pending sessions.');
            const data = await response.json();

            renderSessions(data.pending);
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
            showEmpty();
        }
    }

    // Render Cards in Grid
    function renderSessions(sessions) {
        // Update stats
        statsPending.textContent = sessions.length;

        if (sessions.length === 0) {
            showEmpty();
            return;
        }

        pendingGrid.innerHTML = '';
        sessions.forEach(sess => {
            const card = document.createElement('div');
            card.className = 'glass-panel pending-card';
            card.id = `card-${sess.session_id}`;

            // Format time
            const dateStr = sess.last_update_time
                ? new Date(sess.last_update_time * 1000).toLocaleString()
                : 'Unknown';

            // Get claim details
            const amount = sess.expense.amount != null ? `$${parseFloat(sess.expense.amount).toFixed(2)}` : '$0.00';
            const category = sess.expense.category || 'Uncategorized';
            const submitter = sess.expense.submitter || sess.user_id;
            const description = sess.expense.description || 'No description provided';
            const expenseDate = sess.expense.date || 'N/A';

            // Get risk details
            const riskScore = sess.risk_review.risk_score || 0;
            const riskFactors = (sess.risk_review.risk_factors || []).join(', ') || 'None';
            const riskExplanation = sess.risk_review.explanation || 'No review completed';

            card.innerHTML = `
                <div class="card-header">
                    <div class="user-badge">
                        <div class="user-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <div class="user-name">${submitter}</div>
                            <div class="user-email">Session: ${sess.session_id.substring(0, 8)}...</div>
                        </div>
                    </div>
                    <div class="amount-tag">${amount}</div>
                </div>
                <div class="card-body">
                    <div class="expense-meta">
                        <div class="meta-row">
                            <span class="meta-label">Category:</span>
                            <span class="meta-value">${category}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Date:</span>
                            <span class="meta-value">${expenseDate}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Reason:</span>
                            <span class="meta-value">${description}</span>
                        </div>
                    </div>

                    <div class="risk-alert-box">
                        <div class="risk-header">
                            <span><i class="fa-solid fa-triangle-exclamation"></i> Risk Review</span>
                            <span class="risk-score">Score: ${riskScore}/5</span>
                        </div>
                        <div class="risk-description">
                            <strong>Factors:</strong> ${riskFactors}<br>
                            <strong>Details:</strong> ${riskExplanation}
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-approve approve-action-btn" data-session="${sess.session_id}">
                        <i class="fa-solid fa-check"></i> Approve
                    </button>
                    <button class="btn btn-reject reject-action-btn" data-session="${sess.session_id}">
                        <i class="fa-solid fa-xmark"></i> Reject
                    </button>
                    <button class="btn btn-details details-action-btn" data-session="${sess.session_id}">
                        <i class="fa-solid fa-magnifying-glass"></i> Audit Trail
                    </button>
                </div>
            `;

            pendingGrid.appendChild(card);
        });

        // Attach action events
        document.querySelectorAll('.approve-action-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAction(btn.dataset.session, 'approve'));
        });
        document.querySelectorAll('.reject-action-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAction(btn.dataset.session, 'reject'));
        });
        document.querySelectorAll('.details-action-btn').forEach(btn => {
            btn.addEventListener('click', () => showDetails(btn.dataset.session));
        });

        showGrid();
    }

    // Submit Approval Action (Approve / Reject)
    async function handleAction(sessionId, action) {
        const card = document.getElementById(`card-${sessionId}`);
        const buttons = card.querySelectorAll('.btn');

        // Disable actions & show progress
        buttons.forEach(b => b.disabled = true);
        const actionBtn = card.querySelector(action === 'approve' ? '.btn-approve' : '.btn-reject');
        const origHtml = actionBtn.innerHTML;
        actionBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;

        try {
            const response = await fetch(`/api/action/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to submit decision.');
            }

            const result = await response.json();

            showToast(`Expense successfully ${action}d!`, 'success');

            // Fade card out
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.remove();
                // Refresh list to update counters
                loadPendingSessions();
            }, 300);

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
            // Restore buttons
            buttons.forEach(b => b.disabled = false);
            actionBtn.innerHTML = origHtml;
        }
    }

    // Fetch and show audit trail in Modal
    async function showDetails(sessionId) {
        try {
            const response = await fetch(`/api/session/${sessionId}`);
            if (!response.ok) throw new Error('Could not retrieve audit trail details.');
            const data = await response.json();

            // Populate Modal metadata
            modalSessionId.textContent = data.session_id;
            modalUserId.textContent = data.user_id;
            modalTime.textContent = data.last_update_time
                ? new Date(data.last_update_time * 1000).toLocaleString()
                : 'N/A';

            // Populate State details
            modalStateJson.textContent = JSON.stringify(data.state, null, 2);

            // Render Timeline events
            modalTimeline.innerHTML = '';
            data.events.forEach((ev, idx) => {
                const item = document.createElement('div');
                item.className = 'timeline-item';

                // Determine node/event visual style
                let isWaiting = false;
                let isFinal = false;
                let bodyHtml = '';

                // Extract node information
                const nodeName = ev.node_info ? (ev.node_info.path || '').split('/').pop() : 'Workflow';
                const timestamp = ev.timestamp ? new Date(ev.timestamp * 1000).toLocaleTimeString() : '';

                if (ev.long_running_tool_ids && ev.long_running_tool_ids.length > 0) {
                    isWaiting = true;
                    bodyHtml = `⚠️ <strong>Execution suspended</strong>. Waiting for decision: <code>${ev.long_running_tool_ids.join(', ')}</code>`;
                } else if (ev.output && ev.output.status) {
                    isFinal = true;
                    bodyHtml = `🏁 <strong>Execution completed</strong>. Outcome: <span style="color: var(--success)">${ev.output.status}</span> via <strong>${ev.output.method || 'Unknown'}</strong>`;
                } else if (ev.content && ev.content.parts) {
                    const text = ev.content.parts.map(p => p.text || '').join(' ').trim();
                    bodyHtml = text ? `💬 <em>"${text}"</em>` : `Processed node execution`;
                } else if (ev.actions && ev.actions.state_delta) {
                    bodyHtml = `Updated state variables: <pre>${JSON.stringify(ev.actions.state_delta, null, 2)}</pre>`;
                } else {
                    bodyHtml = `Node execution completed`;
                }

                item.innerHTML = `
                    <div class="timeline-dot ${isWaiting ? 'active' : ''} ${isFinal ? 'success' : ''}"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="author-name">${ev.author || 'system'} @ ${nodeName}</span>
                            <span>${timestamp}</span>
                        </div>
                        <div class="timeline-body">
                            ${bodyHtml}
                        </div>
                    </div>
                `;
                modalTimeline.appendChild(item);
            });

            // Show Modal
            detailsModal.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    }

    function hideModal() {
        detailsModal.classList.add('hidden');
    }

    // Toast Manager
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success'
            ? '<i class="fa-solid fa-circle-check"></i>'
            : '<i class="fa-solid fa-circle-exclamation"></i>';

        toast.innerHTML = `
            ${icon}
            <span class="toast-msg">${message}</span>
        `;
        container.appendChild(toast);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // View State Transitions
    function showLoading() {
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        pendingGrid.classList.add('hidden');
    }

    function showEmpty() {
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
        pendingGrid.classList.add('hidden');
    }

    function showGrid() {
        loadingState.classList.add('hidden');
        emptyState.classList.add('hidden');
        pendingGrid.classList.remove('hidden');
    }
});
