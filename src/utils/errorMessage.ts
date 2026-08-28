const JAPANESE_CHAR_PATTERN = /[぀-ヿ㐀-䶿一-鿿]/;

/**
 * IPC経由のエラーはMain側で必ず日本語メッセージに変換して投げているため、
 * 日本語を含まないエラー（想定外のJSランタイムエラー等）はそのまま表示せず、
 * 呼び出し元が指定した日本語の汎用メッセージにフォールバックする。
 */
export function toDisplayErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && JAPANESE_CHAR_PATTERN.test(error.message)) {
    return error.message;
  }
  return fallbackMessage;
}
