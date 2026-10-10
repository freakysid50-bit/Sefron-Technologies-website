/**
 * SEFRON TECHNOLOGIES - Contact Form Controller
 * Connected to Firebase Firestore collection 'contactMessages' via src/firebase.js
 * Implements real-time validation, server timestamping, loading states, and error handling.
 */

import { initFirestore, collection, addDoc, serverTimestamp } from '/src/firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const nameInput = document.getElementById('contactName');
  const phoneInput = document.getElementById('contactPhone');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const formAlert = document.getElementById('contactFormAlert');

  // Error span elements
  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  // Prevent duplicate submissions flag
  let isSubmitting = false;

  // 1. Validator: Name (minimum 2 characters)
  function validateName(value) {
    if (!value || value.trim().length < 2) {
      return 'Please enter your name (minimum 2 characters).';
    }
    return '';
  }

  // 2. Validator: Phone (international or national formats, 7-15 digits)
  function validatePhone(value) {
    if (!value || value.trim().length === 0) {
      return 'Please enter your phone number.';
    }
    const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
    const phoneRegex = /^(\+?\d{1,4})?(\d{7,15})$/;
    if (!phoneRegex.test(cleaned)) {
      return 'Please enter a valid phone number (e.g. +91 9876543210 or +1 234 567 8900).';
    }
    return '';
  }

  // 3. Validator: Email (standard RFC pattern)
  function validateEmail(value) {
    if (!value || value.trim().length === 0) {
      return 'Please enter your email address.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  }

  // 4. Validator: Message (minimum 10 characters)
  function validateMessage(value) {
    if (!value || value.trim().length < 10) {
      return 'Please tell us about your requirement (minimum 10 characters).';
    }
    return '';
  }

  function showFieldError(input, errorElement, errorMessage) {
    if (errorMessage) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('visible');
      }
      return false;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
      }
      return true;
    }
  }

  // Live validation on blur
  nameInput.addEventListener('blur', () => {
    showFieldError(nameInput, nameError, validateName(nameInput.value));
  });

  phoneInput.addEventListener('blur', () => {
    showFieldError(phoneInput, phoneError, validatePhone(phoneInput.value));
  });

  emailInput.addEventListener('blur', () => {
    showFieldError(emailInput, emailError, validateEmail(emailInput.value));
  });

  messageInput.addEventListener('blur', () => {
    showFieldError(messageInput, messageError, validateMessage(messageInput.value));
  });

  // Remove invalid state when typing
  [nameInput, phoneInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
      }
    });
  });

  function showAlert(type, message) {
    if (!formAlert) return;
    formAlert.className = `form-alert ${type}`;
    formAlert.innerHTML = message;
    formAlert.style.display = 'block';

    // Auto-scroll slightly to bring alert into view if needed
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto hide after 8s for error
    if (type === 'error') {
      setTimeout(() => {
        formAlert.style.display = 'none';
      }, 8000);
    }
  }

  // Handle Form Submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 10. Prevent duplicate submissions while request is processing
    if (isSubmitting) return;

    if (formAlert) {
      formAlert.style.display = 'none';
    }

    // 1-4. Validate all fields
    const isNameValid = showFieldError(nameInput, nameError, validateName(nameInput.value));
    const isPhoneValid = showFieldError(phoneInput, phoneError, validatePhone(phoneInput.value));
    const isEmailValid = showFieldError(emailInput, emailError, validateEmail(emailInput.value));
    const isMessageValid = showFieldError(messageInput, messageError, validateMessage(messageInput.value));

    if (!isNameValid || !isPhoneValid || !isEmailValid || !isMessageValid) {
      showAlert('error', 'Please correct the highlighted errors before submitting.');
      return;
    }

    // 5. Show loading state & 10. Prevent duplicate submissions
    isSubmitting = true;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const payload = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim()
    };

    try {
      // 6. Connect to Firebase Firestore and save to collection contactMessages
      const { db } = await initFirestore();

      const docRef = await addDoc(collection(db, 'contactMessages'), {
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        message: payload.message,
        createdAt: serverTimestamp()
      });

      console.log('[Firestore] Contact message saved successfully with ID:', docRef.id);

      // In parallel, notify server endpoint for spreadsheet logging backup
      try {
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (_) {}

      // 7. Show exact success message
      showAlert(
        'success',
        '<strong>Message Sent Successfully!</strong><br>Thank you for contacting Sefron Technologies. Our team will get back to you soon.'
      );

      // 8. Clear the form after successful submission
      contactForm.reset();
      [nameInput, phoneInput, emailInput, messageInput].forEach(inp => {
        inp.classList.remove('is-valid');
        inp.classList.remove('is-invalid');
      });

    } catch (err) {
      // 9. Show exact error message if Firebase submission fails
      console.error('Firebase submission error:', err);
      showAlert('error', 'Something went wrong. Please try again.');
    } finally {
      // Reset loading state and re-enable submit button
      isSubmitting = false;
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});
