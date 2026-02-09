document.addEventListener('DOMContentLoaded', () => {
  const DRAWING_PASSWORD = "+79313166455";

  const inputEl = document.getElementById('drawingPassword');
  const linksEl = document.getElementById('drawingLinks');
  const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
  const messageEl = document.getElementById('passwordMessage');
  const toggleBtn = document.getElementById('togglePassword');
  const passwordBlock = document.querySelector('.password-entry');

  const accessBtn = document.querySelector('.access-btn');
  const modal = document.getElementById('accessModal');
  const closeBtn = modal ? modal.querySelector('.close') : null;

  const form = document.getElementById('accessForm');
  const success = document.getElementById('accessSuccess');

  // Скрываем блок пароля по умолчанию
  if (passwordBlock) passwordBlock.style.display = 'none';

  // ================= PASSWORD SUBMIT =================
  if (passwordSubmitBtn && inputEl && linksEl && messageEl) {
    passwordSubmitBtn.addEventListener('click', () => {
      const input = inputEl.value.trim();

      if (input === DRAWING_PASSWORD) {
        linksEl.style.display = 'flex';
        messageEl.textContent = '';
        alert("Password correct. Drawings are unlocked.");
      } else {
        linksEl.style.display = 'none';
        messageEl.style.color = 'red';
        messageEl.textContent = "Incorrect password. Please check your email.";
      }

      inputEl.value = '';
    });
  }

  // ================= PASSWORD TOGGLE =================
  if (inputEl && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
    });
  }

  // ================= MODAL =================
  const openModal = () => {
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (form) form.reset();
  };

  if (accessBtn) accessBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ================= EMAILJS =================
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: "9D1PeEAfJZyx4QbQA" });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // ===== УСТАНАВЛИВАЕМ TIME =====
      const now = new Date();
      const formattedTime =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, '0') + "-" +
        String(now.getDate()).padStart(2, '0') + " " +
        String(now.getHours()).padStart(2, '0') + ":" +
        String(now.getMinutes()).padStart(2, '0') + ":" +
        String(now.getSeconds()).padStart(2, '0');

      if (form.time) form.time.value = formattedTime;

      const formData = {
        name: form.name.value,
        company: form.company.value,
        email: form.email.value,
        phone: form.phone.value,
        message: form.message.value,
        time: form.time ? form.time.value : formattedTime,
        request: "Request access to project drawings"
      };

      emailjs.send('service_raa0kxg', 'template_wgsxwer', formData)
        .then((response) => {
          console.log('SUCCESS!', response.status, response.text);
          form.reset();
          if (success) success.style.display = 'block';

          if (passwordBlock) passwordBlock.style.display = 'flex';

          setTimeout(() => {
            if (success) success.style.display = 'none';
            closeModal();
          }, 3500);
        })
        .catch((err) => {
          console.error('FAILED...', err);
          alert('Error sending email. Check console.');
        });
    });
  }
});