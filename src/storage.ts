import { openDB, type DBSchema } from "idb";
import type { DailyFocusData } from "./types";

const DATABASE_NAME = "todays-focus-db";
const DATABASE_VERSION = 1;
const STORE_NAME = "dailyFocus";

interface FocusDatabase extends DBSchema {
  dailyFocus: {
    key: string;
    value: DailyFocusData;
  };
}

const databasePromise = openDB<FocusDatabase>(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: "dateKey" });
    }
  },
});

export async function getDailyFocus(dateKey: string) {
  const database = await databasePromise;
  return database.get(STORE_NAME, dateKey);
}

export async function saveDailyFocus(record: DailyFocusData) {
  const database = await databasePromise;
  await database.put(STORE_NAME, record);
}
