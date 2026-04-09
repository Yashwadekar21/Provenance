(() => {
  /** @typedef {{role:'user'|'assistant', text:string, payload?:Record<string, unknown>}} ChatMessage */

  const state = {
    /** @type {ChatMessage[]} */
    messages: []
  };

  const chatHistory = document.getElementById('chat-history');
  const chatForm = document.getElementById('chat-form');
  const promptInput = document.getElementById('prompt-input');
  const sourceList = document.getElementById('source-list');
  const suggestionList = document.getElementById('suggestion-list');
  const confidencePill = document.getElementById('confidence-pill');
  const miniGraph = document.getElementById('mini-graph');
  const clearButton = document.getElementById('clear-chat');

  if (!chatHistory || !chatForm || !promptInput || !sourceList || !suggestionList || !confidencePill || !miniGraph || !clearButton) {
    console.error('Dashboard UI failed to initialize: missing required DOM elements.');
    return;
  }

  /** @param {string} value */
  const escapeHtml = (value) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  /** @param {string} query */
  const findMockResponse = (query) => {
    const lower = query.toLowerCase();
    const match = window.MOCK_RESPONSES.find((item) => item.triggers.some((trigger) => lower.includes(trigger)));
    return match ?? window.DEFAULT_RESPONSE;
  };

  /** @param {string} userInput */
  const queryBackend = async (userInput) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return findMockResponse(userInput);
  };

  /** @param {{label:string,href:string}[]} sources */
  const renderSourcesPanel = (sources) => {
    sourceList.innerHTML = sources
      .map(
        (src) =>
          `<div class="list-item"><i class="ph ph-file-text"></i><a href="${src.href}" target="_blank" rel="noreferrer">${escapeHtml(
            src.label
          )}</a></div>`
      )
      .join('');
  };

  /** @param {string[]} suggestions */
  const renderSuggestions = (suggestions) => {
    suggestionList.innerHTML = suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  };

  /** @param {{center:string,reasons:string[]}} graph */
  const renderMiniGraph = (graph) => {
    miniGraph.innerHTML = `
      <div class="graph-row"><span class="g-node center">${escapeHtml(graph.center)}</span></div>
      <div class="graph-row">${graph.reasons.map((reason) => `<span class="g-node">${escapeHtml(reason)}</span>`).join('')}</div>
    `;
  };

  /** @param {string} text */
  const renderUserMessage = (text) => `
    <article class="message user">
      <div class="avatar user">YT</div>
      <div class="bubble">${escapeHtml(text)}</div>
    </article>
  `;

  /** @param {{answer:string,chain:string[],sources:{label:string,href:string}[]}} payload */
  const renderAssistantMessage = (payload) => `
    <article class="message assistant">
      <div class="avatar ai"><i class="ph ph-robot"></i></div>
      <div class="bubble">
        <h3 class="answer-title">Final Answer</h3>
        <p>${escapeHtml(payload.answer)}</p>

        <details class="reasoning-toggle">
          <summary>View Chain of Reasoning</summary>
          <p class="reasoning-path">${payload.chain.map((step) => escapeHtml(step)).join(' -> ')}</p>
        </details>

        <div class="sources">
          ${payload.sources
            .map(
              (src) => `<a class="source-badge" href="${src.href}" target="_blank" rel="noreferrer">📝 ${escapeHtml(src.label)}</a>`
            )
            .join('')}
        </div>
      </div>
    </article>
  `;

  const renderTyping = () => `
    <article id="typing-row" class="message assistant">
      <div class="avatar ai"><i class="ph ph-robot"></i></div>
      <div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>
    </article>
  `;

  const scrollToBottom = () => {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  /** @param {string} html */
  const appendHtml = (html) => {
    chatHistory.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
  };

  const removeTyping = () => {
    const typingRow = document.getElementById('typing-row');
    if (typingRow) {
      typingRow.remove();
    }
  };

  /** @param {string} value */
  const handlePrompt = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    state.messages.push({ role: 'user', text: trimmed });
    appendHtml(renderUserMessage(trimmed));
    appendHtml(renderTyping());

    try {
      const payload = await queryBackend(trimmed);
      removeTyping();

      state.messages.push({ role: 'assistant', text: payload.answer, payload });
      appendHtml(renderAssistantMessage(payload));

      confidencePill.textContent = payload.confidence;
      renderSourcesPanel(payload.sources);
      renderSuggestions(payload.suggestions);
      renderMiniGraph(payload.graph);
    } catch (error) {
      removeTyping();
      appendHtml(
        renderAssistantMessage({
          answer: 'I hit an unexpected issue while contacting the backend mock. Please try again.',
          chain: ['[Backend unavailable]'],
          sources: []
        })
      );
      console.error(error);
    }
  };

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = promptInput.value;
    promptInput.value = '';
    await handlePrompt(value);
  });

  clearButton.addEventListener('click', () => {
    state.messages = [];
    chatHistory.innerHTML = '';
    confidencePill.textContent = '--';
    sourceList.innerHTML = '';
    suggestionList.innerHTML = '';
    miniGraph.innerHTML = '';
    promptInput.focus();
  });

  const boot = async () => {
    if (typeof window.bindRouteNavigation === 'function') {
      window.bindRouteNavigation();
    }
    await handlePrompt('Why did we choose GCP over AWS?');
  };

  void boot();
})();
