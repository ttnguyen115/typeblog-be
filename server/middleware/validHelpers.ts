const MAX_LENGTH_NAME: number = 20;
const REG_EXP_EMAIL: RegExp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REG_EXP_PHONE_NUMBERS: RegExp = /^[+]/g;

function validateEmail(email: string) {
  return REG_EXP_EMAIL.test(String(email).toLowerCase());
}

function validatePhone(phone: string) {
  return REG_EXP_PHONE_NUMBERS.test(phone);
}

function isInvalidAccount(info: string) {
  return !validatePhone(info) && !validateEmail(info);
}

export { MAX_LENGTH_NAME, REG_EXP_EMAIL, REG_EXP_PHONE_NUMBERS };
export { isInvalidAccount, validateEmail, validatePhone };
