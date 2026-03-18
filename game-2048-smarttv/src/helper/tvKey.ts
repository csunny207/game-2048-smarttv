import { PLATFORM } from "../constants/appConstant";

let tvKey = {};

export const platformTvKeysMeth: any = () => {
  switch (PLATFORM?.toLowerCase()) {
    case "lg":
      tvKey = {
        KEY_RETURN: 461,
        KEY_EXIT: 27,
        KEY_UP: 38,
        KEY_DOWN: 40,
        KEY_LEFT: 37,
        KEY_RIGHT: 39,
        KEY_ENTER: 13,
        KEY_BACK: 8,
      };
      break;
    case "samsung":
      tvKey = {
        KEY_BACK: 8,
        KEY_RETURN: 10009,
        KEY_UP: 38,
        KEY_DOWN: 40,
        KEY_LEFT: 37,
        KEY_RIGHT: 39,
        KEY_ENTER: 13,
      };
      break;
    default:
      tvKey = {
        KEY_RETURN: 8,
        KEY_EXIT: 27,
        KEY_UP: 38,
        KEY_DOWN: 40,
        KEY_LEFT: 37,
        KEY_RIGHT: 39,
        KEY_ENTER: 13,
      };
  }
  return tvKey;
};
