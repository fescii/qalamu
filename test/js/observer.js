class MutationHandler {
  constructor(editor) {
    this.editor = editor;
    this.undoStack = [];
    this.redoStack = [];
    this.isUndoRedo = false;
    this.lastState = null;
    this.debounceTimer = null;
    this.observer = new MutationObserver(this.handleMutations.bind(this));
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
    this.saveState();
    this.observer.observe(this.editor, this.observerOptions);
  }

  handleMutations(mutations) {
    if (this.isUndoRedo) return;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const newState = this.createState();
      if (this.shouldSaveState(newState)) {
        this.saveState(newState);
      }
    }, 100);
  }

  createState() {
    return {
      html: this.editor.innerHTML,
      selection: this.saveSelection(),
      mutations: []
    };
  }

  shouldSaveState(newState) {
    return !this.lastState || newState.html !== this.lastState.html;
  }

  saveState(state = this.createState()) {
    this.undoStack.push(state);
    this.redoStack = [];
    this.lastState = state;
  }

  saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    return {
      startContainer: this.getNodePath(range.startContainer),
      startOffset: range.startOffset,
      endContainer: this.getNodePath(range.endContainer),
      endOffset: range.endOffset
    };
  }

  getNodePath(node) {
    const path = [];
    while (node !== this.editor) {
      const parent = node.parentNode;
      path.unshift(Array.from(parent.childNodes).indexOf(node));
      node = parent;
    }
    return path;
  }

  restoreSelection(savedSelection) {
    if (!savedSelection) return;
    const range = document.createRange();
    range.setStart(...this.getNodeAndOffset(savedSelection.startContainer, savedSelection.startOffset));
    range.setEnd(...this.getNodeAndOffset(savedSelection.endContainer, savedSelection.endOffset));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  getNodeAndOffset(path, offset) {
    let node = this.editor;
    for (const index of path) {
      node = node.childNodes[index];
      if (!node) return [this.editor, 0];
    }
    return [node, Math.min(offset, node.textContent.length)];
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.isUndoRedo = true;
      this.redoStack.push(this.undoStack.pop());
      const state = this.undoStack[this.undoStack.length - 1];
      this.applyState(state);
      this.isUndoRedo = false;
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.isUndoRedo = true;
      const state = this.redoStack.pop();
      this.undoStack.push(state);
      this.applyState(state);
      this.isUndoRedo = false;
    }
  }

  applyState(state) {
    this.editor.innerHTML = state.html;
    this.restoreSelection(state.selection);
    this.lastState = state;
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
    const br = document.createElement('br');
    range.deleteContents();
    range.insertNode(br);
    range.setStartAfter(br);
    range.setEndAfter(br);
    selection.removeAllRanges();
    selection.addRange(range);
    this.mutationHandler.saveState();
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

  handleInput(e) {
    this.updatePlaceholder();
  }

  updatePlaceholder() {
    if (this.editor.textContent.trim().length === 0) {
      this.editor.classList.remove('not-empty');
    } else {
      this.editor.classList.add('not-empty');
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

    // After applying the style:
    this.mutationHandler.saveState();
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
}

// Usage
document.addEventListener("DOMContentLoaded", function () {
  const editor = new RichTextEditor(".editor");
  editor.init();
});