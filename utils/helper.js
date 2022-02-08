const CryptoJS = require("crypto-js");

const encrypt = (passwordString, secretKey) => {
  const hashPassword = CryptoJS.AES.encrypt(passwordString, secretKey).toString();
  return hashPassword;
};

const decrypt = (hashedPassword, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(hashedPassword, secretKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function isEmptyObj(obj) {
  if (Object.keys(obj).length === 0) return true;
  return false;
}

function isObjectId(objectId, key) {
  if (Array.isArray(objectId)) {
    if (objectId.length === 0) return false;
    for (let i = 0; i < objectId.length; i++) {
      let checkId = objectId[i];
      if (key) checkId = objectId[i][key];
      if (!invalidObjectId(checkId)) return false;
      if (!checkId.match(/^[0-9a-fA-F]{24}$/)) return false;
    }
    return true;
  }
  if (!objectId || typeof objectId !== "string" || !checkId.match(/^[0-9a-fA-F]{24}$/)) {
    return false;
  }
  return true;
}

//check valid object
function isValidObj(obj) {
  if (typeof obj !== "object") return false;
  return true;
}

// Boolean validate
function isBoolean(value) {
  if (typeof value !== "boolean") return false;
  return true;
}

// String validate
function isString(value) {
  if (value == null || !value) return false;
  if (typeof value !== "string") return false;
  return true;
}

// validate
function isEmpty(value, method = "string") {
  if (value == null || !value || value == undefined) return true;
  if (method) {
    if (typeof value !== method) return true;
  }
  return false;
}

// is array
function isArray(value) {
  return Array.isArray(value) ? true : false;
}

// is valid date
function isDate(date) {
  date = new Date(date);
  return date instanceof Date && !isNaN(date);
}

// is file
function isFile(files, field = "img") {
  if (!files) return false;
  if (!files[field]) return false;
  return true;
}

function getTimeFromDate(date) {
  const dt = new Date(date);
  return dt.getTime();
}

function compareBtwDate(start_date, end_date) {
  const start = getTimeFromDate(start_date);
  const end = getTimeFromDate(end_date);
  if (end < start) return false;
  return true;
}

const isDuplicateArrayMany = (arr) => {
  let duplicate = [];
  Object.keys(arr).forEach((value, index) => {
    let data = null;
    if (typeof arr[value] == "object" || typeof arr[value] == "string") {
      data = JSON.parse(arr[value]);
    }
    const found = data.filter((v, i) => data.indexOf(v) !== i);
    if (found.length > 0) {
      found.map((val) => duplicate.push(val));
    }
  });
  return duplicate;
};

const getDate = () => {
  return Date.now();
};

const removeDuplicateArr = (arr) => {
  return arr.filter((v, i) => arr.indexOf(v) === i);
};

const removeDuplicateObjInArr = (arr, keyCheck) => {
  let found = new Set();
  return arr.filter((el) => {
    const key = el[keyCheck];
    const exist = found.has(key);
    found.add(key);
    return !exist;
  });
};

const genObjectId = function (number) {
  var timestamp = (((new Date().getTime() + number) / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase()
  );
};

const removeSpace = (data) => {
  return data.toString().split(" ").join("");
};

const isInArray = (data, keyCheck) => {
  return data.filter((val, index) => data.indexOf(keyCheck) === index);
};

const isPhone = (phone) => {
  if (isEmpty(phone)) return false;
  return {
    la: (country_number = "20", limit = 10) => {
      const length = phone.split("");
      const start_number = phone.substring(0, 2);
      if (length.length == limit && start_number == country_number) return true;
      return false;
    },
  };
};

const isEmail = (email) => {
  if (isEmpty(email)) return false;
  const isAddress = email.split("@");
  const isCom = email.split(".com");
  if (isAddress.length == 1 || isCom.length == 1) return false;
  if (!isEmpty(isCom[isCom.length - 1])) return false;
  return true;
};

const isObject = (obj) => {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (Object.keys(obj).length === 0) return false;
  return true;
};

const date = {
  getTimeStamp: (plus = null) => {
    let time = new Date().getTime();
    if (plus !== null) time += plus;
    return time;
  },
  nowSec: () => {
    return parseInt(new Date().getTime() / 1000);
  },
  timeStampToSec: (timeTamp) => parseInt(timeTamp / 1000),
  dateToSec: (date) => {
    const dt = new Date(date);
    return parseInt(dt.getTime() / 1000);
  },
  getSecond: () => {
    const date = new Date();
    return date.getSeconds();
  },
  addTime: (value, method = "second") => {
    if (method == "second") {
      value = value * 1000;
    } else {
      value = value * 60000;
    }
    return new Date(new Date().getTime() + value);
  },
};

const generateOtp = ({ limit = 6, multiple = 10, digit = "0123456789" }) => {
  let opt = "";
  for (let i = 0; i < limit; i++) {
    opt += digit[Math.floor(Math.random() * multiple)];
  }
  return opt;
};

const isEnum = (enumArr, value) => {
  if (!isArray(enumArr)) {
    throw new Error("enum accept only array first param");
  }

  let foundEnum = enumArr.filter((e) => e === value);
  if (foundEnum.length < 1) return false;
  return true;
};

const isMimeType = (value, type = "video") => {
  let mime = value.toString().split("/");
  if (mime[0] !== type) return false;
  return true;
};

const isFileType = (mimeType, types) => {
  let mime = value.toString().split("/");
  if (!types.includes(mime[1])) return false;
  return true;
};

const isIn = (enumArr, value) => {
  if (!isArray(enumArr)) {
    throw new Error("enum accept only array first param");
  }

  let foundEnum = enumArr.filter((e) => e === value);
  if (foundEnum.length < 1) return false;
  return true;
};

module.exports = {
  isIn,
  sleep,
  isDuplicateArrayMany,
  getDate,
  removeDuplicateArr,
  removeDuplicateObjInArr,
  genObjectId,
  removeSpace,
  isInArray,
  isEmptyObj,
  isValidObj,
  isBoolean,
  isString,
  isEmpty,
  isArray,
  isDate,
  isFile,
  getTimeFromDate,
  compareBtwDate,
  isPhone,
  isEmail,
  isObject,
  date,
  generateOtp,
  isEnum,
  isMimeType,
  isFileType,
  isObjectId,
  encrypt,
  decrypt,
};
