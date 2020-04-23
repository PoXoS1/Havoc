// TODO: Move random strings here

export enum STATUS_ICONS {
  READY = 'https://www.dictionary.com/e/wp-content/uploads/2016/01/paris-green-color-paint-code-swatch-chart-rgb-html-hex.png',
  DISCONNECTED = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Red.svg/240px-Red.svg.png',
  ERROR = 'https://www.publicdomainpictures.net/pictures/30000/velka/dark-red-background.jpg',
  RECONNECTING = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/ICS_Quebec.svg/1200px-ICS_Quebec.svg.png',
  RESUMED = 'https://www.tileflair.co.uk/images/sized/images/products/carnaby-yellow/101115/Carnaby-Yellow-180x120mm-RTCRY6_d1974737e8129c7bb88892b7409c39bb.jpg'
}

export enum MAX_LIMITS {
  JSON_EMBED = 2036,
  POLL_OPTIONS = 10,
  EMOJI_NAME = 32,
  EMOJI_SIZE = 256,
  DELETE_ROLE_EMBED = 1700,
  PLAY_URL = 32,
  EMBED_DESCRIPTION = 2048
}

export enum MIN_LIMITS {
  EMOJI_NAME = 2,
  LOGS_CONFIG_OPTION = 0,
  MESSAGE_DELETE_CONTENT = 1800,
  MESSAGE_UPDATE_CONTENT = 900
}

export const SECONDS = (seconds: number) => seconds * 1000;
export const MINUTES = (minutes: number) => minutes * 60000;
export const HOURS = (hours: number) => hours * 3600000;
export const DAYS = (days: number) => days * 86400000;
export const WEEKS = (weeks: number) => weeks * 604800000;

export const MEGABYTES = (bytes: number) => bytes / 1048576;

export const PERCENTAGE = (from: number, base: number) => (from / base) * 100;