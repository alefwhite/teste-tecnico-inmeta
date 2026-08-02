import { config } from "zod";
import { pt } from "zod/locales";

const { localeError } = pt();

config({ localeError });
