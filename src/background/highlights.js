import { STORE_NAMES } from "../constant/index.js";
import { getDB } from "./db-connection.js";

export function getAllHighlights() {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAMES.HIGHLIGHTS], "readonly");
    const objectStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
    const request = objectStore.getAll();

    request.onsuccess = function () {
      console.log(`Found ${request.result.length} total highlights`);
    };

    request.onerror = function () {
      console.error("Error retrieving all highlights: ", request.error);
    };

    transaction.oncomplete = function () {
      console.log("Get all transaction complete");
      resolve(request.result);
    };

    transaction.onerror = function (event) {
      console.error("Get all transaction error:", event.target.error);
      reject(
        new Error("Failed to retrieve all highlights: " + event.target.error)
      );
    };
  });
}

export function getHighlightsByHref(href) {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAMES.HIGHLIGHTS], "readonly");
    const objectStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
    const hrefIndex = objectStore.index("href");

    const request = hrefIndex.openCursor(IDBKeyRange.only(href));
    const highlights = [];

    request.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        highlights.push(cursor.value);
        cursor.continue();
      } else {
        highlights.sort((a, b) => a.createdAt - b.createdAt);
        resolve(highlights);
      }
    };

    request.onerror = function () {
      console.error("Error retrieving highlights by href: ", request.error);
      reject(new Error("Failed to retrieve highlights: " + request.error));
    };

    transaction.onerror = function (event) {
      console.error("Get transaction error: ", event.target.error);
      reject(new Error("Failed to retrieve highlights: " + event.target.error));
    };
  });
}

function getHighlightByUuid(uuid) {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAMES.HIGHLIGHTS], "readonly");
    const objectStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
    const request = objectStore.get(uuid);

    request.onsuccess = function () {
      console.log("Found highlight with UUID: ", uuid);
    };

    request.onerror = function () {
      console.error("Error retrieving highlight by UUID: ", request.error);
    };

    transaction.oncomplete = function () {
      console.log("Get transaction complete");
      resolve(request.result);
    };

    transaction.onerror = function (event) {
      console.error("Get transaction error: ", event.target.error);
      reject(new Error("Failed to retrieve highlight: " + event.target.error));
    };
  });
}

export async function getDomainDetails() {
  const highlights = await getAllHighlights();
  const domainGroups = {};

  highlights.forEach((highlight) => {
    const domain = highlight.domain;
    if (!domainGroups[domain]) {
      domainGroups[domain] = {
        domain,
        siteName: highlight.siteName,
        favicon: highlight.favicon,
        pageCount: 0,
        pages: {},
      };
    }

    const href = highlight.href;
    if (!domainGroups[domain].pages[href]) {
      domainGroups[domain].pages[href] = {
        href,
        pageTitle: highlight.pageTitle,
        highlightCount: 0,
        highlights: [],
      };
      domainGroups[domain].pageCount++;
    }

    domainGroups[domain].pages[href].highlights.push({
      uuid: highlight.uuid,
      text: highlight.selection.text,
      note: highlight.note,
      color: highlight.color,
      createdAt: highlight.createdAt,
      updatedAt: highlight.updatedAt,
    });
    domainGroups[domain].pages[href].highlightCount++;
  });

  return Object.values(domainGroups).map((domain) => ({
    ...domain,
    pages: Object.values(domain.pages),
  }));
}

export function createHighlight(highlight) {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  if (!highlight.uuid || !highlight.href) {
    return Promise.reject(new Error("Missing required fields: uuid or href"));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAMES.HIGHLIGHTS], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
    const request = objectStore.add(highlight);

    request.onsuccess = function () {
      console.log("Highlight created successfully: ", highlight.uuid);
    };

    request.onerror = function () {
      console.error("Error creating highlight: ", request.error);

      if (request.error.name === "ConstraintError") {
        reject(
          new Error(`Highlight with UUID ${highlight.uuid} already exists`)
        );
      } else {
        reject(new Error("Failed to create highlight: " + request.error));
      }
    };

    transaction.oncomplete = function () {
      console.log("Create transaction complete:", highlight.uuid);
      resolve(highlight);
    };

    transaction.onerror = function (event) {
      console.error("Create transaction error: ", event.target.error);
      reject(new Error("Failed to create highlight: " + event.target.error));
    };
  });
}

export function updateHighlight(uuid, updateData) {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  return getHighlightByUuid(uuid)
    .then((existingHighlight) => {
      if (!existingHighlight) {
        throw new Error(`Highlight with UUID ${uuid} not found`);
      }

      const updatedHighlight = {
        ...existingHighlight,
        ...updateData,
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [STORE_NAMES.HIGHLIGHTS],
          "readwrite"
        );
        const highlightStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
        const updateRequest = highlightStore.put(updatedHighlight);

        updateRequest.onsuccess = function () {
          console.log(`Highlight ${uuid} updated successfully`);
        };

        updateRequest.onerror = function () {
          console.error("Error updating highlight: ", updateRequest.error);
        };

        transaction.oncomplete = function () {
          console.log("Update transaction complete");
          resolve(updatedHighlight);
        };

        transaction.onerror = function (event) {
          console.error("Update transaction error:", event.target.error);
          reject(
            new Error("Failed to update highlight: " + event.target.error)
          );
        };
      });
    })
    .catch((error) => {
      console.error("Error in updateHighlight: ", error);
      throw new Error("Failed to update highlight: " + error.message);
    });
}

export function deleteHighlight(uuid) {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  return getHighlightByUuid(uuid)
    .then((highlight) => {
      if (!highlight) {
        console.log(`Highlight with UUID ${uuid} not found`);
        return Promise.resolve(false);
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [STORE_NAMES.HIGHLIGHTS],
          "readwrite"
        );
        const highlightStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
        const deleteRequest = highlightStore.delete(uuid);

        deleteRequest.onsuccess = function () {
          console.log(`Highlight ${uuid} deleted successfully`);
        };

        deleteRequest.onerror = function () {
          console.error("Error deleting highlight: ", deleteRequest.error);
        };

        transaction.oncomplete = function () {
          console.log("Delete transaction complete");
          resolve(true);
        };

        transaction.onerror = function (event) {
          console.error("Delete transaction error:", event.target.error);
          reject(
            new Error("Failed to delete highlight: " + event.target.error)
          );
        };
      });
    })
    .catch((error) => {
      console.error("Error in deleteHighlight: ", error);
      throw new Error("Failed to delete highlight: " + error.message);
    });
}
