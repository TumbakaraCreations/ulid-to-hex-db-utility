const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const DEC = new Uint8Array(128).fill(255);
for (let i = 0; i < CROCKFORD.length; i++) {
  DEC[CROCKFORD.charCodeAt(i)] = i;
  const lc = CROCKFORD[i].toLowerCase();
  if (lc !== CROCKFORD[i]) DEC[lc.charCodeAt(0)] = i;
}

function bytesToBase32(b: Uint8Array): string {
  const v = new Uint8Array(26);
  v[0] = b[0] >> 5;
  v[1] = b[0] & 0x1f;
  v[2] = b[1] >> 3;
  v[3] = ((b[1] & 0x07) << 2) | (b[2] >> 6);
  v[4] = (b[2] >> 1) & 0x1f;
  v[5] = ((b[2] & 0x01) << 4) | (b[3] >> 4);
  v[6] = ((b[3] & 0x0f) << 1) | (b[4] >> 7);
  v[7] = (b[4] >> 2) & 0x1f;
  v[8] = ((b[4] & 0x03) << 3) | (b[5] >> 5);
  v[9] = b[5] & 0x1f;
  v[10] = b[6] >> 3;
  v[11] = ((b[6] & 0x07) << 2) | (b[7] >> 6);
  v[12] = (b[7] >> 1) & 0x1f;
  v[13] = ((b[7] & 0x01) << 4) | (b[8] >> 4);
  v[14] = ((b[8] & 0x0f) << 1) | (b[9] >> 7);
  v[15] = (b[9] >> 2) & 0x1f;
  v[16] = ((b[9] & 0x03) << 3) | (b[10] >> 5);
  v[17] = b[10] & 0x1f;
  v[18] = b[11] >> 3;
  v[19] = ((b[11] & 0x07) << 2) | (b[12] >> 6);
  v[20] = (b[12] >> 1) & 0x1f;
  v[21] = ((b[12] & 0x01) << 4) | (b[13] >> 4);
  v[22] = ((b[13] & 0x0f) << 1) | (b[14] >> 7);
  v[23] = (b[14] >> 2) & 0x1f;
  v[24] = ((b[14] & 0x03) << 3) | (b[15] >> 5);
  v[25] = b[15] & 0x1f;

  let out = "";
  for (let i = 0; i < 26; i++) out += CROCKFORD[v[i]!];
  return out;
}

function parseHex(hex: string): Uint8Array {
  let s = hex.trim();
  if (s.startsWith("0x") || s.startsWith("0X")) s = s.slice(2);
  s = s.replace(/\s+/g, "");
  if (s.length !== 32) throw new Error(`Expected 32 hex characters, got ${s.length}`);
  if (!/^[0-9a-fA-F]+$/.test(s)) throw new Error("Invalid hex character");

  const b = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    b[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  }
  return b;
}

export function ulidToHex(ulid: string): string {
  if (typeof ulid !== "string") throw new Error("Input must be a string");

  const s = ulid.trim().toUpperCase();
  if (s.length !== 26) throw new Error(`Expected 26 characters, got ${s.length}`);

  const v = new Uint8Array(26);
  for (let i = 0; i < 26; i++) {
    const code = s.charCodeAt(i);
    if (code > 127) throw new Error(`Invalid character at position ${i}: '${s[i]}'`);
    const d = DEC[code];
    if (d === 255)
      throw new Error(`Invalid Crockford Base32 character at position ${i}: '${s[i]}'`);
    v[i] = d;
  }

  const b = new Uint8Array(16);
  b[0]  = (v[0]  << 5) | v[1];
  b[1]  = (v[2]  << 3) | (v[3]  >> 2);
  b[2]  = ((v[3]  & 0x03) << 6) | (v[4]  << 1) | (v[5]  >> 4);
  b[3]  = ((v[5]  & 0x0f) << 4) | (v[6]  >> 1);
  b[4]  = ((v[6]  & 0x01) << 7) | (v[7]  << 2) | (v[8]  >> 3);
  b[5]  = ((v[8]  & 0x07) << 5) | v[9];
  b[6]  = (v[10] << 3) | (v[11] >> 2);
  b[7]  = ((v[11] & 0x03) << 6) | (v[12] << 1) | (v[13] >> 4);
  b[8]  = ((v[13] & 0x0f) << 4) | (v[14] >> 1);
  b[9]  = ((v[14] & 0x01) << 7) | (v[15] << 2) | (v[16] >> 3);
  b[10] = ((v[16] & 0x07) << 5) | v[17];
  b[11] = (v[18] << 3) | (v[19] >> 2);
  b[12] = ((v[19] & 0x03) << 6) | (v[20] << 1) | (v[21] >> 4);
  b[13] = ((v[21] & 0x0f) << 4) | (v[22] >> 1);
  b[14] = ((v[22] & 0x01) << 7) | (v[23] << 2) | (v[24] >> 3);
  b[15] = ((v[24] & 0x07) << 5) | v[25];

  return Array.from(b, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function hexToUlid(hex: string): string {
  if (typeof hex !== "string") throw new Error("Input must be a string");
  return bytesToBase32(parseHex(hex));
}

export interface SqlQuery {
  label: string;
  dialect: string;
  sql: string;
  copyText: string;
}

export interface UlidToHexResult {
  hex: string;
  queries: SqlQuery[];
}

export interface HexToUlidResult {
  ulid: string;
  queries: SqlQuery[];
}

export function buildUlidToHexResult(hex: string): UlidToHexResult {
  const hexLower = hex.toLowerCase();
  return {
    hex,
    queries: [
      {
        label: "MySQL · MariaDB",
        dialect: "UNHEX()",
        sql: `SELECT *\nFROM your_table\nWHERE id = UNHEX('${hex}');`,
        copyText: `SELECT * FROM your_table WHERE id = UNHEX('${hex}');`,
      },
      {
        label: "MySQL · MariaDB",
        dialect: "hex literal",
        sql: `SELECT *\nFROM your_table\nWHERE id = 0x${hex};`,
        copyText: `SELECT * FROM your_table WHERE id = 0x${hex};`,
      },
      {
        label: "PostgreSQL",
        dialect: "decode()",
        sql: `SELECT *\nFROM your_table\nWHERE id = decode('${hexLower}', 'hex');`,
        copyText: `SELECT * FROM your_table WHERE id = decode('${hexLower}', 'hex');`,
      },
    ],
  };
}

export function buildHexToUlidResult(hex: string, ulid: string): HexToUlidResult {
  const hexUpper = hex.replace(/\s+/g, "").replace(/^0x/i, "").toUpperCase();
  const hexLower = hexUpper.toLowerCase();
  return {
    ulid,
    queries: [
      {
        label: "MySQL · MariaDB",
        dialect: "HEX()",
        sql: `SELECT *\nFROM your_table\nWHERE HEX(id) = '${hexUpper}';`,
        copyText: `SELECT * FROM your_table WHERE HEX(id) = '${hexUpper}';`,
      },
      {
        label: "MySQL · MariaDB",
        dialect: "UNHEX()",
        sql: `SELECT *\nFROM your_table\nWHERE id = UNHEX('${hexUpper}');`,
        copyText: `SELECT * FROM your_table WHERE id = UNHEX('${hexUpper}');`,
      },
      {
        label: "PostgreSQL",
        dialect: "encode()",
        sql: `SELECT *\nFROM your_table\nWHERE encode(id, 'hex') = '${hexLower}';`,
        copyText: `SELECT * FROM your_table WHERE encode(id, 'hex') = '${hexLower}';`,
      },
    ],
  };
}
