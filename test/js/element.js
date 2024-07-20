// import RichTextEditor from "./editor.js";
import RichTextEditor from "./editor.js";

export default class EditorElement extends HTMLElement {
	constructor() {
		// We are not even going to touch this.
		super();

    this.mql = window.matchMedia("(max-width: 600px)");

    this.width = this.getDimension("width", "500");
    this.maxWidth = this.getDimension("max-width", this.width);
    this.minWidth = this.getDimension("min-width", this.width);

    this.height = this.getDimension("height", "300");
    this.maxHeight = this.getDimension("max-height", this.height);
    this.minHeight = this.getDimension("min-height", this.height);

		// let's create our shadow root
		this.shadowObj = this.attachShadow({ mode: "open" });

		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = this.getTemplate();
	}

	connectedCallback() {
    // Select the node that will be observed for mutations
    const targetNode = this.shadowRoot.querySelector(".editor");
    const toolBar = this.shadowRoot.querySelector(".toolbar");
    const wordCount = this.shadowRoot.querySelector("#words");
  
    // initialize the editor
    this.editor = new RichTextEditor({ targetNode, toolBar, wordCount });
    
    // initialize the editor
    this.editor.init();
  
    // open heading, list, alignment and text
    this.openHeading(toolBar);
    this.openList(toolBar);
    this.openAlignment(toolBar);
    this.openText(toolBar);
  }

  parseToNumber = str => {
    // try to parse the string to a number
    const num = parseInt(str);

    // if the number is not a number, return 0

    return isNaN(num) ? 0 : num;
  }

  getDimension = (attribute, fallback) => {
    // get the attribute value
    const value = this.getAttribute(attribute);

    // parse the value to a number
    const valueInt = this.parseToNumber(value);

    // if the value is 0, return the fallback
    return valueInt === 0 ? fallback : valueInt;
  }

  openHeading = toolbar => {
    const headingContainer = toolbar.querySelector(".heading");
    if(headingContainer) {
      // select container
      const container = headingContainer.querySelector(".container");
      // select the default
      const defaultSpan = headingContainer.querySelector("span.default");
      // add event listener to default
      defaultSpan.addEventListener("click", () => {
        // toggle active class on container
        container.classList.toggle('active');

        // add event to the document to close the heading run once
        if (container.classList.contains('active')) {
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      });

      function closeContainer(e) {
        if (!headingContainer.contains(e.target)) {
          container.classList.remove('active');
        } else {
          // If clicked inside, re-add the listener
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      }
    }
  }

  openList = toolbar => {
    const listContainer = toolbar.querySelector(".lists");
    if(listContainer) {
      // select container
      const container = listContainer.querySelector(".container");
      // select the default
      const defaultSpan = listContainer.querySelector("span.default");
      // add event listener to default
      defaultSpan.addEventListener("click", () => {
        // toggle active class on container
        container.classList.toggle('active');

        // add event to the document to close the heading run once
        if (container.classList.contains('active')) {
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      });

      function closeContainer(e) {
        if (!listContainer.contains(e.target)) {
          container.classList.remove('active');
        } else {
          // If clicked inside, re-add the listener
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      }
    }
  }

  openAlignment = toolbar => {
    const alignmentContainer = toolbar.querySelector(".alignment");
    if(alignmentContainer) {
      // select container
      const container = alignmentContainer.querySelector(".container");
      // select the default
      const defaultSpan = alignmentContainer.querySelector("span.default");
      // add event listener to default
      defaultSpan.addEventListener("click", () => {
        // toggle active class on container
        container.classList.toggle('active');

        // add event to the document to close the heading run once
        if (container.classList.contains('active')) {
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      });

      function closeContainer(e) {
        if (!alignmentContainer.contains(e.target)) {
          container.classList.remove('active');
        } else {
          // If clicked inside, re-add the listener
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      }
    }
  }

  openText = toolbar => {
    const textContainer = toolbar.querySelector(".text");
    if(textContainer) {
      // select container
      const container = textContainer.querySelector(".container");
      // select the default
      const defaultSpan = textContainer.querySelector("span.default");

      // check if default span is available
      if(!defaultSpan) return;


      // add event listener to default
      defaultSpan.addEventListener("click", () => {
        // toggle active class on container
        container.classList.toggle('active');

        // add event to the document to close the heading run once
        if (container.classList.contains('active')) {
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      });

      function closeContainer(e) {
        if (!textContainer.contains(e.target)) {
          container.classList.remove('active');
        } else {
          // If clicked inside, re-add the listener
          setTimeout(() => {
            document.addEventListener("click", closeContainer, { once: true });
          }, 0);
        }
      }
    }
  }

	getTemplate = () => {
		// Show HTML Here
		return `
      ${this.getBody()}
      ${this.getStyles()}
    `;
	}

	getBody = () => {
    const placeholder = this.getAttribute("placeholder") || "Start typing here...";
		return /* html */`
      <div class="editor" contenteditable="true" data-placeholder="${placeholder}" spellcheck="true"></div>
      ${this.getToolBar()}
    `;
	}

  getToolBar = () => {
    return /* html */`
      <div class="toolbar">
        ${this.getHeadings()}
        ${this.getText()}
        ${this.getLists()}
        ${this.getAlignments()}
        <span class="words" id="words" title="Total words">0 words</span>
      </div>
    `;
  }

  getHeadings = () => {
    return /* html */`
      <div class="heading group up">
        <div class="container">
          <span class="h1 tool" data-command="h1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M4 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M17 19H18.5M20 19H18.5M18.5 19V11L17 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 12L14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="h2 tool" data-command="h2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M3.5 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13.5 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20.5 19H16.5V18.6907C16.5 18.2521 16.5 18.0327 16.5865 17.8385C16.673 17.6443 16.836 17.4976 17.1621 17.2041L19.7671 14.8596C20.2336 14.4397 20.5 13.8416 20.5 13.214V13C20.5 11.8954 19.6046 11 18.5 11C17.3954 11 16.5 11.8954 16.5 13V13.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3.5 12L13.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="h3 tool" data-command="h3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M3.5 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13.5 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16.5 17C16.5 18.1046 17.3954 19 18.5 19C19.6046 19 20.5 18.1046 20.5 17C20.5 15.8954 19.6046 15 18.5 15C19.6046 15 20.5 14.1046 20.5 13C20.5 11.8954 19.6046 11 18.5 11C17.3954 11 16.5 11.8954 16.5 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3.5 12L13.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="h3 tool" data-command="h4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M3.5 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13.5 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16.5 11V15H20.5M20.5 15V19M20.5 15V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3.5 12L13.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="pointer"></span>
        </div>
        <span class="default">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M6 4V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M18 4V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6 12H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    `
  }

  getText = () => {
    return /* html */`
      <div class="text group">
        <div class="first">
          <span class="bold tool" data-command="bold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5 6C5 4.58579 5 3.87868 5.43934 3.43934C5.87868 3 6.58579 3 8 3H12.5789C15.0206 3 17 5.01472 17 7.5C17 9.98528 15.0206 12 12.5789 12H5V6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12.4286 12H13.6667C16.0599 12 18 14.0147 18 16.5C18 18.9853 16.0599 21 13.6667 21H8C6.58579 21 5.87868 21 5.43934 20.5607C5 20.1213 5 19.4142 5 18V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="underline tool" data-command="underline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M5.5 3V11.5C5.5 15.0899 8.41015 18 12 18C15.5899 18 18.5 15.0899 18.5 11.5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 21H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="italic tool" data-command="italic">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M12 4H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M8 20L16 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M5 20H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
        </div>
        ${this.getMoreText(this.width)}
      </div>
    `
  }

  getMoreText = width => {
    // check if this is mobile
    if(this.mql.matches) {
      return this.getContainedText();
    }

    //  Check if width is less than 600
    if (width < 600) {
      return this.getContainedText();
    } else {
      return this.getMoreFullText();
    }
  }

  getContainedText = () => {
    return /* html */`
      <div class="group up">
        <div class="container">
          <span class="link tool" data-command="link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M9.14339 10.691L9.35031 10.4841C11.329 8.50532 14.5372 8.50532 16.5159 10.4841C18.4947 12.4628 18.4947 15.671 16.5159 17.6497L13.6497 20.5159C11.671 22.4947 8.46279 22.4947 6.48405 20.5159C4.50532 18.5372 4.50532 15.329 6.48405 13.3503L6.9484 12.886" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M17.0516 11.114L17.5159 10.6497C19.4947 8.67095 19.4947 5.46279 17.5159 3.48405C15.5372 1.50532 12.329 1.50532 10.3503 3.48405L7.48405 6.35031C5.50532 8.32904 5.50532 11.5372 7.48405 13.5159C9.46279 15.4947 12.671 15.4947 14.6497 13.5159L14.8566 13.309" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="strike tool" data-command="strike">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M4 12H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M17.5 7.66667C17.5 5.08934 15.0376 3 12 3C8.96243 3 6.5 5.08934 6.5 7.66667C6.5 8.15279 6.55336 8.59783 6.6668 9M6 16.3333C6 18.9107 8.68629 21 12 21C15.3137 21 18 19.6667 18 16.3333C18 13.9404 16.9693 12.5782 14.9079 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="quotes tool" data-command="quotes">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M14 16C14 14.1144 14 13.1716 14.5858 12.5858C15.1716 12 16.1144 12 18 12C19.8856 12 20.8284 12 21.4142 12.5858C22 13.1716 22 14.1144 22 16C22 17.8856 22 18.8284 21.4142 19.4142C20.8284 20 19.8856 20 18 20C16.1144 20 15.1716 20 14.5858 19.4142C14 18.8284 14 17.8856 14 16Z" stroke="currentColor" stroke-width="1.5" />
              <path d="M14 16V11.8626C14 8.19569 16.5157 5.08584 20 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 16C2 14.1144 2 13.1716 2.58579 12.5858C3.17157 12 4.11438 12 6 12C7.88562 12 8.82843 12 9.41421 12.5858C10 13.1716 10 14.1144 10 16C10 17.8856 10 18.8284 9.41421 19.4142C8.82843 20 7.88562 20 6 20C4.11438 20 3.17157 20 2.58579 19.4142C2 18.8284 2 17.8856 2 16Z" stroke="currentColor" stroke-width="1.5" />
              <path d="M2 16V11.8626C2 8.19569 4.51571 5.08584 8 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="code tool" data-command="code">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M17 8L18.8398 9.85008C19.6133 10.6279 20 11.0168 20 11.5C20 11.9832 19.6133 12.3721 18.8398 13.1499L17 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 8L5.16019 9.85008C4.38673 10.6279 4 11.0168 4 11.5C4 11.9832 4.38673 12.3721 5.16019 13.1499L7 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14.5 4L9.5 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="pointer"></span>
        </div>
        <span class="default">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M17.9999 14C17.9999 14 13.581 19 11.9999 19C10.4188 19 5.99994 14 5.99994 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17.9999 9.99996C17.9999 9.99996 13.581 5.00001 11.9999 5C10.4188 4.99999 5.99994 10 5.99994 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!--<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M15.5 6.5C15.5 8.433 13.933 10 12 10C10.067 10 8.5 8.433 8.5 6.5C8.5 4.567 10.067 3 12 3C13.933 3 15.5 4.567 15.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
            <path d="M22 17.5C22 19.433 20.433 21 18.5 21C16.567 21 15 19.433 15 17.5C15 15.567 16.567 14 18.5 14C20.433 14 22 15.567 22 17.5Z" stroke="currentColor" stroke-width="1.5" />
            <path d="M9 17.5C9 19.433 7.433 21 5.5 21C3.567 21 2 19.433 2 17.5C2 15.567 3.567 14 5.5 14C7.433 14 9 15.567 9 17.5Z" stroke="currentColor" stroke-width="1.5" />
          </svg>-->
        </span>
      </div>
    `
  }

  getMoreFullText = () => {
    return /*html*/`
      <div class="second">
        <span class="link tool" data-command="link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M9.14339 10.691L9.35031 10.4841C11.329 8.50532 14.5372 8.50532 16.5159 10.4841C18.4947 12.4628 18.4947 15.671 16.5159 17.6497L13.6497 20.5159C11.671 22.4947 8.46279 22.4947 6.48405 20.5159C4.50532 18.5372 4.50532 15.329 6.48405 13.3503L6.9484 12.886" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M17.0516 11.114L17.5159 10.6497C19.4947 8.67095 19.4947 5.46279 17.5159 3.48405C15.5372 1.50532 12.329 1.50532 10.3503 3.48405L7.48405 6.35031C5.50532 8.32904 5.50532 11.5372 7.48405 13.5159C9.46279 15.4947 12.671 15.4947 14.6497 13.5159L14.8566 13.309" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="strike tool" data-command="strike">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M4 12H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17.5 7.66667C17.5 5.08934 15.0376 3 12 3C8.96243 3 6.5 5.08934 6.5 7.66667C6.5 8.15279 6.55336 8.59783 6.6668 9M6 16.3333C6 18.9107 8.68629 21 12 21C15.3137 21 18 19.6667 18 16.3333C18 13.9404 16.9693 12.5782 14.9079 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="quotes tool" data-command="quotes">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M14 16C14 14.1144 14 13.1716 14.5858 12.5858C15.1716 12 16.1144 12 18 12C19.8856 12 20.8284 12 21.4142 12.5858C22 13.1716 22 14.1144 22 16C22 17.8856 22 18.8284 21.4142 19.4142C20.8284 20 19.8856 20 18 20C16.1144 20 15.1716 20 14.5858 19.4142C14 18.8284 14 17.8856 14 16Z" stroke="currentColor" stroke-width="1.5" />
            <path d="M14 16V11.8626C14 8.19569 16.5157 5.08584 20 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M2 16C2 14.1144 2 13.1716 2.58579 12.5858C3.17157 12 4.11438 12 6 12C7.88562 12 8.82843 12 9.41421 12.5858C10 13.1716 10 14.1144 10 16C10 17.8856 10 18.8284 9.41421 19.4142C8.82843 20 7.88562 20 6 20C4.11438 20 3.17157 20 2.58579 19.4142C2 18.8284 2 17.8856 2 16Z" stroke="currentColor" stroke-width="1.5" />
            <path d="M2 16V11.8626C2 8.19569 4.51571 5.08584 8 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="code tool" data-command="code">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M17 8L18.8398 9.85008C19.6133 10.6279 20 11.0168 20 11.5C20 11.9832 19.6133 12.3721 18.8398 13.1499L17 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7 8L5.16019 9.85008C4.38673 10.6279 4 11.0168 4 11.5C4 11.9832 4.38673 12.3721 5.16019 13.1499L7 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14.5 4L9.5 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    `
  }

  getLists = () => {
    return /* html */`
      <div class="lists group up">
        <div class="container">
          <span class="ordered tool" data-command="ordered">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M11 6L21 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M11 12L21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M11 18L21 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M3 15H4.5C4.77879 15 4.91819 15 5.03411 15.0231C5.51014 15.1177 5.88225 15.4899 5.97694 15.9659C6 16.0818 6 16.2212 6 16.5C6 16.7788 6 16.9182 5.97694 17.0341C5.88225 17.5101 5.51014 17.8823 5.03411 17.9769C4.91819 18 4.77879 18 4.5 18C4.22121 18 4.08181 18 3.96589 18.0231C3.48986 18.1177 3.11775 18.4899 3.02306 18.9659C3 19.0818 3 19.2212 3 19.5V20.4C3 20.6828 3 20.8243 3.08787 20.9121C3.17574 21 3.31716 21 3.6 21H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 3H4.2C4.36569 3 4.5 3.13431 4.5 3.3V9M4.5 9H3M4.5 9H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="unordered tool" data-command="unordered">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M8 5L20 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M4 5H4.00898" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 12H4.00898" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 19H4.00898" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M8 19L20 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="pointer"></span>
        </div>
        <span class="default">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M8 5L20 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M4 5H4.00898" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 12H4.00898" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 19H4.00898" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M8 19L20 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </div>
    `
  }

  getAlignments = () => {
    return /* html */`
      <div class="alignment group up">
        <div class="container">
          <span class="left tool">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M4 5L16 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 19L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="center tool">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M7 5L17 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 19L17 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="right tool">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M20 12L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20 5L4 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20 19L4 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="justify tool">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
              <path d="M4 5L20 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 19L20 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="pointer"></span>
        </div>
        <span class="default">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
            <path d="M10 5L20 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 19L14 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    `
  }

	getStyles() {
		return /* css */`
	    <style>
	      *,
	      *:after,
	      *:before {
	        box-sizing: border-box !important;
	        font-family: inherit;
	        -webkit-box-sizing: border-box !important;
	      }

	      *:focus {
	        outline: inherit !important;
	      }

	      *::-webkit-scrollbar {
	        width: 3px;
	      }

	      *::-webkit-scrollbar-track {
	        background: var(--q-scroll-background);
	      }

	      *::-webkit-scrollbar-thumb {
	        width: 3px;
	        background: var(--q-scroll-linear);
	        border-radius: 50px;
	      }
        /*
          2. Remove default margin
        */
          * {
          margin: 0;
          font-family: inherit;
        }
        
        /*
          Typographic tweaks!
          3. Add accessible line-height
          4. Improve text rendering
        */
        .editor {
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }
        
        /*
          7. Avoid text overflows
        */
        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          overflow-wrap: break-word;
        }
        
        /*
           8. Create a root stacking context
        */
        #root,
        #__next {
          isolation: isolate;
        }

	      h1,
	      h2,
	      h3,
	      h4,
	      h5,
	      h6 {
	        font-family: inherit;
	      }

	      a {
	        text-decoration: none;
	      }

        :host {
          width: ${this.width}px;
          min-width: ${this.minWidth}px;
          max-width: ${this.maxWidth}px;
          min-height: ${this.minHeight}px;
          height: ${this.height}px;
          max-height: ${this.maxHeight}px;
          margin: 0;
          padding: 0;
          position: relative;
          display: flex;
          flex-flow: column;
          align-items: center;
          justify-content: center;
        }
        
        .editor {
          min-width: 100%;
          max-width: 100%;
          width: 100%;
          height: calc(100% - 45px);
          padding: 10px;
          margin-bottom: 10px;
          color: var(--q-text-color);
          overflow-y: scroll;
        }
        
        .editor::before {
          content: attr(data-placeholder);
          color: var(--q-gray-color);
          position: absolute;
          left: 10px;
          top: 10px;
          pointer-events: none;
        }
        
        .editor.not-empty::before {
          display: none;
        }
        
        .toolbar {
          min-width: 100%;
          max-width: 100%;
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          justify-content: start;
          align-items: center;
          height: 40px;
          padding: 0;
          gap: 20px;
        }
        
        .toolbar > .group {
          display: flex;
          z-index: 1;
          flex-flow: row;
          height: 100%;
          align-items: center;
          justify-content: center;
          width: max-content;
          transition: all 300ms ease-in-out;
          -webkit-transition: all 300ms ease-in-out;
          -moz-transition: all 300ms ease-in-out;
          -ms-transition: all 300ms ease-in-out;
        }
        
        .toolbar > .group.text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .toolbar > .group.text > div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: max-content;
          gap: 5px;
          background: var(--q-item-background);
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          border-radius: 10px;
          border: var(--q-item-border);
          box-shadow: var(--q-item-shadow);
        }

        .toolbar > .group.text > .group.up,
        .toolbar > .group.up {
          flex-flow: column;
          position: relative;
          color: var(--q-gray-color);
          width: 45px;
          height: 35px;
          background: var(--q-item-background);
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          border-radius: 10px;
          border: var(--q-item-border);
        }
        
        .toolbar > .group.text > .group.up > .container,
        .toolbar > .group.up > .container {
          position: absolute;
          bottom: 45px;
          width: 45px;
          padding: 7px 0;
          left: 0;
          z-index: 1;
          display: none;
          opacity: 0;
          flex-flow: column;
          align-items: center;
          gap: 0;
          background: var(--q-item-background);
          box-shadow: var(--q-item-shadow);
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          border-radius: 10px;
          border: var(--q-item-border);
        }

        .toolbar > .group.text > .group.up > .container.active,
        .toolbar > .group.up > .container.active {
          display: flex;
          opacity: 1;
        }

        .toolbar > .group.text > .group.up > .container > span.pointer,
        .toolbar > .group.up > .container > span.pointer {
          position: absolute;
          bottom: -11px;
          width: 12px;
          height: 12px;
          left: 50%;
          right: 50%;
          transform: translateX(-50%);
          border: none;
          background: var(--q-background);
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          rotate: 45deg;
          border-bottom: var(--q-item-border);
          border-right: var(--q-item-border);
        }
        
        .toolbar > .group.up.heading > .container {
          flex-flow: column-reverse;
        }
        
        .toolbar > .group.text > .group.up,
        .toolbar > .group.up {
          background: var(--q-item-background);
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          box-shadow: var(--q-item-shadow);
          border-radius: 10px;
          border: var(--q-item-border);
        }
        
        .toolbar > .group.text > .group.up:hover,
        .toolbar > .group.up:hover {
          background: #c5c5c55b;
        }
        
        .toolbar > .group.text > .group.up.active,
        .toolbar > .group.up.active {
          color: var(--q-text-color);
          background: #c5c5c55b;
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          box-shadow: var(--q-item-shadow);
        }
        
        .toolbar > .group.text > div > span.tool {
          width: 35px;
          height: 35px;
          border-radius: 7px;
        }
        
        .toolbar > .group.text > .group.up span.default,
        .toolbar > .group.up span.default {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
          cursor: pointer;
          transition: all 300ms ease-in-out;
          -webkit-transition: all 300ms ease-in-out;
          -moz-transition: all 300ms ease-in-out;
          -ms-transition: all 300ms ease-in-out;
        }
        
        .toolbar > .group span.default,
        .toolbar > .group span.tool {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--q-gray-color);
          cursor: pointer;
          transition: all 300ms ease-in-out;
          -webkit-transition: all 300ms ease-in-out;
          -moz-transition: all 300ms ease-in-out;
          -ms-transition: all 300ms ease-in-out;
        }
        
        .toolbar > .group.text > .group.up > .container span.tool,
        .toolbar > .group.up > .container span.tool {
          width: 35px;
          height: 35px;
          border-radius: 7px;
        }
        
        .toolbar > .group.text > .group.up > .container span.tool:hover,
        .toolbar > .group.text > div span.tool:hover,
        .toolbar > .group.up > .container span.tool:hover {
          background: var(--q-gray-background);
          border-radius: 7px;
          color: var(--q-text-color);
        }
        
        .toolbar > .group.text > .group.up > .container span.tool.active,
        .toolbar > .group.text > div span.tool.active,
        .toolbar > .group.up > .container span.tool.active {
          background: var(--q-gray-background);
          border-radius: 7px;
          color: var(--q-text-color);
        }
        
        .toolbar > .group span.default svg,
        .toolbar > .group span.tool svg {
          width: 20px;
          height: 20px;
        }
        
        .toolbar > #words.words {
          width: max-content;
          padding: 0 10px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: var(--q-gray-color);
          background: var(--q-item-background);
          backdrop-filter: blur( 0.5px );
          -webkit-backdrop-filter: blur( 0.5px );
          border-radius: 10px;
          border: var(--q-item-border);
          box-shadow: var(--q-item-shadow);
          transition: all 300ms ease-in-out;
          -webkit-transition: all 300ms ease-in-out;
          -moz-transition: all 300ms ease-in-out;
          -ms-transition: all 300ms ease-in-out;
        }
        
        .toolbar > #words.words svg {
          width: 20px;
          height: 20px;
        }
        
        .toolbar > #words.words > span.number {
          display: inline-block;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .toolbar > #words.words > span.text {
          display: none;
          font-size: 1rem;
          font-weight: 500;
        }

				@media screen and (max-width:660px) {
          :host {
            width: 100%;
            max-width: 100%;
            min-width: 300px;
          }

          .toolbar {
            width: 100%;
            max-width: 100vw;
            align-items: center;
            gap: 10px;
          }

          .toolbar > .group.text > .group.up,
          .toolbar > .group.up {
            width: 35px;
            cursor: default !important;
            border-radius: 10px;
          }

          .toolbar > .group.text > .group.up > .container,
          .toolbar > .group.up > .container {
            bottom: 43px;
            cursor: default !important;
            width: 38px;
            padding: 7px 0;
            left: 50%;
            right: 50%;
            transform: translateX(-50%);
          }

          .toolbar > .group.text > .group.up > .container span.tool,
          .toolbar > .group.up > .container span.tool {
            width: 33px;
            height: 33px;
            cursor: default !important;
            border-radius: 6px;
          }

          .toolbar > .group span.default {
            cursor: default !important;
          }

          .toolbar > .group.text > div > span.tool {
            width: 33px;
            height: 33px;
            cursor: default !important;
            border-radius: 6px;
          }

          .toolbar > .group.text > .group.up > .container > span.pointer,
          .toolbar > .group.up > .container > span.pointer {
            position: absolute;
            bottom: -8px;
            width: 9px;
            height: 9px;
            right: 50%;
            transform: translateX(-50%);
          }

          .toolbar > #words.words {
            position: absolute;
            display: none;
            right: 0;
            bottom: 43px;
            height: max-content;
            padding: 1px 10px 2px;
            font-size: 0.9rem;
          }
				}
	    </style>
    `;
	}
}