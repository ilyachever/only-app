const state = {
  active: 'btn_active',
}

document.addEventListener('click', (evt) => {
  const {target} = evt;
  // Open / Close popup when clicking it / it's content
  if (target.classList.contains('btn') && !target.classList.contains(state.active)) {
    openPopup(target);
  } else {
    closePopup(target);
  }
  // Close popup when clicking outside it
  if (!target.classList.contains('btn') && !target.classList.contains(state.active)) {
    closeAllPopups();
  }
})

function openPopup(target) {
  target.classList.add(state.active);
  target.querySelector('.btn__icon').textContent = '-';
}

function closePopup(target) {
  target.classList.remove(state.active);
  target.querySelector('.btn__icon').textContent = '+';
}

function closeAllPopups() {
  const activeButtons = document.querySelectorAll('.btn_active');

  activeButtons.forEach(button => {
    button.classList.remove(state.active);
    button.querySelector('.btn__icon').textContent = '+';
  });
}

