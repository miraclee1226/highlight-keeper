import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { ModalManager } from "../../components/modal/modal-manager.js";
import { App } from "../ui/app.js";

export function handleHighlightUpdate(request, url) {
  const appInstance = App.getInstance();

  if (!appInstance) return;

  const currentPageInstance = appInstance.getCurrentPageInstance();
  const allPagesInstance = appInstance.getAllPagesInstance();

  const modalManager = ModalManager.getInstance();
  const domainModalInstance = modalManager.getModalByType("DomainModal");
  const pageModalInstance = modalManager.getModalByType("PageHighlightsModal");

  switch (request.action) {
    case "highlight_created":
      handleHighlightCreated(request, url, {
        currentPageInstance,
        allPagesInstance,
        domainModalInstance,
        pageModalInstance,
      });
      break;

    case "highlight_updated":
      handleHighlightUpdated(request, {
        currentPageInstance,
        allPagesInstance,
        domainModalInstance,
        pageModalInstance,
      });
      break;

    case "highlight_deleted":
      handleHighlightDeleted(request, {
        currentPageInstance,
        allPagesInstance,
        domainModalInstance,
        pageModalInstance,
      });
      break;
  }
}

async function handleHighlightCreated(request, url, instances) {
  const {
    currentPageInstance,
    allPagesInstance,
    domainModalInstance,
    pageModalInstance,
  } = instances;

  if (currentPageInstance && url === request.data.href) {
    currentPageInstance.addHighlight(request.data);
  }

  if (allPagesInstance) {
    try {
      const dominDetails = await getDomainDetails();
      allPagesInstance.updateDomainsData(dominDetails);
    } catch (error) {
      console.error("All pages update failed:", error);
    }
  }

  if (
    domainModalInstance &&
    domainModalInstance.isHighlightBelongsToThisDomain(request.data)
  ) {
    await domainModalInstance.refreshDomainModalData();
  }

  if (
    pageModalInstance &&
    pageModalInstance.isChangeRelevantToThisPage(request)
  ) {
    await pageModalInstance.refreshPageModalData();
  }
}

async function handleHighlightUpdated(request, instances) {
  const { currentPageInstance, domainModalInstance, pageModalInstance } =
    instances;

  if (currentPageInstance) {
    currentPageInstance.updateHighlight(request.data);
  }

  if (
    domainModalInstance &&
    domainModalInstance.isHighlightInThisDomain(request.data.uuid)
  ) {
    await domainModalInstance.refreshDomainModalData();
  }

  if (
    pageModalInstance &&
    pageModalInstance.isChangeRelevantToThisPage(request)
  ) {
    await pageModalInstance.refreshPageModalData();
  }
}

async function handleHighlightDeleted(request, instances) {
  const {
    currentPageInstance,
    allPagesInstance,
    domainModalInstance,
    pageModalInstance,
  } = instances;

  if (currentPageInstance) {
    currentPageInstance.removeHighlight(request.data.uuid);
  }

  if (allPagesInstance) {
    try {
      const dominDetails = await getDomainDetails();
      allPagesInstance.updateDomainsData(dominDetails);
    } catch (error) {
      console.error("All pages update failed:", error);
    }
  }

  if (
    domainModalInstance &&
    domainModalInstance.isHighlightInThisDomain(request.data.uuid)
  ) {
    await domainModalInstance.refreshDomainModalData();
  }

  if (
    pageModalInstance &&
    pageModalInstance.isChangeRelevantToThisPage(request)
  ) {
    await pageModalInstance.refreshPageModalData();
  }
}
