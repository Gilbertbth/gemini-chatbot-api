const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const toneOptions = document.querySelectorAll('.tone-option');
const sendButton = form.querySelector('button[type="submit"]');

let conversationHistory = [];
let selectedTone = 'santai';

toneOptions.forEach((option) => {
  option.addEventListener('click', () => {
    selectedTone = option.dataset.tone;
    toneOptions.forEach((item) => {
      const isActive = item === option;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  });
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  conversationHistory.push({ role: 'user', text: userMessage });

  const botMessageElement = createTypingIndicator();
  chatBox.appendChild(botMessageElement);
  scrollToBottom();
  setBusy(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: conversationHistory,
        tone: selectedTone
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    botMessageElement.classList.remove('typing');

    if (data && data.result) {
      botMessageElement.textContent = data.result;
      conversationHistory.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.textContent = 'Maaf, aku belum menerima jawaban. Coba kirim ulang ya.';
    }
  } catch (error) {
    console.error('Error fetching response:', error);
    botMessageElement.classList.remove('typing');
    botMessageElement.textContent = 'Maaf, koneksi ke server sedang bermasalah. Coba lagi sebentar ya.';
  } finally {
    setBusy(false);
    input.focus();
    scrollToBottom();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  scrollToBottom();
}

function createTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.classList.add('message', 'bot', 'typing');
  indicator.setAttribute('aria-label', 'ChatBot Gilbert sedang mengetik');
  indicator.innerHTML = '<span></span><span></span><span></span>';
  return indicator;
}

function setBusy(isBusy) {
  input.disabled = isBusy;
  sendButton.disabled = isBusy;
  input.placeholder = isBusy ? 'ChatBot Gilbert sedang mengetik...' : 'Tulis pertanyaan Anda...';
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
