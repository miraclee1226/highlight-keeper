import { CurrentPage } from "../ui/current-page.js";
import { AllPages } from "../ui/all-pages.js";
import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { DomainModal } from "../../components/modal/domain-modal.js";
import { PageHighlightsModal } from "../../components/modal/page-highlights-modal.js";

export function handleHighlightUpdate(request, currentUrl) {
  const currentPageInstance = CurrentPage.getCurrentInstance();
  const allPagesInstance = AllPages.getCurrentInstance();
  const domainModalInstance = DomainModal.getCurrentInstance();
  const pageModalInstance = PageHighlightsModal.getCurrentInstance();

  switch (request.action) {
    case "highlight_created":
      handleHighlightCreated(request, currentUrl, {
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

async function handleHighlightCreated(request, currentUrl, instances) {
  const {
    currentPageInstance,
    allPagesInstance,
    domainModalInstance,
    pageModalInstance,
  } = instances;

  if (currentPageInstance && currentUrl === request.data.href) {
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
      const latestDomainDetails = await getDomainDetails();
      allPagesInstance.updateDomainsData(latestDomainDetails);
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
