import '../pages/index.css';

import {
  addCard,
  changeLikeCardStatus,
  deleteCard,
  getInitialCards,
  getUserInfo,
  updateAvatar,
  updateUserInfo,
} from './components/api.js';
import { createCard } from './components/card.js';
import {
  closePopup,
  openPopup,
  setPopupEventListeners,
} from './components/modal.js';
import { clearValidation, enableValidation } from './components/validation.js';

const placesList = document.querySelector('.places__list');
const profileAvatar = document.querySelector('.profile__avatar');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileEditButton = document.querySelector('.profile__edit-button');
const profileAvatarButton = document.querySelector('.profile__avatar-button');
const profileAddButton = document.querySelector('.profile__add-button');

const popupEdit = document.querySelector('.popup_type_edit');
const popupNewCard = document.querySelector('.popup_type_new-card');
const popupImage = document.querySelector('.popup_type_image');
const popupAvatar = document.querySelector('.popup_type_avatar');
const popupRemoveCard = document.querySelector('.popup_type_remove-card');
const popupCardInfo = document.querySelector('.popup_type_card-info');

const formEdit = popupEdit.querySelector('.popup__form');
const formNewCard = popupNewCard.querySelector('.popup__form');
const formAvatar = popupAvatar.querySelector('.popup__form');
const formRemoveCard = popupRemoveCard.querySelector('.popup__form');

const formEditSubmitButton = formEdit.querySelector('.popup__button');
const formNewCardSubmitButton = formNewCard.querySelector('.popup__button');
const formAvatarSubmitButton = formAvatar.querySelector('.popup__button');
const formRemoveCardSubmitButton = formRemoveCard.querySelector('.popup__button');

const nameInput = formEdit.querySelector('#profile-name-input');
const aboutInput = formEdit.querySelector('#profile-about-input');
const placeNameInput = formNewCard.querySelector('#place-name-input');
const placeLinkInput = formNewCard.querySelector('#place-link-input');
const avatarLinkInput = formAvatar.querySelector('#avatar-link-input');

const imagePopupPicture = popupImage.querySelector('.popup__image');
const imagePopupCaption = popupImage.querySelector('.popup__caption');

const cardInfoDescription = popupCardInfo.querySelector(
  '.card-info__value_type_description',
);
const cardInfoDate = popupCardInfo.querySelector('.card-info__value_type_date');
const cardInfoOwner = popupCardInfo.querySelector('.card-info__value_type_owner');
const cardInfoLikesCount = popupCardInfo.querySelector(
  '.card-info__value_type_likes-count',
);
const cardInfoLikes = popupCardInfo.querySelector('.card-info__likes');

const validationSettings = [
  {
    formSelector: '.popup_type_edit .popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible',
  },
  {
    formSelector: '.popup_type_new-card .popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible',
  },
  {
    formSelector: '.popup_type_avatar .popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible',
  },
];

const editFormSettings = validationSettings[0];
const newCardFormSettings = validationSettings[1];
const avatarFormSettings = validationSettings[2];

let currentUserId = null;
let cardPendingRemovalId = null;
let cardPendingRemovalElement = null;

const formatCardDate = (isoString) => {
  if (!isoString) {
    return '—';
  }
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const renderUserData = (user) => {
  profileAvatar.src = user.avatar;
  profileAvatar.alt = user.name;
  profileTitle.textContent = user.name;
  profileDescription.textContent = user.about;
};

const fillProfileForm = () => {
  nameInput.value = profileTitle.textContent;
  aboutInput.value = profileDescription.textContent;
  nameInput.dispatchEvent(new Event('input'));
  aboutInput.dispatchEvent(new Event('input'));
};

const fillCardInfoPopup = (card) => {
  cardInfoDescription.textContent = card.name;
  cardInfoDate.textContent = formatCardDate(card.createdAt);
  cardInfoOwner.textContent = card.owner ? card.owner.name : '—';
  const likes = Array.isArray(card.likes) ? card.likes : [];
  cardInfoLikesCount.textContent = String(likes.length);

  while (cardInfoLikes.firstChild) {
    cardInfoLikes.removeChild(cardInfoLikes.firstChild);
  }

  likes.forEach((user) => {
    const tag = document.createElement('span');
    tag.classList.add('card-info__tag');
    tag.textContent = user.name;
    cardInfoLikes.append(tag);
  });
};

const createCardHandlers = () => ({
  handleCardImageClick: (cardData) => {
    imagePopupPicture.src = cardData.link;
    imagePopupPicture.alt = cardData.name;
    imagePopupCaption.textContent = cardData.name;
    openPopup(popupImage);
  },

  handleLikeClick: (cardData, likeButton, likeCountElement) => {
    const isLiked = likeButton.classList.contains('card__like-button_active');
    changeLikeCardStatus(cardData._id, isLiked)
      .then((updatedCard) => {
        const likes = Array.isArray(updatedCard.likes) ? updatedCard.likes : [];
        likeCountElement.textContent = String(likes.length);
        const likedByCurrentUser = likes.some(
          (userItem) => userItem._id === currentUserId,
        );
        likeButton.classList.toggle(
          'card__like-button_active',
          likedByCurrentUser,
        );
      })
      .catch(() => {});
  },

  handleDeleteClick: (cardData, cardElement) => {
    cardPendingRemovalId = cardData._id;
    cardPendingRemovalElement = cardElement;
    openPopup(popupRemoveCard);
  },

  handleInfoClick: (cardData) => {
    fillCardInfoPopup(cardData);
    openPopup(popupCardInfo);
  },
});

const renderInitialCards = (cards) => {
  cards.forEach((item) => {
    const cardElement = createCard(
      item,
      '#card-template',
      currentUserId,
      cardHandlers,
    );
    placesList.append(cardElement);
  });
};

const normalizeLinkUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const setSubmitLoadingState = (button, isLoading, loadingText) => {
  if (isLoading) {
    button.dataset.storedLabel = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }
  button.textContent = button.dataset.storedLabel || button.textContent;
  button.disabled = false;
  delete button.dataset.storedLabel;
};

const cardHandlers = createCardHandlers();

enableValidation(validationSettings);

setPopupEventListeners(popupEdit);
setPopupEventListeners(popupNewCard);
setPopupEventListeners(popupImage);
setPopupEventListeners(popupAvatar);
setPopupEventListeners(popupRemoveCard);
setPopupEventListeners(popupCardInfo);

profileEditButton.addEventListener('click', () => {
  fillProfileForm();
  openPopup(popupEdit);
});

profileAddButton.addEventListener('click', () => {
  formNewCard.reset();
  clearValidation(formNewCard, newCardFormSettings);
  openPopup(popupNewCard);
});

profileAvatarButton.addEventListener('click', () => {
  formAvatar.reset();
  clearValidation(formAvatar, avatarFormSettings);
  openPopup(popupAvatar);
});

formEdit.addEventListener('submit', (evt) => {
  evt.preventDefault();
  setSubmitLoadingState(formEditSubmitButton, true, 'Сохранение...');

  updateUserInfo(nameInput.value.trim(), aboutInput.value.trim())
    .then((user) => {
      renderUserData(user);
      closePopup(popupEdit);
    })
    .catch(() => {})
    .finally(() => {
      setSubmitLoadingState(formEditSubmitButton, false);
      nameInput.dispatchEvent(new Event('input'));
      aboutInput.dispatchEvent(new Event('input'));
    });
});

formNewCard.addEventListener('submit', (evt) => {
  evt.preventDefault();
  setSubmitLoadingState(formNewCardSubmitButton, true, 'Создание...');

  addCard(
    placeNameInput.value.trim(),
    normalizeLinkUrl(placeLinkInput.value),
  )
    .then((card) => {
      const cardElement = createCard(
        card,
        '#card-template',
        currentUserId,
        cardHandlers,
      );
      placesList.prepend(cardElement);
      formNewCard.reset();
      clearValidation(formNewCard, newCardFormSettings);
      closePopup(popupNewCard);
    })
    .catch(() => {})
    .finally(() => {
      setSubmitLoadingState(formNewCardSubmitButton, false);
      placeNameInput.dispatchEvent(new Event('input'));
      placeLinkInput.dispatchEvent(new Event('input'));
    });
});

formAvatar.addEventListener('submit', (evt) => {
  evt.preventDefault();
  setSubmitLoadingState(formAvatarSubmitButton, true, 'Сохранение...');

  updateAvatar(normalizeLinkUrl(avatarLinkInput.value))
    .then((user) => {
      renderUserData(user);
      closePopup(popupAvatar);
    })
    .catch(() => {})
    .finally(() => {
      setSubmitLoadingState(formAvatarSubmitButton, false);
      avatarLinkInput.dispatchEvent(new Event('input'));
    });
});

formRemoveCard.addEventListener('submit', (evt) => {
  evt.preventDefault();
  if (!cardPendingRemovalId || !cardPendingRemovalElement) {
    closePopup(popupRemoveCard);
    return;
  }

  setSubmitLoadingState(formRemoveCardSubmitButton, true, 'Удаление...');

  deleteCard(cardPendingRemovalId)
    .then(() => {
      cardPendingRemovalElement.remove();
      cardPendingRemovalElement = null;
      cardPendingRemovalId = null;
      closePopup(popupRemoveCard);
    })
    .catch(() => {})
    .finally(() => {
      setSubmitLoadingState(formRemoveCardSubmitButton, false);
    });
});

Promise.all([getUserInfo(), getInitialCards()])
  .then(([user, cards]) => {
    currentUserId = user._id;
    renderUserData(user);
    renderInitialCards(cards.slice().reverse());
  })
  .catch(() => {});
