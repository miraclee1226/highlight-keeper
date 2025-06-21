import { DB_NAME, DB_VERSION, STORE_NAMES } from "../constant/database.js";

let db = null;
let dbInitPromise = null;

export function initDB() {
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function () {
      db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAMES.HIGHLIGHTS)) {
        db.createObjectStore(STORE_NAMES.HIGHLIGHTS, {
          keyPath: "uuid",
        });
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.HREF_INDEX)) {
        db.createObjectStore(STORE_NAMES.HREF_INDEX, {
          keyPath: "href",
        });
      }

      db.onversionchange = function () {
        db.close();
        console.warn("Database is outdated, please reload the extension.");
      };
    };

    request.onsuccess = function () {
      console.log("DB opened successfully");
      db = request.result;

      db.onversionchange = function () {
        db.close();
        db = null;
        dbInitPromise = null;
      };

      resolve(db);
    };

    request.onerror = function () {
      console.error("Error opening DB: ", request.error);
      dbInitPromise = null;
      reject(request.error);
    };
  });

  return dbInitPromise;
}

export function getDB() {
  return db;
}
