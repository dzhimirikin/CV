document.addEventListener('DOMContentLoaded', () => {
  const DRAWING_PASSWORD = "+79313166455";

  const inputEl = document.getElementById('drawingPassword');
  const linksEl = document.getElementById('drawingLinks');
  const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
  const messageEl = document.getElementById('passwordMessage');

  const accessBtn = document.querySelector('.access-btn');
  const modal = document.getElementById('accessModal');
  const closeBtn = modal.querySelector('.close');

  const form = document.getElementById('accessForm');
  const success = document.getElementById('accessSuccess');

  // ================= PASSWORD =================
  passwordSubmitBtn.addEventListener('click', () => {
    const input = inputEl.value.trim();
    if(input === DRAWING_PASSWORD){
      linksEl.style.display = 'flex';
      messageEl.style.color = 'green';
      messageEl.textContent = "Password correct. Drawings are unlocked.";
    } else {
      linksEl.style.display = 'none';
      messageEl.style.color = 'red';
      messageEl.textContent = "Incorrect password. Please check your email.";
    }
    inputEl.value = '';
  });

  // ================= MODAL =================
  accessBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if(e.target === modal){
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // ================= EMAILJS =================
  emailjs.init("9D1PeEAfJZyx4QbQA"); // твой публичный ключ

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      name: form.name.value,
      company: form.company.value,
      email: form.email.value,
      message: form.message.value,
      request: "Drawing access request"
    };

    emailjs.send('service_raa0kxg', 'template_wgsxwer', formData)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        form.reset();
        success.style.display = 'block';
        document.querySelector('.password-entry').style.display = 'flex';

        setTimeout(() => {
          success.style.display = 'none';
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }, 3500);
      }, (err) => {
        console.error('FAILED...', err);
        alert('Error sending email. Check console.');
      });
  });
});