/** Runtime binding configuration. Localhost is the safe default; LAN access requires explicit HOST configuration.
 * Certification launches a private instance with HOST=127.0.0.1 and an ephemeral PORT.
 */
export function parseServerPort(input: string | undefined): number {
  if (input === undefined || input === '') return 3000;
  if (!/^[0-9]{1,5}$/.test(input)) throw new Error('PORT must be an integer from 1 to 65535');
  const port = Number(input);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535');
  }
  return port;
}
export function parseServerHost(input: string | undefined): string {
  if (input === undefined || input === '') return '127.0.0.1';
  if (input === '127.0.0.1' || input === '0.0.0.0' || input === '::1' || input === '::') return input;
  throw new Error('HOST must be 127.0.0.1, 0.0.0.0, ::1, or ::');
}
export const APP_HEALTH_IDENTITY = 'bsece-board-reviewer';
