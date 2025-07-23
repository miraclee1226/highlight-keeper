import { Component } from "../base-component.js";

export class DomainCard extends Component {
  setup() {
    this.data = this.props;
    this.isResult =
      (this.data.href && !this.data.pageCount) ||
      (this.data.text && !this.data.siteName);
  }

  template() {
    const { favicon, siteName, domain, pageCount, href, text } = this.data;

    return `
      <div class="domain-item">
        <img src="${favicon}" class="domain-item__favicon" alt="${siteName}" />
        <div class="domain-item__info">
          <div class="domain-item__title">${
            this.isResult ? text : siteName
          }</div>
          <div class="domain-item__url">${this.isResult ? href : domain}</div>
        </div>
        ${
          this.isResult
            ? ""
            : `<div class="domain-item__count">${pageCount}</div>`
        }
      </div>
    `;
  }
}
