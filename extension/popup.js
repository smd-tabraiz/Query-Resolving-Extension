const BACKEND_URL = 'http://localhost:5000/api/auth/login';

const loginSection = document.getElementById('loginSection');
const statusSection = document.getElementById('statusSection');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const usernameSpan = document.getElementById('username');
const msgDiv = document.getElementById('msg');

// Check login status on load
chrome.storage.local.get(['authToken', 'user'], (result) => {
  if (result.authToken && result.user) {
    showLoggedIn(result.user.username);
  }
});

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    msgDiv.innerText = 'Please fill all fields';
    return;
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      chrome.storage.local.set({ authToken: data.token, user: data.user }, () => {
        showLoggedIn(data.user.username);
        msgDiv.innerText = 'Logged in successfully!';
      });
    } else {
      msgDiv.innerText = data.message || 'Login failed';
    }
  } catch (error) {
    msgDiv.innerText = 'Error connecting to server';
  }
});

logoutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['authToken', 'user'], () => {
    loginSection.classList.remove('hidden');
    statusSection.classList.add('hidden');
    msgDiv.innerText = 'Logged out';
  });
});

function showLoggedIn(username) {
  loginSection.classList.add('hidden');
  statusSection.classList.remove('hidden');
  usernameSpan.innerText = username;
}
