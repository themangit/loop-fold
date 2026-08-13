document.addEventListener('DOMContentLoaded', () => {
  const headerNavbar = document.querySelector('.header-navbar');
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      headerNavbar?.classList.add('scrolled');
    } else {
      headerNavbar?.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  backToTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  const pickupDateInput = document.getElementById('pickupDate');
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (pickupDateInput) {
    pickupDateInput.value = getTomorrowDateString();
    pickupDateInput.min = getTodayDateString();
  }

  const bookingForm = document.getElementById('pickupBookingForm');
  const fullNameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const emailInput = document.getElementById('emailAddress');
  const addressInput = document.getElementById('pickupAddress');
  const toastNotification = document.getElementById('bookingToast');

  const setInvalid = (input, message) => {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback && message) {
      feedback.textContent = message;
    }
    return false;
  };

  const setValid = (input) => {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
  };

  const validateFullName = () => {
    if (!fullNameInput) return true;
    const val = fullNameInput.value.trim();
    if (!val) {
      return setInvalid(fullNameInput, 'Please enter your full name.');
    }
    if (val.length < 2) {
      return setInvalid(fullNameInput, 'Name must be at least 2 characters.');
    }
    return setValid(fullNameInput);
  };

  const validatePhone = () => {
    if (!phoneInput) return true;
    const val = phoneInput.value.trim();
    if (!val) {
      return setInvalid(phoneInput, 'Please enter your contact number.');
    }
    const digitsOnly = val.replace(/\D/g, '');
    const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}$/;
    if (!phonePattern.test(val) || digitsOnly.length < 10 || digitsOnly.length > 15) {
      return setInvalid(phoneInput, 'Please enter a valid phone number (at least 10 digits).');
    }
    return setValid(phoneInput);
  };

  const validateEmail = () => {
    if (!emailInput) return true;
    const val = emailInput.value.trim();
    if (!val) {
      return setInvalid(emailInput, 'Please enter your email address.');
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(val)) {
      return setInvalid(emailInput, 'Please enter a valid email (e.g. name@example.com).');
    }
    return setValid(emailInput);
  };

  const validatePickupDate = () => {
    if (!pickupDateInput) return true;
    const val = pickupDateInput.value;
    if (!val) {
      return setInvalid(pickupDateInput, 'Please select a pickup date.');
    }
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return setInvalid(pickupDateInput, 'Pickup date cannot be in the past.');
    }
    return setValid(pickupDateInput);
  };

  const validateAddress = () => {
    if (!addressInput) return true;
    const val = addressInput.value.trim();
    if (!val) {
      return setInvalid(addressInput, 'Please provide your pickup address.');
    }
    if (val.length < 5) {
      return setInvalid(addressInput, 'Address must be at least 5 characters.');
    }
    return setValid(addressInput);
  };

  [fullNameInput, phoneInput, emailInput, pickupDateInput, addressInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid') || input.classList.contains('is-valid')) {
        if (input === fullNameInput) validateFullName();
        if (input === phoneInput) validatePhone();
        if (input === emailInput) validateEmail();
        if (input === pickupDateInput) validatePickupDate();
        if (input === addressInput) validateAddress();
      }
    });
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        if (input === fullNameInput) validateFullName();
        if (input === phoneInput) validatePhone();
        if (input === emailInput) validateEmail();
        if (input === pickupDateInput) validatePickupDate();
        if (input === addressInput) validateAddress();
      }
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateFullName();
      const isPhoneValid = validatePhone();
      const isEmailValid = validateEmail();
      const isDateValid = validatePickupDate();
      const isAddressValid = validateAddress();

      if (!isNameValid || !isPhoneValid || !isEmailValid || !isDateValid || !isAddressValid) {
        const firstInvalid = bookingForm.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span>Scheduling Pickup...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        bookingForm.reset();

        [fullNameInput, phoneInput, emailInput, pickupDateInput, addressInput].forEach((input) => {
          input?.classList.remove('is-valid', 'is-invalid');
        });

        if (pickupDateInput) {
          pickupDateInput.value = getTomorrowDateString();
        }

        showToast('🎉 Pickup scheduled successfully! Our valet will confirm shortly.');
      }, 1200);
    });
  }

  function showToast(message) {
    if (!toastNotification) return;
    const toastText = toastNotification.querySelector('.toast-msg');
    if (toastText) toastText.textContent = message;

    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  }

  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });
});
