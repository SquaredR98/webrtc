export const setLocalStorage = (key, value) => {
  value = JSON.stringify(value);
  localStorage.setItem(key, value)
}

export const fetchLocalStorage = (key) => {
  const response = localStorage.getItem(key);
  return JSON.parse(response);
}