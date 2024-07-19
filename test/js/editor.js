class MutationHandler {
  constructor(editor) {
    this.editor = editor;
    this.undoStack = [];
    this.redoStack = [];
    this.observer = null;
    this.observerOptions = {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      attributes: true,
      attributeOldValue: true
    };
  }

  init() {
    const initialContent = this.editor.innerHTML;
    this.undoStack.push([{ type: 'childList', target: this.editor, oldValue: initialContent, addedNodes: [], removedNodes: [] }]);

    this.observer = new MutationObserver((mutations) => {
      const snapshot = this.storeMutations(mutations);
      console.log('Snapshot:', snapshot);
      this.undoStack.push(snapshot);
      this.redoStack.length = 0;
    });

    this.observer.observe(this.editor, this.observerOptions);
  }

  storeMutations(mutations) {
    return mutations.map(mutation => {
      mutation.selection = this.saveSelection();
      if (mutation.type === 'characterData') {
        mutation.newValue = mutation.target.data;
      } else if (mutation.type === 'childList') {
        mutation.newValue = mutation.target.nodeValue;
      } else if (mutation.type === 'attributes') {
        mutation.newValue = mutation.target.getAttribute(mutation.attributeName);
      }
      return Object.freeze(mutation);
    });
  }

  saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      };
    }
    return null;
  }

  restoreSelection(savedSelection) {
    if (savedSelection) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      const getValidOffset = (node, offset) => {
        const maxOffset = (node.nodeType === Node.TEXT_NODE) ? node.length : node.childNodes.length;
        return Math.max(0, Math.min(offset, maxOffset));
      };
      const startOffset = getValidOffset(savedSelection.startContainer, savedSelection.startOffset);
      const endOffset = getValidOffset(savedSelection.endContainer, savedSelection.endOffset);
      range.setStart(savedSelection.startContainer, startOffset);
      range.setEnd(savedSelection.endContainer, endOffset);
      selection.addRange(range);
    }
  }

  undo() {
    if (this.undoStack.length > 1) {
      const mutations = this.undoStack.pop();
      this.redoStack.push(mutations);
      this.observer.disconnect();
      this.undoMutations(mutations);
      this.observer.observe(this.editor, this.observerOptions);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const mutations = this.redoStack.pop();
      this.undoStack.push(mutations);
      this.observer.disconnect();
      this.redoMutations(mutations);
      this.observer.observe(this.editor, this.observerOptions);
    }
  }

  undoMutations(mutations) {
    for (let i = mutations.length - 1; i >= 0; i--) {
      const mutation = mutations[i];
      if (mutation.type === "characterData") {
        mutation.target.data = mutation.oldValue;
      } else if (mutation.type === "attributes") {
        mutation.target.setAttribute(mutation.attributeName, mutation.oldValue);
      } else if (mutation.type === "childList") {
        mutation.addedNodes.forEach(node => mutation.target.removeChild(node));
        mutation.removedNodes.forEach(node => {
          if (mutation.nextSibling) {
            mutation.target.insertBefore(node, mutation.nextSibling);
          } else {
            mutation.target.appendChild(node);
          }
        });
      }
      this.restoreSelection(mutation.selection);
    }
  }

  redoMutations(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'characterData') {
        mutation.target.data = mutation.newValue;
      } else if (mutation.type === 'attributes') {
        mutation.target.setAttribute(mutation.attributeName, mutation.newValue);
      } else if (mutation.type === 'childList') {
        mutation.removedNodes.forEach(node => mutation.target.removeChild(node));
        mutation.addedNodes.forEach(node => {
          if (mutation.nextSibling) {
            mutation.target.insertBefore(node, mutation.nextSibling);
          } else {
            mutation.target.appendChild(node);
          }
        });
      }
      this.restoreSelection(mutation.selection);
    });
  }
}

class RichTextEditor {
  constructor(editorSelector) {
    this.editor = document.querySelector(editorSelector);
    this.mutationHandler = new MutationHandler(this.editor);
  }

  init() {
    this.mutationHandler.init();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.editor.addEventListener("keypress", this.handleKeyPress.bind(this));
    this.editor.addEventListener("paste", this.handlePaste.bind(this));
    this.editor.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.editor.addEventListener("input", this.handleInput.bind(this));
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleEnterKey();
    }
  }

  handleEnterKey() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const currentFormatting = this.getCurrentFormatting();

    if (currentFormatting === "ol" || currentFormatting === "ul") {
      this.handleListEnter(range);
    } else if (currentFormatting === "p") {
      this.handleParagraphEnter(range);
    } else {
      this.handleDefaultEnter(range);
    }
  }

  handleListEnter(range) {
    const currentLi = this.getContainingLi(range.startContainer);
    if (currentLi) {
      const newLi = document.createElement("li");
      newLi.textContent = "\u200B";
      if (currentLi.nextSibling) {
        currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
      } else {
        currentLi.parentNode.appendChild(newLi);
      }
      range.setStart(newLi, 0);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      newLi.focus();
    }
  }

  handleParagraphEnter(range) {
    const currentNode = range.startContainer;
    const cursorOffset = range.startOffset;
    const nodeLength = currentNode.length;
    const isBlock = this.isBlockElement(currentNode.nextSibling);

    if (cursorOffset === nodeLength && isBlock) {
      const paragraph = document.createElement("p");
      paragraph.textContent = "\u200B";
      this.editor.insertBefore(paragraph, currentNode.nextSibling);
      range.setStart(paragraph, 0);
      range.collapse(true);
      this.editor.focus();
    } else {
      const br = document.createElement("br");
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  handleDefaultEnter(range) {
    const brElement = document.createElement("br");
    range.insertNode(brElement);
    range.setStart(brElement, 0);
    range.collapse(false);
  }

  handlePaste(e) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editor.classList.add('not-empty');
  }

  handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const command = e.key.toLowerCase() === "b" ? "strong" : e.key.toLowerCase() === "i" ? "em" : "u";
      this.toggleInlineStyle(command);
    } else if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      if (e.key.toLowerCase() === 'z') {
        this.mutationHandler.undo();
      } else if (e.key.toLowerCase() === 'y') {
        this.mutationHandler.redo();
      }
    }
  }

  toggleInlineStyle(command) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    if (selection.isCollapsed) {
      const element = document.createElement(command);
      element.textContent = "\u200B";
      range.insertNode(element);
      range.setStart(element.firstChild, 0);
      range.setEnd(element.firstChild, 1);
    } else {
      const appliedNodes = this.getAppliedNodes(range, command);
      if (appliedNodes.length > 0) {
        this.removeFormatting(appliedNodes, command, range, selection);
      } else {
        this.applyFormatToSelection(command, range);
      }
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  getAppliedNodes(range, command) {
    const nodes = [];
    const treeWalker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          return node.nodeName.toLowerCase() === command && range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        }
      }
    );

    let currentNode;
    while (currentNode = treeWalker.nextNode()) {
      nodes.push(currentNode);
    }

    return nodes;
  }

  removeFormatting(nodes, command, range, selection) {
    nodes.forEach(node => {
      const parent = node.parentNode;
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    });
  }

  applyFormatToSelection(command, range) {
    const element = document.createElement(command);
    element.appendChild(range.extractContents());
    range.insertNode(element);
  }

  handleInput(e) {
    this.updatePlaceholder(e);
    this.handleEmptyEditor();
  }

  updatePlaceholder(e) {
    if (e.target.textContent.trim().length === 0) {
      e.target.classList.remove('not-empty');
    } else {
      e.target.classList.add('not-empty');
    }
  }

  handleEmptyEditor() {
    const editorContent = this.editor.textContent.trim();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    if (editorContent.length <= 1 && range.startOffset < 5 && range.endOffset < 5) {
      this.editor.innerHTML = "";
      const paragraph = document.createElement("p");
      paragraph.textContent = "\u200B";
      this.editor.appendChild(paragraph);

      range.setStart(paragraph, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      this.editor.focus();
    }
  }

  getContainingLi(node) {
    while (node && node.nodeName !== "LI") {
      node = node.parentNode;
    }
    return node;
  }

  getCurrentFormatting() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let parentNode = range.commonAncestorContainer;
      while (parentNode && parentNode.parentNode !== this.editor) {
        parentNode = parentNode.parentNode;
      }
      if (parentNode && parentNode.nodeName !== "EDITOR") {
        return parentNode.nodeName.toLowerCase();
      }
    }
    return null;
  }

  isBlockElement(node) {
    if (!node) return true;
    return ['address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'].includes(node.nodeName.toLowerCase());
  }
}

// Usage
document.addEventListener("DOMContentLoaded", function () {
  const editor = new RichTextEditor(".editor");
  editor.init();
});