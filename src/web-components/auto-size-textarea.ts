/**
 * AutoSizeTextarea - A web component that automatically adjusts its height based on content.
 * Uses the singleton registry for safe registration.
 */

export class AutoSizeTextarea extends HTMLElement {
  private textarea: HTMLTextAreaElement;
  private minRows: number = 1;
  private maxRows: number = 10;

  static get observedAttributes() {
    return ['min-rows', 'max-rows', 'placeholder', 'value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create textarea element
    this.textarea = document.createElement('textarea');
    this.textarea.style.resize = 'none';
    this.textarea.style.overflow = 'hidden';
    this.textarea.style.width = '100%';
    this.textarea.style.boxSizing = 'border-box';

    // Add event listeners
    this.textarea.addEventListener('input', this.adjustHeight.bind(this));
    window.addEventListener('resize', this.adjustHeight.bind(this));

    // Add to shadow DOM
    this.shadowRoot!.appendChild(this.textarea);
  }

  connectedCallback() {
    this.adjustHeight();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.adjustHeight);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'min-rows':
        this.minRows = parseInt(newValue, 10) || 1;
        break;
      case 'max-rows':
        this.maxRows = parseInt(newValue, 10) || 10;
        break;
      case 'placeholder':
        this.textarea.placeholder = newValue || '';
        break;
      case 'value':
        this.textarea.value = newValue || '';
        this.adjustHeight();
        break;
    }
  }

  private adjustHeight() {
    // Reset height to auto to get the correct scrollHeight
    this.textarea.style.height = 'auto';
    
    // Calculate the number of rows needed
    const lineHeight = parseInt(getComputedStyle(this.textarea).lineHeight, 10) || 20;
    const padding = parseInt(getComputedStyle(this.textarea).paddingTop, 10) * 2 || 0;
    const scrollHeight = this.textarea.scrollHeight - padding;
    
    // Calculate rows based on content
    const rows = Math.floor(scrollHeight / lineHeight);
    const newRows = Math.min(Math.max(rows, this.minRows), this.maxRows);
    
    // Apply the new height
    this.textarea.style.height = `${newRows * lineHeight + padding}px`;
  }

  // Getters and setters for properties
  get value(): string {
    return this.textarea.value;
  }

  set value(val: string) {
    this.textarea.value = val;
    this.adjustHeight();
  }

  get placeholder(): string {
    return this.textarea.placeholder;
  }

  set placeholder(val: string) {
    this.textarea.placeholder = val;
  }

  get disabled(): boolean {
    return this.textarea.disabled;
  }

  set disabled(val: boolean) {
    this.textarea.disabled = val;
  }
}

// Export the component class for manual registration
export default AutoSizeTextarea;
