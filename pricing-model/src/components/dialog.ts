import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";


export class Dialog extends LitElement {

    @property({type: Boolean})
    show = true;

    renderDialog():unknown{
        return html ``;
    }

    render(){
        return html `
            <div class ="dialog" style = "display:${this.show ? 'block' : 'none'};">
                ${this.renderDialog()}
            </div>
        `;
    }
   
}