/*
 * [IMPORTANT!] Need set IP whitelist
 * Go to https://vip-reseller.co.id
 * Select 'Profile' section
 * Select 'Pengaturan API'
 * Scroll down and search for field box named 'Whitelist IP'
 * Paste the following IP list: '23.88.127.147,167.235.229.138,128.140.90.27,188.245.50.109,159.69.181.201' (without '')
 */

const PREFIX = "VIPaymentLibs";
const API_URL = "https://vip-reseller.co.id/api/";

const types = {
  createOrder: "order",
  getStatus: "status",
  getServices: "services",
};

/*
 * @param {string} path - Path name
 * @param {object} additionalMethods - Additional methods
 * @returns {object}
 */
const createSection = (path, additionalMethods = {}) => {
  const methods = {};
  for (const [method, type] of Object.entries(types)) {
    methods[method] = function(options) {
      options.path = path;
      options.body = options.body || {};
      options.body.type = type;
      apiCall({ ...options });
    };
  }
  return { /* path, */ ...methods, ...additionalMethods };
};

/*
 * @see - https://vip-reseller.co.id/page/api/prepaid
 */
const Prepaid = createSection("prepaid");

/*
 * @see - https://vip-reseller.co.id/page/api/social-media
 */
const SocialMedia = createSection("social-media");

/*
 * @see - https://vip-reseller.co.id/page/api/profile
 */
const Profile = createSection("profile", {
  /*
   * @param {object} options
   */
  getProfile: function(options) {
    options.path = "profile";
    apiCall({ ...options });
  }
});

/*
 * @see - https://vip-reseller.co.id/page/api/postpaid
 */
const Postpaid = createSection("postpaid", {
  /*
   * @param {object} options
   */
  checkPostpaid: function(options) {
    options.path = "postpaid";
    options.body = options.body || {};
    options.body.type = "inq-pasca";
    apiCall({ ...options });
  },
  
  /*
   * @param {object} options
   */
  createOrder: function(options) {
    options.path = "postpaid";
    options.body = options.body || {};
    options.body.type = "pay-pasca";
    apiCall({ ...options });
  }
});

/*
 * @see - https://vip-reseller.co.id/page/api/game-feature
 */
const GameFeature = createSection("game-feature", {
  /*
   * @param {object} options
   */
  fetchNickname: function(options) {
    options.path = "game-feature";
    options.body = options.body || {};
    options.body.type = "get-nickname";
    apiCall({ ...options });
  },
  
  // Game list supported by VIPayment
  GameList: [
    {
      mlbb: "mobile-legends",
      hago: "hago",
      zepeto: "zepeto",
      lordsmobile: "lords-mobile",
      marvelsuperwar: "marvel-super-war",
      ragnarokm: "ragnarok-m-eternal-love-big-cat-coin",
      speeddrifters: "speed-drifters",
      laplacem: "laplace-m",
      valorant: "valorant",
      higghsdomino: "higgs-domino",
      pb: "point-blank",
      dragonraja: "dragon-raja",
      lol: "league-of-legends-wild-rift",
      ff: "free-fire",
      ffmax: "free-fire-max",
      tnj: "tom-and-jerry-chase",
      cocofun: "cocofun",
      eightballpool: "8-ball-pool",
      autochess: "auto-chess",
      bulletangel: "bullet-angel",
      aov: "arena-of-valor",
      codm: "call-of-duty-mobile",
      genshinimpact: {
        name: "genshin-impact",
        server: {
          asia: "os_asia",
          usa: "os_usa",
          euro: "os_euro",
          china: "os_cht" // China, Hongkong, Taiwan
        }
      },
      indoplay: "indoplay",
      dominogapleboyaa: "domino-gaple-qiuqiu-boyaa"
    }
  ]
});

/*
 * @param {object} obj - Objects to convert
 * @returns {string}
 */
function encodeParams(obj) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

/* 
 * @param {string|number|any} input - Any input type to be hashed
 * @returns {string}
 */
function md5(input) {
  return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
}

/*
 * Get your API ID & API key: https://vip-reseller.co.id/account/profile
 * @returns {string}
 */
function getApiId() {
  return Bot.getProp(`${PREFIX}_ApiId`, null);
}

/*
 * Get your API ID & API key: https://vip-reseller.co.id/account/profile
 * @returns {string}
 */
function getApiKey() {
  return Bot.getProp(`${PREFIX}_ApiKey`, null);
}

/*
 * Get your API ID & API key: https://vip-reseller.co.id/account/profile
 * @param {string} apiId - VIPayment API ID
 * @returns {void}
 */
function setApiId(apiId) {
  // Saving API ID
  Bot.setProp(`${PREFIX}_ApiId`, apiId, "string");
}

/*
 * Get your API ID & API key: https://vip-reseller.co.id/account/profile
 * @param {string} apiKey - VIPayment API key
 * @returns {void}
 */
function setApiKey(apiKey) {
  // Saving API key
  Bot.setProp(`${PREFIX}_ApiKey`, apiKey);
}

/*
 * @param {object} options
 * @param {string} options.path - Path of API (can be profile, prepaid, postpaid, social-media or game-feature)
 * @param {object} options.body - Body of the request
 * @param {string} options.success - Callback command for handling responses
 * @returns {void}
 */
function apiCall(options) {
  // Set headers for this request
  const headers = {
    "cache-control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json;charset=utf-8"
  };

  const params = {
    headers,
    url: `${API_URL}${options.path}`,
    body: encodeParams({
      key: getApiKey(),
      sign: md5(getApiId() + getApiKey()),
      ...options.body // Merge body
    }),
    // background: true, // It is not necessary, but do not erase!
    success: `${PREFIX}onResponse ${options.success}`, // Callback command
    error: `${PREFIX}onError` // It is not necessary too, but you can customize it if you want
  };

  // Send request
  HTTP.post(params);
}

function onResponse() {
  // Handling responses in the next command
  Bot.runCommand(params, JSON.parse(content));
}

function onError() {
  throw content;
}

publish({
  getApiId,
  getApiKey,

  setApiId,
  setApiKey,

  apiCall,
  Profile,
  Prepaid,
  Postpaid,
  SocialMedia,
  GameFeature
});

// Listener
on(`${PREFIX}onResponse`, onResponse);
on(`${PREFIX}onError`, onError);