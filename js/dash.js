document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const clearBtn = document.getElementById('clear-chat');

    // Function to add a user message to the UI
    const sendUserMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        // Create user message HTML
        const userHtml = `
            <div class="message user-message">
                <div class="avatar user-avatar">JT</div>
                <div class="bubble">${text}</div>
            </div>
        `;
        chatHistory.insertAdjacentHTML('beforeend', userHtml);
        inputField.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Simulate AI "typing" delay
        setTimeout(simulateAIResponse, 1000);
    };

    // Simulate an AI response
    const simulateAIResponse = () => {
        const aiHtml = `
            <div class="message ai-message">
                <div class="avatar ai-avatar"><i class="ph ph-robot"></i></div>
                <div class="bubble">
                    <p>I'm analyzing the internal documents to find reasoning regarding your query...</p>
                </div>
            </div>
        `;
        chatHistory.insertAdjacentHTML('beforeend', aiHtml);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    // Event Listeners
    sendBtn.addEventListener('click', sendUserMessage);
    
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });

    clearBtn.addEventListener('click', () => {
        chatHistory.innerHTML = ''; // Clears the chat
    });
});