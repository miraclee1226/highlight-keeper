import { STORE_NAMES } from "../constant/database.js";
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

export function getHighlightByUuid(uuid) {
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

export function getHighlightsByHref(href) {
  const db = getDB();
  if (!db) {
    return Promise.reject(new Error("Database not initialized"));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORE_NAMES.HREF_INDEX, STORE_NAMES.HIGHLIGHTS],
      "readonly"
    );
    const hrefIndexStore = transaction.objectStore(STORE_NAMES.HREF_INDEX);
    const hrefRequest = hrefIndexStore.get(href);

    hrefRequest.onsuccess = function () {
      const hrefIndex = hrefRequest.result;

      if (!hrefIndex) {
        console.log(`No highlights found for href: ${href}`);
        resolve([]);
        return;
      }

      const highlightsStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
      const promises = hrefIndex.highlightUuids.map((uuid) => {
        return new Promise((resolve) => {
          const highlightRequest = highlightsStore.get(uuid);

          highlightRequest.onsuccess = () => {
            resolve(highlightRequest.result);
          };

          highlightRequest.onerror = () => {
            resolve(null);
          };
        });
      });

      Promise.all(promises)
        .then((results) => {
          const highlights = results.filter((h) => h !== null);
          highlights.sort((a, b) => a.createdAt - b.createdAt);
          resolve(highlights);
        })
        .catch((error) => {
          console.error("Error in Promise.all:", error);
          reject(new Error("Failed to retrieve highlights: " + error.message));
        });
    };

    hrefRequest.onerror = function () {
      console.error("Error retrieving highlights by href: ", hrefRequest.error);
      reject(new Error("Failed to retrieve highlights: " + hrefRequest.error));
    };

    transaction.onerror = function (event) {
      console.error("Get transaction error: ", event.target.error);
      reject(new Error("Failed to retrieve highlights: " + event.target.error));
    };
  });
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
    const transaction = db.transaction(
      [STORE_NAMES.HIGHLIGHTS, STORE_NAMES.HREF_INDEX],
      "readwrite"
    );
    const objectStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
    const request = objectStore.add(highlight);

    request.onsuccess = function () {
      console.log("Highlight created successfully: ", highlight.uuid);
      updateHrefIndex(transaction, highlight.href, highlight.uuid);
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
        updatedAt: Date.now(),
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
          [STORE_NAMES.HIGHLIGHTS, STORE_NAMES.HREF_INDEX],
          "readwrite"
        );
        const highlightStore = transaction.objectStore(STORE_NAMES.HIGHLIGHTS);
        const deleteRequest = highlightStore.delete(uuid);

        deleteRequest.onsuccess = function () {
          console.log(`Highlight ${uuid} deleted successfully`);
          updateHrefIndexForDeletion(transaction, highlight.href, uuid);
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

function updateHrefIndex(transaction, href, uuid) {
  const objectStore = transaction.objectStore(STORE_NAMES.HREF_INDEX);
  const request = objectStore.get(href);

  request.onsuccess = function () {
    let hrefIndex = request.result;

    if (!hrefIndex) {
      hrefIndex = {
        href,
        highlightUuids: [uuid],
      };
    } else {
      if (!hrefIndex.highlightUuids.includes(uuid)) {
        hrefIndex.highlightUuids.push(uuid);
      }
    }

    const updateRequest = objectStore.put(hrefIndex);

    updateRequest.onsuccess = function () {
      console.log(`Updated URL index for ${href} with UUID ${uuid}`);
    };

    updateRequest.onerror = function () {
      console.error("Error updating URL index: ", updateRequest.error);
    };
  };

  request.onerror = function () {
    console.error("Error retrieving URL index: ", request.error);
  };
}

function updateHrefIndexForDeletion(transaction, href, uuid) {
  const hrefIndexStore = transaction.objectStore(STORE_NAMES.HREF_INDEX);
  const request = hrefIndexStore.get(href);

  request.onsuccess = function () {
    const hrefIndex = request.result;

    if (!hrefIndex || !hrefIndex.highlightUuids) {
      console.log(`No href index found for ${href}`);
      return;
    }

    const updatedUuids = hrefIndex.highlightUuids.filter((id) => id !== uuid);

    if (updatedUuids.length === 0) {
      const deleteIndexRequest = hrefIndexStore.delete(href);

      deleteIndexRequest.onsuccess = function () {
        console.log(`Deleted URL index for ${href} (no more highlights)`);
      };

      deleteIndexRequest.onerror = function () {
        console.error("Error deleting URL index: ", deleteIndexRequest.error);
      };
    } else {
      hrefIndex.highlightUuids = updatedUuids;

      const updateRequest = hrefIndexStore.put(hrefIndex);

      updateRequest.onsuccess = function () {
        console.log(`Updated URL index for ${href}, removed UUID ${uuid}`);
      };

      updateRequest.onerror = function () {
        console.error(
          "Error updating URL index for deletion: ",
          updateRequest.error
        );
      };
    }
  };

  request.onerror = function () {
    console.error("Error retrieving URL index for deletion: ", request.error);
  };
}
