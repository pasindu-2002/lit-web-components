import { html, LitElement } from "lit";
import { state } from "lit/decorators.js";

export class FastDialog extends LitElement {
  @state()
  protected openState = true;

  renderDialog(): unknown {
    return html``;
  }

  render() {
    return html` <div>${this.openState ? this.renderDialog() : ""}</div> `;
  }
}
