export default class KeyBoardHandler {
  constructor(editor, mutationHandler) {
    this.editor = editor;
    this.editorNode = editor.editor;
    this.mutationHandler = mutationHandler;
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.editorNode.addEventListener("keypress", this.handleKeyPress.bind(this));
    this.editorNode.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const command = e.key.toLowerCase() === "b" ? "strong" : e.key.toLowerCase() === "i" ? "em" : "u";
      this.editor.toggleInlineStyle(command);
    } else if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      if (e.key.toLowerCase() === 'z') {
        this.mutationHandler.undo();
      } else if (e.key.toLowerCase() === 'y') {
        this.mutationHandler.redo();
      }
    }

    this.editor.countWords(e);
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleEnterKey(e);
    }
  }

  handleEnterKey(e) {
    e.preventDefault(); // Prevent default new line behavior

    const selection = window.getSelection();
    
    const currentFormatting = this.getCurrentFormatting(selection);
    
    if (currentFormatting === "ol" || currentFormatting === "ul") {
      this.handleListEnter(selection);
    } else if (currentFormatting === "p") {
      this.handleParagraphEnter(selection);
    } else {
      this.handleDefaultEnter(selection);
    }

    this.mutationHandler.saveState();
  }

  handleListEnter = selection => {
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const currentLi = this.getContainingLi(range.startContainer);
      if (currentLi) {
        const newLi = document.createElement("li");
        newLi.textContent = "\u200B"; // Zero-width space for focusable cursor
        const nextSibling = currentLi.nextSibling;
        if (nextSibling) {
          currentLi.parentNode.insertBefore(newLi, nextSibling);
        } else {
          currentLi.parentNode.appendChild(newLi);
        }
        range.setStart(newLi, 0); // Set cursor at the beginning of the new li
        range.collapse(true); // Collapse range to the start
        selection.removeAllRanges();
        selection.addRange(range);
        newLi.focus();
      }
    }
  }

  handleParagraphEnter = selection => {
    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;
    const cursorOffset = range.startOffset;
    const nodeLength = currentNode.length;
    const isBlock = this.isBlockElement(currentNode.nextSibling);

    if (cursorOffset === nodeLength) {
      const nextSibling = currentNode.nextSibling;
      const paragraph = document.createElement("p");
      paragraph.textContent = "\u200B"; // Zero-width space for focusable cursor
      this.editorNode.insertBefore(paragraph, nextSibling);
      range.setStart(paragraph, 0);
      range.collapse(true);
      this.editorNode.focus();
    } else {
      const br = document.createElement("br");
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  handleDefaultEnter = selection => {
    const range = selection.getRangeAt(0);
    const brElement = document.createElement("br");
    range.insertNode(brElement);
    range
    range.setStartAfter(brElement);
    range.collapse(true); // Move cursor to the next line
    selection.removeAllRanges();
    selection.addRange(range);
  }

  getCurrentFormatting = selection => {
    if (!selection || selection.rangeCount === 0) return null;

    let node = selection.getRangeAt(0).commonAncestorContainer;
    while (node && node !== this.editorNode) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const nodeName = node.nodeName.toLowerCase();
        if (['ul', 'ol', 'li'].includes(nodeName)) {
          return nodeName;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  getContainingLi = node => {
    while (node && node !== this.editorNode) {
      if (node.nodeName.toLowerCase() === 'li') {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  isBlockElement = node => {
    if (!node) return false;
    const display = window.getComputedStyle(node).display;
    return display === 'block' || display === 'list-item';
  }
  
  getClosestBlock = node => {
    while (node && node !== this.editorNode) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const display = window.getComputedStyle(node).display;
        if (display === 'block' || display === 'list-item') {
          return node;
        }
      }
      node = node.parentNode;
    }
    return this.editorNode;
  }
}