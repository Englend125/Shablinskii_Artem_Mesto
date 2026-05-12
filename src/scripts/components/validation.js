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

const nameTitlePattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
const customNameMessage =
  'Разрешены только латинские, кириллические буквы, пробелы и дефис';

const isNameOrTitleField = (inputElement) => {
  return (
    inputElement.name === 'profile-name' || inputElement.name === 'place-name'
  );
};

const checkCustomNameValidity = (inputElement) => {
  const value = inputElement.value;
  if (!value) {
    return { valid: true };
  }
  if (!nameTitlePattern.test(value)) {
    return { valid: false, message: customNameMessage };
  }
  return { valid: true };
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (isNameOrTitleField(inputElement)) {
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
    if (isNameOrTitleField(inputElement)) {
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
