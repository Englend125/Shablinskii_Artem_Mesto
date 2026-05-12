const handleEscKey = (evt) => {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector('.popup_opened');
    if (openedPopup) {
      closePopup(openedPopup);
    }
  }
};

export const openPopup = (popup) => {
  document.removeEventListener('keydown', handleEscKey);
  popup.classList.add('popup_opened');
  document.addEventListener('keydown', handleEscKey);
};

export const closePopup = (popup) => {
  popup.classList.remove('popup_opened');
  document.removeEventListener('keydown', handleEscKey);
};

export const setPopupEventListeners = (popup) => {
  const closeButton = popup.querySelector('.popup__close');
  const overlay = popup.querySelector('.popup__overlay');

  if (closeButton) {
    closeButton.addEventListener('click', () => closePopup(popup));
  }

  if (overlay) {
    overlay.addEventListener('click', () => closePopup(popup));
  }
};
