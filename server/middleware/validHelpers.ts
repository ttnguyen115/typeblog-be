const MAX_LENGTH_NAME: number = 20;
const REG_EXP_EMAIL: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REG_EXP_PHONE_NUMBERS: RegExp = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

function validateEmail(email: string) {
  console.log(typeof REG_EXP_EMAIL, typeof REG_EXP_PHONE_NUMBERS);
  return REG_EXP_EMAIL.test(String(email).toLowerCase());
}

function validatePhone(phone: string) {
  console.log(typeof REG_EXP_EMAIL, typeof REG_EXP_PHONE_NUMBERS);
  return REG_EXP_EMAIL.test(String(phone));
}

function isInvalidAccount(info: string) {
  return !validateEmail(info) && !validatePhone(info);
}

export { MAX_LENGTH_NAME, REG_EXP_EMAIL, REG_EXP_PHONE_NUMBERS };
export { isInvalidAccount };
