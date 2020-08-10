import '@babel/polyfill';
import { login, logout } from './login';
import { mapbox } from './mapbox';
import { updateSetting } from './updateSetting';

// values
const mapElement = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('email').value);
    form.append('email', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSetting(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSetting(
      { currentPassword, password, confirmPassword },
      'password'
    );
    document.querySelector('.btn--save--password').textContent =
      'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
if (mapElement) {
  // maps
  const locations = JSON.parse(mapElement.getAttribute('data-locations'));
  mapbox(
    locations,
    'pk.eyJ1IjoiY2FzdGVycHJvZyIsImEiOiJja2RlNTJ4YXQxem5sMzRrNmZxMjJ6N2RuIn0.XQH1E7l9k4JqNPzZe0yZnA'
  );
}
