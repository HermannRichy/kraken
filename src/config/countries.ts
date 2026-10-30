import type { CountryCode } from "libphonenumber-js";

import { COUNTRY_DATA } from "./countries-data";

/** Pays mis en avant en tête de liste (public principal du défi). */
const FEATURED = ["BJ", "TG", "CI", "SN", "BF", "ML", "NE", "CM", "GA", "CG", "CD", "GN", "NG", "GH", "FR"];

export type Country = { code: CountryCode; name: string; dial: string; flag: string };

const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const all: Country[] = COUNTRY_DATA.map(([code, name, dial]) => ({ code: code as CountryCode, name, dial, flag: flag(code) }));
const byCode = new Map(all.map((c) => [c.code as string, c]));

export const FEATURED_COUNTRIES = FEATURED.map((c) => byCode.get(c)).filter(Boolean) as Country[];
export const OTHER_COUNTRIES = all.filter((c) => !FEATURED.includes(c.code));
export const COUNTRIES = all;

export const countryName = (code: string) => byCode.get(code)?.name ?? code;
