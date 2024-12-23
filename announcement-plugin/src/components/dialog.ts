import {html, LitElement} from "lit";
import { property } from "lit/decorators.js";
import {cache} from 'lit/directives/cache.js';

export class Dialog extends LitElement {
    @property({ type: Boolean }) 
    show = true;

    renderDialog() : unknown{
        return html``; 
    }

    render() {
        return html`
            <div class="dialog-container" style="display: ${this.show ? 'block' : 'none'}">
                ${cache(this.renderDialog())}
            </div>
        `;
    }
}