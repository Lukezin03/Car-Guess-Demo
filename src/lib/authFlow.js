export const AUTH_METHODS = {
  MAGIC_LINK: "magic-link",
  PASSWORD: "password",
};

const AUTH_METHOD_STORAGE_KEY = "carguess_last_auth_method";

export function getLastAuthMethod() {
  try {
    return window.localStorage.getItem(AUTH_METHOD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setLastAuthMethod(method) {
  try {
    window.localStorage.setItem(AUTH_METHOD_STORAGE_KEY, method);
  } catch {
    // Ignore storage failures and keep auth flow functional.
  }
}

export function clearLastAuthMethod() {
  try {
    window.localStorage.removeItem(AUTH_METHOD_STORAGE_KEY);
  } catch {
    // Ignore storage failures and keep auth flow functional.
  }
}
