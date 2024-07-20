export default class MutationHandler {
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
    const startPath = this.getNodePath(range.startContainer);
    const endPath = this.getNodePath(range.endContainer);
    if (!startPath || !endPath) return null;
    return {
      startContainer: startPath,
      startOffset: range.startOffset,
      endContainer: endPath,
      endOffset: range.endOffset
    };
  }

  getNodePath(node) {
    const path = [];
    while (node && node !== this.editor) {
      const parent = node.parentNode;
      if (!parent) {
        // Node is detached or outside the editor
        return null;
      }
      path.unshift(Array.from(parent.childNodes).indexOf(node));
      node = parent;
    }
    return node === this.editor ? path : null;
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