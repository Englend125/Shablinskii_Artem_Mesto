export const createCard = (
  cardData,
  cardTemplateSelector,
  currentUserId,
  handlers,
) => {
  const cardTemplate = document.querySelector(cardTemplateSelector).content;
  const cardElement = cardTemplate.querySelector('.places__item').cloneNode(true);

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const cardLikeButton = cardElement.querySelector('.card__like-button');
  const cardLikeCount = cardElement.querySelector('.card__like-count');
  const cardDeleteButton = cardElement.querySelector('.card__delete-button');
  const cardInfoButton = cardElement.querySelector('.card__info-button');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  const likes = Array.isArray(cardData.likes) ? cardData.likes : [];
  cardLikeCount.textContent = String(likes.length);

  const isLiked = likes.some((user) => user._id === currentUserId);
  if (isLiked) {
    cardLikeButton.classList.add('card__like-button_active');
  }

  const isOwner = cardData.owner && cardData.owner._id === currentUserId;
  if (!isOwner && cardDeleteButton) {
    cardDeleteButton.classList.add('card__delete-button_hidden');
  }

  cardImage.addEventListener('click', () => {
    handlers.handleCardImageClick(cardData);
  });

  cardLikeButton.addEventListener('click', () => {
    handlers.handleLikeClick(cardData, cardLikeButton, cardLikeCount);
  });

  if (cardDeleteButton && isOwner) {
    cardDeleteButton.addEventListener('click', () => {
      handlers.handleDeleteClick(cardData, cardElement);
    });
  }

  if (cardInfoButton) {
    cardInfoButton.addEventListener('click', () => {
      handlers.handleInfoClick(cardData);
    });
  }

  return cardElement;
};
