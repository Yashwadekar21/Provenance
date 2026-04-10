(() => {
  const form = document.getElementById('auth-form');
  const status = document.getElementById('auth-status');

  if (typeof window.bindRouteNavigation === 'function') {
    window.bindRouteNavigation();
  }

  if (!form || !status) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isRegister = form.querySelector('#name') !== null;

  const setInvalid = (fieldName, invalid) => {
    const field = form.querySelector(`[data-field="${fieldName}"]`);
    if (!field) return;
    field.classList.toggle('invalid', invalid);
  };

  const validators = {
    email: () => {
      const value = form.email?.value?.trim() ?? '';
      const valid = emailRegex.test(value);
      setInvalid('email', !valid);
      return valid;
    },
    password: () => {
      const value = form.password?.value ?? '';
      const valid = value.length >= 6;
      setInvalid('password', !valid);
      return valid;
    },
    name: () => {
      if (!isRegister) return true;
      const value = form.name?.value?.trim() ?? '';
      const valid = value.length >= 2;
      setInvalid('name', !valid);
      return valid;
    },
    confirmPassword: () => {
      if (!isRegister) return true;
      const value = form.confirmPassword?.value ?? '';
      const valid = value.length >= 6 && value === (form.password?.value ?? '');
      setInvalid('confirmPassword', !valid);
      return valid;
    }
  };

  const validate = () => {
    const checks = [validators.email(), validators.password(), validators.name(), validators.confirmPassword()];
    return checks.every(Boolean);
  };

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      status.textContent = '';
      status.classList.remove('error');
      const key = input.name;
      if (key in validators) validators[key]();
      if (key === 'password' && isRegister) validators.confirmPassword();
    });
  });

  form.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const input = form.querySelector(`#${targetId}`);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show ? '<i class="ph ph-eye-slash"></i>' : '<i class="ph ph-eye"></i>';
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    /* Optional: bypass strict validation for demo purposes 
    if (!validate()) {
      status.textContent = 'Please correct the highlighted fields.';
      status.classList.add('error');
      // return; // Uncomment to enforce validation
    }
    */

    status.classList.remove('error');
    status.textContent = isRegister ? 'Account created. Redirecting to login...' : 'Signed in. Redirecting...';

    window.setTimeout(() => {
      window.location.href = isRegister ? './login.html' : './dashboard.html';
    }, 500);
  });
})();