const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
  }
  inputElement.classList.add(settings.inputErrorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove(settings.errorClass);
  }
  inputElement.classList.remove(settings.inputErrorClass);
};

const profileNamePattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
const placeNamePattern = /^[a-zA-Zа-яА-ЯёЁ0-9\s\-.,«»()№'’]+$/;
const customProfileNameMessage =
  'Разрешены только латинские, кириллические буквы, пробелы и дефис';
const customPlaceNameMessage =
  'Используйте буквы, цифры, пробел и распространённые знаки (. , - скобки)';

const isProfileNameField = (inputElement) => {
  return inputElement.name === 'profile-name';
};

const isPlaceNameField = (inputElement) => {
  return inputElement.name === 'place-name';
};

const isLinkField = (inputElement) => {
  return (
    inputElement.name === 'place-link' || inputElement.name === 'avatar-link'
  );
};

const buildLinkCandidate = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const checkLinkValidity = (inputElement) => {
  const value = inputElement.value.trim();
  if (!value) {
    return { valid: true };
  }
  const candidate = buildLinkCandidate(inputElement.value);
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        message: 'Ссылка должна начинаться с http:// или https://',
      };
    }
    return { valid: true };
  } catch {
    return { valid: false, message: 'Введите корректный адрес ссылки' };
  }
};

const checkCustomNameValidity = (inputElement) => {
  const trimmed = inputElement.value.trim();
  if (!trimmed) {
    return { valid: true };
  }
  if (isProfileNameField(inputElement)) {
    if (!profileNamePattern.test(trimmed)) {
      return { valid: false, message: customProfileNameMessage };
    }
    return { valid: true };
  }
  if (isPlaceNameField(inputElement)) {
    if (!placeNamePattern.test(trimmed)) {
      return { valid: false, message: customPlaceNameMessage };
    }
    return { valid: true };
  }
  return { valid: true };
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (isLinkField(inputElement)) {
    const linkCheck = checkLinkValidity(inputElement);
    if (!linkCheck.valid) {
      showInputError(formElement, inputElement, linkCheck.message, settings);
      return;
    }
    hideInputError(formElement, inputElement, settings);
  } else if (isProfileNameField(inputElement) || isPlaceNameField(inputElement)) {
    const custom = checkCustomNameValidity(inputElement);
    if (!custom.valid) {
      showInputError(formElement, inputElement, custom.message, settings);
      return;
    }
  }

  if (!inputElement.validity.valid) {
    showInputError(
      formElement,
      inputElement,
      inputElement.validationMessage,
      settings,
    );
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

const hasInvalidInput = (formElement, settings) => {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector),
  );

  return inputList.some((inputElement) => {
    if (isLinkField(inputElement)) {
      const linkCheck = checkLinkValidity(inputElement);
      if (!linkCheck.valid) {
        return true;
      }
    } else if (
      isProfileNameField(inputElement) ||
      isPlaceNameField(inputElement)
    ) {
      const custom = checkCustomNameValidity(inputElement);
      if (!custom.valid) {
        return true;
      }
    }
    return !inputElement.validity.valid;
  });
};

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (formElement, settings) => {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  if (!submitButton) {
    return;
  }
  if (hasInvalidInput(formElement, settings)) {
    disableSubmitButton(submitButton, settings);
  } else {
    enableSubmitButton(submitButton, settings);
  }
};

const setEventListeners = (formElement, settings) => {
  const inputList = formElement.querySelectorAll(settings.inputSelector);
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, settings);
    });
  });
};

export const enableValidation = (validationSettings) => {
  const settingsList = Array.isArray(validationSettings)
    ? validationSettings
    : [validationSettings];

  settingsList.forEach((settings) => {
    const formElement = document.querySelector(settings.formSelector);
    if (!formElement) {
      return;
    }
    setEventListeners(formElement, settings);
    toggleButtonState(formElement, settings);
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = formElement.querySelectorAll(settings.inputSelector);
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  if (submitButton) {
    disableSubmitButton(submitButton, settings);
  }
};
