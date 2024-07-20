// import MutationHandler from "./mutation-handler.js";
import MutationHandler from "./observer.js";

// Define RichTextEditor class
export default class RichTextEditor {
  constructor(options) {
    const { targetNode, toolBar, wordCount } = options;

    // check if targetNode, toolBar and wordCount exists and are valid nodes
    if (!targetNode || !targetNode.nodeType || targetNode.nodeType !== 1) {
      throw new Error("Invalid targetNode, expected a valid DOM node");
    }

    if (!toolBar || !toolBar.nodeType || toolBar.nodeType !== 1) {
      throw new Error("Invalid toolBar, expected a valid DOM node");
    }

    if (!wordCount || !wordCount.nodeType || wordCount.nodeType !== 1) {
      throw new Error("Invalid wordCount, expected a valid DOM node");
    }

    // assign targetNode, toolBar and wordCount to instance properties
    this.editor = targetNode;
    this.count = wordCount;
    this.toolbar = toolBar;

    this.lastSelection = null;

    this.textToolbars = this.toolbar.querySelector('.text.group');
    this.headingToolbars = this.toolbar.querySelector('.heading.group');
    this.listToolbars = this.toolbar.querySelector('.lists.group');
    this.alignmentToolbars = this.toolbar.querySelector('.alignment.group');

    this.mutationHandler = new MutationHandler(this.editor);
  }

  init() {
    this.mutationHandler.init();
    this.setupEventListeners();
    this.setupToolbarListeners();
    this.setupSelectionListener();
  }

  setupEventListeners() {
    this.editor.addEventListener("keypress", this.handleKeyPress.bind(this));
    this.editor.addEventListener("paste", this.handlePaste.bind(this));
    this.editor.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.editor.addEventListener("input", this.handleInput.bind(this));
  }

  setupToolbarListeners() {
    this.setupTextToolbarListeners();
    this.setupHeadingToolbarListeners();
    this.setupListToolbarListeners();
    this.setupAlignmentToolbarListeners();
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleEnterKey(e);
    }
  }

  // handleKeyPress(e) {
  //   // Check if the current key press is Enter
  //   if (e.key === "Enter") {
  //     e.preventDefault(); // Prevent default new line behavior

  //     const selection = window.getSelection();
  //     if (selection.rangeCount === 0) return;

  //     const range = selection.getRangeAt(0);

  //     // check if the surrounding are text nodes
  //     if (range.startContainer.nodeType === Node.TEXT_NODE && range.endContainer.nodeType === Node.TEXT_NODE) {
  //       this.handleDefaultEnter(range, selection);
  //     }

  //     const currentFormatting = this.getCurrentFormatting(range);

  //     if (currentFormatting === "ol" || currentFormatting === "ul") {
  //       this.handleListEnter(range, currentFormatting);
  //     } else if (currentFormatting === "p") {
  //       this.handleParagraphEnter(range);
  //     } else {
  //       this.handleDefaultEnter(range, selection);
  //     }

  //     this.mutationHandler.saveState();
  //   }
  // }

  // getCurrentFormatting(range) {
  //   let node = range.startContainer;
  //   while (node && node !== this.editor) {
  //     if (node.nodeName === 'UL') return 'ul';
  //     if (node.nodeName === 'OL') return 'ol';
  //     if (node.nodeName === 'P') return 'p';
  //     node = node.parentNode;
  //   }
  //   return null;
  // }

  // getContainingLi(node) {
  //   while (node && node !== this.editor) {
  //     if (node.nodeName === 'LI') return node;
  //     node = node.parentNode;
  //   }
  //   return null;
  // }

  // handleListEnter(range, listType) {
  //   const currentLi = this.getContainingLi(range.startContainer);
  //   if (!currentLi) return;

  //   if (currentLi.textContent.trim() === '') {
  //     // Empty list item: move out of the list
  //     const list = currentLi.parentNode;
  //     const newPara = document.createElement('p');
  //     newPara.innerHTML = '&#160;'; // Non-breaking space
  //     if (list.nextSibling) {
  //       list.parentNode.insertBefore(newPara, list.nextSibling);
  //     } else {
  //       list.parentNode.appendChild(newPara);
  //     }
  //     list.removeChild(currentLi);
  //     if (list.children.length === 0) {
  //       list.parentNode.removeChild(list);
  //     }
  //     range.setStart(newPara, 0);
  //   } else {
  //     // Non-empty list item: create a new list item
  //     const newLi = document.createElement('li');
  //     newLi.innerHTML = '&#160;'; // Non-breaking space
  //     if (range.collapsed && range.startOffset === currentLi.textContent.length) {
  //       // Cursor at the end: insert after
  //       if (currentLi.nextSibling) {
  //         currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
  //       } else {
  //         currentLi.parentNode.appendChild(newLi);
  //       }
  //     } else {
  //       // Cursor in the middle: split the current li
  //       const fragment = range.extractContents();
  //       newLi.appendChild(fragment);
  //       currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
  //     }
  //     range.setStart(newLi, 0);
  //   }

  //   range.collapse(true);
  //   this.updateEnterSelection(range);
  // }

  // handleParagraphEnter(range) {
  //   const currentNode = range.startContainer;
  //   const parentNode = currentNode.parentNode;
  //   const cursorOffset = range.startOffset;

  //   if (currentNode.nodeType === Node.TEXT_NODE && cursorOffset === currentNode.length) {
  //     // Cursor at the end of text node
  //     const newPara = document.createElement('p');
  //     newPara.innerHTML = '&#160;'; // Non-breaking space
  //     if (parentNode.nextSibling) {
  //       this.editor.insertBefore(newPara, parentNode.nextSibling);
  //     } else {
  //       this.editor.appendChild(newPara);
  //     }
  //     range.setStart(newPara, 0);
  //   } else if (currentNode.nodeType === Node.TEXT_NODE && cursorOffset === 0) {
  //     // Cursor at the beginning of text node
  //     const newPara = document.createElement('p');
  //     newPara.innerHTML = '&#160;'; // Non-breaking space
  //     this.editor.insertBefore(newPara, parentNode);
  //     range.setStart(newPara, 0);
  //   }

  //   range.collapse(true);
  //   this.updateEnterSelection(range);
  // }

  // handleDefaultEnter(range, selection) {
  //   // Cursor is between contents, insert <br> manually
  //   const br = document.createElement("br");
  //   range.insertNode(br);
  //   range.setStartAfter(br);
  //   range.collapse(true);
  //   selection.removeAllRanges();
  //   selection.addRange(range);
  // }

  updateEnterSelection(range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  handleKeyPress = (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault(); // Prevent default new line behavior

    const selection = window.getSelection();
    const range = selection.rangeCount ? selection.getRangeAt(0) : new Range(); // Handle empty editor

    const currentFormatting = this.getCurrentFormatting(range);

    if (currentFormatting === "ol" || currentFormatting === "ul") {
      this.handleListEnter(range, currentFormatting);
    } else if (currentFormatting === "p") {
      this.handleParagraphEnter(range,selection);
    } else {
      // Handle other scenarios (e.g., headings, tables)
      this.handleDefaultEnter(range, selection);
    }

    this.mutationHandler.saveState();
  }

  getCurrentFormatting(range) {
    let node = range.startContainer;
    while (node && node !== this.editor) {
      if (node.nodeName === 'UL') return 'ul';
      if (node.nodeName === 'OL') return 'ol';
      if (node.nodeName === 'P') return 'p';
      node = node.parentNode;
    }
    return null;
  }

  handleListEnter = (range, listType) => {
    const currentLi = range.startContainer.closest('LI');
    if (!currentLi) return;

    if (currentLi.textContent.trim() === '') {
      // Empty list item: remove or move out of list
      const list = currentLi.parentNode;
      if (list.children.length === 1) {
        // Single item list: remove entire list
        list.parentNode.removeChild(list);
      } else {
        // Move out of list and insert a paragraph
        const newPara = document.createElement('p');
        newPara.innerHTML = '&#160;'; // Non-breaking space
        if (list.nextSibling) {
          list.parentNode.insertBefore(newPara, list.nextSibling);
        } else {
          list.parentNode.appendChild(newPara);
        }
        list.removeChild(currentLi);
        range.setStart(newPara, 0);
      }
    } else {
      // Non-empty list item: create a new list item based on cursor position
      const newLi = document.createElement('li');
      newLi.innerHTML = '&#160;'; // Non-breaking space
      if (range.collapsed && range.startOffset === currentLi.textContent.length) {
        // Cursor at the end: insert after
        if (currentLi.nextSibling) {
          currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
        } else {
          currentLi.parentNode.appendChild(newLi);
        }
      } else {
        // Cursor in the middle: split the current li
        const fragment = range.extractContents();
        newLi.appendChild(fragment);
        currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
      }
      range.setStart(newLi, 0);
    }

    range.collapse(true);
    this.updateEnterSelection(range);
  }

  handleParagraphEnter = (range, selection) => {
    const currentNode = range.startContainer;
    const parentNode = currentNode.parentNode;
    const cursorOffset = range.startOffset;
  
    if (currentNode.nodeType === Node.TEXT_NODE) {
      if (cursorOffset === 0) {
        // Cursor at the beginning: insert a new paragraph before
        const newPara = document.createElement('p');
        newPara.innerHTML = '&#160;'; // Non-breaking space
        parentNode.parentNode.insertBefore(newPara, parentNode);
        range.setStart(newPara, 0);

        range.collapse(true);
        this.updateEnterSelection(range); 
      } else if (cursorOffset === currentNode.length) {
        // Cursor at the end: insert a new paragraph after (existing logic)
        const newPara = document.createElement('p');
        newPara.innerHTML = '&#160;'; // Non-breaking space
        if (parentNode.nextSibling) {
          parentNode.parentNode.insertBefore(newPara, parentNode.nextSibling);
        } else {
          parentNode.parentNode.appendChild(newPara);
        }
        range.setStart(newPara, 0);
      } else {
        this.handleDefaultEnter(range, selection)
      }
    } else {
      this.handleDefaultEnter(range, selection)
    }
  }
  

  handleDefaultEnter(range, selection) {
    // Cursor is between contents, insert <br> manually
    const br = document.createElement("br");
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    this.updateEnterSelection(range); 
  }


  // start paste

  getPasteFormatting() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    let node = selection.getRangeAt(0).commonAncestorContainer;
    while (node && node !== this.editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const nodeName = node.nodeName.toLowerCase();
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'].includes(nodeName)) {
          return nodeName;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  handlePaste(e) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentFormatting = this.getPasteFormatting();

    range.deleteContents();

    if (currentFormatting === null || currentFormatting === 'body') {
      this.insertAsParagraph(text, range);
    } else {
      this.insertAsPlainText(text, range);
    }

    this.updatePlaceholder();
    this.mutationHandler.saveState();
  }

  insertAsParagraph(text, range) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    range.insertNode(paragraph);
    this.setSelectionAfter(paragraph);
  }

  insertAsPlainText(text, range) {
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    this.setSelectionAfter(textNode);
  }

  setSelectionAfter(node) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // End paste




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

    // count words
    this.countWords(e);
  }

  handleInput(e) {
    this.updatePlaceholder();
    this.countWords(e);
  }

  updatePlaceholder() {
    if (this.editor.textContent.trim().length === 0) {
      this.editor.classList.remove('not-empty');
    } else {
      this.editor.classList.add('not-empty');
    }
  }

  countWords(e) {
    const text = e.target.textContent;

    // remove extra spaces and tags and split the text into words
    const words = text.replace(/\s+/g, ' ').trim().split(' ');

    // remove empty strings and count length
    const totalWords = words.filter(word => word.length > 0).length;

    // update count element
    this.count.textContent = `${totalWords} ${totalWords === 1 ? 'word' : 'words'}`
  }

  setupSelectionListener() {
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (this.editor.contains(range.commonAncestorContainer)) {
          this.lastSelection = range.cloneRange();
        }
      }
    });
  }

  updateSelection(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  setupTextToolbarListeners() {
    if (this.textToolbars) {
      this.textToolbars.querySelectorAll('span.tool').forEach(tool => {
        tool.addEventListener('click', () => this.handleTextToolClick(tool));
      });
    }
  }

  setupHeadingToolbarListeners() {
    if (this.headingToolbars) {
      this.headingToolbars.querySelectorAll('span.tool').forEach(tool => {
        tool.addEventListener('click', () => this.handleHeadingToolClick(tool));
      });
    }
  }

  setupListToolbarListeners() {
    if (this.listToolbars) {
      this.listToolbars.querySelectorAll('span.tool').forEach(tool => {
        tool.addEventListener('click', () => this.handleListToolClick(tool));
      });
    }
  }

  setupAlignmentToolbarListeners() {
    if (this.alignmentToolbars) {
      this.alignmentToolbars.querySelectorAll('span.tool').forEach(tool => {
        tool.addEventListener('click', () => this.handleAlignmentToolClick(tool));
      });
    }
  }

  handleTextToolClick(tool) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = this.lastSelection || selection.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;

    selection.removeAllRanges();
    selection.addRange(range);

    const command = tool.getAttribute('data-command');
    switch (command) {
      case 'bold':
        this.toggleInlineStyle('strong');
        break;
      case 'underline':
        this.toggleInlineStyle('u');
        break;
      case 'italic':
        this.toggleInlineStyle('em');
        break;
      case 'strike':
        this.toggleInlineStyle('s');
        break;
      case 'link':
        this.createLink();
        break;
      case 'quote':
        this.toggleBlock('blockquote');
        break;
      case 'code':
        this.toggleInlineStyle('code');
        break;
    }
    this.mutationHandler.saveState();
  }

  handleHeadingToolClick(tool) {
    const command = tool.getAttribute('data-command');
    this.toggleBlock(command);
    this.mutationHandler.saveState();
  }

  handleListToolClick(tool) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = this.lastSelection || selection.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;

    selection.removeAllRanges();
    selection.addRange(range);

    const command = tool.getAttribute('data-command');
    const listType = command === 'unordered' ? 'ul' : 'ol';
    this.toggleList(listType);
    this.mutationHandler.saveState();
  }

  handleAlignmentToolClick(tool) {
    const command = tool.getAttribute('data-command');
    this.setAlignment(command);
    this.mutationHandler.saveState();
  }

  toggleInlineStyle(tag) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;

    const alreadyApplied = this.isStyleApplied(tag, range);

    if (alreadyApplied) {
      this.removeStyle(tag, range);
    } else {
      const element = document.createElement(tag);
      if (range.collapsed) {
        element.appendChild(document.createTextNode('\u200B')); // Zero-width space
        range.insertNode(element);
        range.setStart(element.firstChild, 1);
      } else {
        element.appendChild(range.extractContents());
        range.insertNode(element);
      }
    }

    selection.removeAllRanges();
    selection.addRange(range);
    this.lastSelection = range.cloneRange();
  }

  isStyleApplied(tag, range) {
    const parentElement = range.commonAncestorContainer.nodeType === 3
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;
    return parentElement.closest(tag) !== null;
  }

  removeStyle(tag, range) {
    const parentElement = range.commonAncestorContainer.nodeType === 3
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;
    const styledElement = parentElement.closest(tag);
    if (styledElement) {
      const fragment = document.createDocumentFragment();
      while (styledElement.firstChild) {
        fragment.appendChild(styledElement.firstChild);
      }
      styledElement.parentNode.replaceChild(fragment, styledElement);
    }
  }

  createLink() {
    const url = prompt('Enter the URL:');
    if (url) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = url;
        link.appendChild(range.extractContents());
        range.insertNode(link);
      }
    }
  }

  toggleBlock(tag) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let block = range.commonAncestorContainer;
      while (block && block.nodeType !== 1) {
        block = block.parentNode;
      }

      if (block && block.tagName.toLowerCase() === tag) {
        // If already in the desired block, unwrap it
        while (block.firstChild) {
          block.parentNode.insertBefore(block.firstChild, block);
        }
        block.parentNode.removeChild(block);
      } else {
        // Wrap in the desired block
        const newBlock = document.createElement(tag);
        range.surroundContents(newBlock);
      }
    }
  }

  toggleList(listType) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let block = range.commonAncestorContainer;
      while (block && block.nodeType !== 1) {
        block = block.parentNode;
      }

      let list;
      if (block && (block.tagName === 'UL' || block.tagName === 'OL')) {
        // If already in a list, unwrap it
        while (block.firstChild) {
          block.parentNode.insertBefore(block.firstChild, block);
        }
        block.parentNode.removeChild(block);
        // Set focus to the first unwrapped element
        this.updateSelection(block.parentNode);
      } else {
        // Wrap in a new list
        list = document.createElement(listType);
        const listItem = document.createElement('li');
        if (block && block.parentNode === this.editor) {
          // If the block is a direct child of the editor, wrap it in a list item
          listItem.appendChild(block.cloneNode(true));
          list.appendChild(listItem);
          block.parentNode.replaceChild(list, block);
        } else {
          // Otherwise, wrap the selected content in a list item
          listItem.appendChild(range.extractContents());
          list.appendChild(listItem);
          range.insertNode(list);
        }
        this.updateSelection(list);
      }
    }
  }

  setAlignment(alignment) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let block = range.commonAncestorContainer;
      while (block && block.nodeType !== 1) {
        block = block.parentNode;
      }

      if (block) {
        block.style.textAlign = alignment;
      }
    }
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