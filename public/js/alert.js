const hideAlert = () => {
  const element = document.querySelector('.alert');
  if (element) element.parentElement.removeChild(element);
};

export const showAlert = (type, message) => {
  hideAlert();
  const div = `<div class='alert alert--${type}>${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', div);
  window.setTimeout(() => hideAlert(), 5000);
};
