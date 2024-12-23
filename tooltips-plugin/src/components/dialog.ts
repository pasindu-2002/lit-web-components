import { LitElement,html } from "lit";
import { property } from "lit/decorators.js";

export class Dialog extends LitElement {
    @property({type: Boolean}) 
    open = true;

    renderDialog(): unknown {
        return html``;
    }

    render() {
        return html`
            <div class="dialog">
                ${this.open ? this.renderDialog() : ''}
            </div>
        `;
    }
}
