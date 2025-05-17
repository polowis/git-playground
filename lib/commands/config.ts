import { removeQuoteWrap } from "../strings";

export async function setGitConfig(
  isGlobal: boolean,
  key: string,
  value: string
) {
  value = removeQuoteWrap(value);
  try {
    if (isGlobal) {
      localStorage.setItem(`global.${key}`, value);
      return `Successfully set global config: ${key} = ${value}`;
    } else {
      localStorage.setItem(key, value);
      return `Successfully set config: ${key} = ${value}`;
    }
  } catch (error) {
    console.error("Error setting Git config:", error);
    return `Error setting config for ${key}: ${error}`;
  }
}
