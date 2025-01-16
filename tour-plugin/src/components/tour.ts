import { customElement, property } from "lit-element/decorators.js";
import { FastDialog } from "./FastDialog";
import { html, css } from "lit";

@customElement("pl-tour")
export class Tour extends FastDialog {
  @property({ type: Object })
  tour = {
    title: "Tour title",
    content: "Tour content",
    imageUrl: "https://via.placeholder.com/150",
    targetId: "tour-step-1",
    previousBtn: true,
    nextBtn: true,
    closeBtn: true,
  };

  @property({ type: String })
  completeTour = localStorage.getItem("tourStatus")
    ? localStorage.getItem("tourStatus")
    : "not";

  updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);

    if (changedProperties.has("tour")) {
      this.cleanup(); // Disconnect old observers
      this.observeTarget(); // Observe the new target
      this.updatePosition(); // Update position for the new target
    }
  }

  @property({ type: Number })
  step = 1;
  totalSteps = 4;

  @property({ type: Boolean })
  showTour = false;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    super();
    this.setupObservers();
  }

  private setupObservers(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.openState) {
        this.updatePosition();
      }
    });

    // Create intersection observer to handle visibility changes
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && this.openState) {
            this.updatePosition();
          }
        });
      },
      { threshold: 1.0 }
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    this.cleanup();
  }

  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private handleScroll = (): void => {
    if (this.openState) {
      this.updatePosition();
    }
  };

  private handleResize = (): void => {
    if (this.openState) {
      this.updatePosition();
    }
  };

  async open(): Promise<void> {
    this.openState = true;
    await this.updateComplete;
    this.updatePosition(); // Update position when opened
    this.observeTarget(); // Start observing the target
  }

  async close(): Promise<void> {
    this.openState = false;
    this.cleanup();
  }

  private observeTarget(): void {
    const target = document.getElementById(this.tour.targetId);
    if (target) {
      this.resizeObserver?.observe(target);
      this.intersectionObserver?.observe(target);
    }
  }

  private scrollToPosition(top: number, left: number): void {
    window.scrollTo({
      top: top - 50,
      left: left - 50,
      behavior: "instant",
    });
  }

  private updatePosition(): void {
    const target = document.getElementById(this.tour.targetId);
    const tourBox = this.shadowRoot?.querySelector(
      ".tour-dialog-box"
    ) as HTMLElement;

    if (!target || !tourBox) return;

    const targetRect = target.getBoundingClientRect();
    const tourRect = tourBox.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate initial position (below target)
    let top = targetRect.bottom + window.scrollY;
    let left = targetRect.left + window.scrollX;

    // Check if the tour box would go off-screen
    if (top + tourRect.height > viewportHeight + window.scrollY) {
      // Place above target if it would go off bottom
      top = targetRect.top + window.scrollY - tourRect.height;
    }

    if (left + tourRect.width > viewportWidth) {
      // Align to right edge if it would go off right side
      left = viewportWidth - tourRect.width - 20;
    }

    // Apply position with smooth transition
    tourBox.style.transition = "top 0.5s ease-in-out, left 0.5s ease-in-out";
    tourBox.style.position = "absolute";
    tourBox.style.top = `${top}px`;
    tourBox.style.left = `${left}px`;

    // Scroll to the new position
    this.scrollToPosition(top, left);
  }

  @property({ type: Boolean })
  show = false;

  renderDialog() {
    return this.completeTour === "completed" && this.show
      ? html``
      : html`
          <div class="tour-dialog-box">
            <div
              style="background-color: #f6f7f8; padding: 20px; border-radius: 5px;"
            >
              <div class="close-container">
                ${this.tour.closeBtn
                  ? html`
                      <button
                        class="tour-close"
                        @click="${() => this.close()}"
                      ></button>
                    `
                  : null}
              </div>

              <div class="imgBox">
                <img src="${this.tour.imageUrl}" alt="image" />
              </div>
            </div>

            <div class="content">
              <div class="header">${this.tour.title}</div>
              <div class="description">${this.tour.content}</div>
            </div>

            <div class="footer">
              <span>${this.step}/${this.totalSteps}</span>
              <div>
                ${this.tour.previousBtn
                  ? html`
                      <button
                        class="btn-previous"
                        @click="${this._onPreviousClicked}"
                        aria-label="Go to the previous step"
                      >
                        Previous
                      </button>
                    `
                  : null}

                ${this.step === this.totalSteps
                  ? html`
                      ${this.tour.nextBtn
                        ? html`
                            <button
                              class="btn"
                              @click="${this._onCompletedClicked}"
                              aria-label="Complete the tour"
                            >
                              Completed
                            </button>
                          `
                        : null}
                    `
                  : html`
                      ${this.tour.nextBtn
                        ? html`
                            <button
                              class="btn"
                              @click="${this._onNextClicked}"
                              aria-label="Go to the next step"
                            >
                              Next
                            </button>
                          `
                        : null}
                    `}
              </div>
            </div>
          </div>
        `;
  }

  _onNextClicked() {
    this.dispatchEvent(new CustomEvent("next-clicked"));
  }

  _onPreviousClicked() {
    this.dispatchEvent(new CustomEvent("previous-clicked"));
  }

  _onCompletedClicked() {
    localStorage.setItem("tourStatus", "completed");
    this.close();
  }

  static styles = css`
    .tour-close {
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      position: relative;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .tour-close::before,
    .tour-close::after {
      content: "";
      position: absolute;
      top: 9px;
      left: 0;
      right: 0;
      height: 2px;
      background: #32363e;
      border-radius: 4px;
    }

    .tour-close::before {
      transform: rotate(45deg);
    }

    .tour-close::after {
      transform: rotate(-45deg);
    }

    .close-container {
      display: flex;
      justify-content: flex-end;
    }
    .tour-dialog-box {
      background-color: transparent;
      border-radius: 5px;
      width: 350px;
      border: 1px solid #d6dde9;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.5s ease-in-out, top 0.5s ease-in-out,
        left 0.5s ease-in-out;
    }

    .imgBox {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      width: 100%px;
      height: 150px;
      background-color: #f6f7f8;
    }

    .content {
      padding: 20px;
    }

    .header {
      font-size: 18px;
      font-weight: bold;
      padding-bottom: 10px;
      font-family: Arial, sans-serif;
    }

    .description {
      font-size: 13px;
      font-family: Arial, sans-serif;
      color: #3338;
      text-align: justify;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      padding: 0px 20px;
      padding-bottom: 20px;
    }

    span {
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn {
      font-family: Arial, sans-serif;
      padding: 8px 22px;
      border-radius: 9px;
      background-color: #007bff;
      color: white;
      border: 1px solid #007bff;
      cursor: pointer;
    }

    .btn-previous {
      font-family: Arial, sans-serif;
      padding: 8px 22px;
      border-radius: 9px;
      background-color: #b7b7b8;
      color: white;
      border: 1px solid #b7b7b8;
      cursor: pointer;
    }

    .btn:hover {
      background-color: #0056b3;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pl-tour": Tour;
  }
}
