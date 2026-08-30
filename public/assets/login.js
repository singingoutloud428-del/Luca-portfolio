const form = document.getElementById('loginForm');
const password = document.getElementById('password');
const notice = document.getElementById('loginNotice');
const button = document.getElementById('loginButton');
const toggle = document.getElementById('togglePassword');

function showNotice(message) {
  notice.textContent = message;
  notice.className = 'notice error show';
}

function clearNotice() {
  notice.textContent = '';
  notice.className = 'notice error';
}

async function request(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function redirectIfSignedIn() {
  try {
    const data = await request('/api/auth');
    if (data.authenticated) window.location.replace('/admin.html');
    else if (!data.configured) showNotice('The site owner still needs to add ADMIN_PASSWORD in Netlify before login can be used.');
  } catch {
    // Keep the login page usable if the initial status check fails.
  }
}

toggle.addEventListener('click', () => {
  const showing = password.type === 'text';
  password.type = showing ? 'password' : 'text';
  toggle.textContent = showing ? 'Show' : 'Hide';
  toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  password.focus();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  clearNotice();
  button.disabled = true;
  button.textContent = 'Signing in…';

  try {
    await request('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    });
    window.location.replace('/admin.html');
  } catch (error) {
    showNotice(error.message);
    password.select();
    button.disabled = false;
    button.textContent = 'Sign in to editor';
  }
});

redirectIfSignedIn();
