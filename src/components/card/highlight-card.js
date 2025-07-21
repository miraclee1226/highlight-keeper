import { Component } from "../base-component.js";
import { escapeHtml, formatDate } from "../../side-panel/utils/formatter.js";

export class HighlightCard extends Component {
  setup() {
    this.highlight = this.props.highlight;
  }

  template() {
    const { createdAt, selection, color, note } = this.highlight;
    const formattedDate = formatDate(new Date(createdAt));

    return `
      <div class="highlight-item" data-id="${this.highlight.uuid}">
        <span class="card__meta-data">${formattedDate}</span>
        <div class="card__content">
          <div class="card__dot" style="background-color: ${color}"></div>
          <p class="card__text">${escapeHtml(selection.text)}</p>
        </div>
        ${this.createNoteHtml(note)}
      </div>
    `;
  }

  createNoteHtml(note) {
    if (!note || !note.trim()) return "";

    return `
      <div class="card__note">
        <div class="card__note-marker"></div>
        <p class="card__note-text">${escapeHtml(note)}</p>
      </div>
    `;
  }
}
