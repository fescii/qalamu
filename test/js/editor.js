document.addEventListener("DOMContentLoaded", function () {
  // Get the editable div
  const editor = document.querySelector(".editor");
  const section = document.querySelector("section.container");
  const placeholder = section.querySelector("p.placeholder");

  // Define redo and undo stacks and a variable to keep track of the current action
  const undoStack = [];
  const redoStack = [];
  let isUndoRedoAction = false;

  // Save the initial state in the undo stack (clone the initial state)
  const initialContent = editor.innerHTML;

  // clone the initial state
  undoStack.push([{ type: 'childList', target: editor, oldValue: initialContent, addedNodes: [], removedNodes: [] }]);

  // Create a new MutationObserver to observe changes in the editable content
  const observer = new MutationObserver((mutations) => {
    if (!isUndoRedoAction) {
      const snapshot = storeMutations(mutations);
      undoStack.push(snapshot);
      redoStack.length = 0; // Clear the redo stack on new changes

      // Log the undo and redo stack
      console.log('Undo Stack:', undoStack);
      console.log('Redo Stack:', redoStack);
    }
  });

  // Observe changes in the editable content
  observer.observe(editor, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    attributeOldValue: true
  });


  // Handle key press events
  let firstKeypress = true;

  // Handle key press events
  editor.addEventListener("keypress", (e) => {
    // e.preventDefault();

    // Check if it's the first key press and remove the placeholder
    if (firstKeypress) {
      if (placeholder) {
        placeholder.classList.add("inactive");
      }
      firstKeypress = false;

      // Create a new paragraph element and append it to the editor
      const paragraph = document.createElement("p");
      paragraph.textContent = "\u200B"; // Add a zero-width space to make the paragraph focusable
      editor.appendChild(paragraph);

      // Set the cursor at the beginning of the paragraph
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(paragraph, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      editor.focus();
    }

    // Check if the current key press is Enter
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default new line behavior

      // get the current formatting of the selected text
      const currentFormatting = getCurrentFormatting();

      // Check is formatting is ordered list or unordered list
      if (currentFormatting === "ol" || currentFormatting === "ul") {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const currentLi = getContainingLi(range.startContainer);
          if (currentLi) {
            const newLi = document.createElement("li");
            newLi.textContent = "\u200B"; // Zero-width space for focusability
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
      } else if (currentFormatting === "p") {
        // Get the range and selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Get the node where the cursor is positioned
        const currentNode = range.startContainer;

        // If the cursor is inside a text node, check its position within the <p> element
        const cursorOffset = range.startOffset;
        const nodeLength = currentNode.length;

        // console.log("Cursor Offset:", cursorOffset);
        // console.log("Node Length:", nodeLength);
        // console.log("Current Node:", currentNode);

        const isBlock = isBlockElement(currentNode.nextSibling);

        // console.log("Is Block Element:", isBlock);

        // Check if the cursor is at the end of the node and the node is block element
        if (cursorOffset === nodeLength && isBlock) {
          // Check if there is next sibling
          const nextSibling = currentNode.nextSibling;

          // console.log("cursor is at the end of the text node");
          // If the cursor is at the end of the text node, insert a new paragraph element
          const paragraph = document.createElement("p");
          paragraph.textContent = "\u200B"; // Zero-width space for focusability
          editor.insertBefore(paragraph, nextSibling);
          range.setStart(paragraph, 0);
          range.collapse(true);
          editor.focus();
        }
        else {
          // console.log("Cursor is not at the end of the text node");
          // Cursor is between contents, insert <br> manually
          const br = document.createElement("br");
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      else {
        // console.log("Cursor is not inside a block element");
        const range = window.getSelection().getRangeAt(0);
        const brElement = document.createElement("br");
        range.insertNode(brElement);
        range.setStart(brElement, 0);
        range.collapse(false); // Move cursor to the next line
      }
    }
  });

  // Check if a node is a block element
  const isBlockElement = (node) => {
    // Check if a node is not null
    if (!node) return true;

    return ['address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'].includes(
      node.nodeName.toLowerCase()
    );
  };

  // handle paste event, and remove place holder accordingly
  editor.addEventListener("paste", (e) => {
    // Prevent the default paste behavior
    e.preventDefault();

    // Get the text content of the clipboard as plain text
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");

    // Get the current selection and range
    const selection = window.getSelection(); // Get the current selection
    const range = selection.getRangeAt(0); // Get the range of the selection

    // Check for the current formatting
    currentFormatting = getCurrentFormatting();

    // Delete the selected content (if any)
    range.deleteContents();

    // If current formatting is a null value, create a new paragraph element
    if (currentFormatting === null) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;

      // Insert the <p> element containing the pasted text at the cursor position
      range.insertNode(paragraph);

      // Move the cursor to the end of the inserted <p> element
      range.setStartAfter(paragraph);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Create a text node with the clipboard text and insert it into the range
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Move cursor to the end of the pasted content
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Check if it's the first key press and hide the placeholder
    if (firstKeypress) {
      placeholder.classList.add("inactive");
      firstKeypress = false;
    }
  });

  // Handle blur event
  editor.addEventListener("blur", function () {
    // Get the textContent of the editor
    const editorContent = editor.textContent.trim();

    // Check the length of the textContent
    if (editorContent.length <= 1) {
      // Show placeholder
      placeholder.classList.remove("inactive");

      firstKeypress = true;
    }
  });

  // handle keydown event
  editor.addEventListener("keydown", (e) => {
    // Prevent default browser behavior for Ctrl+B, Ctrl+I, Ctrl+U
    if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key.toLowerCase())){
      e.preventDefault();

      const key = e.key.toLowerCase();

      // Get the command for the formatting
      const command = key === "b" ? "strong" : key === "i" ? "em" : "u";

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Get the first node and the last node of the selection
      const startNode = range.startContainer;
      const endNode = range.endContainer;

      console.log('Start Node:', startNode);
      console.log('End Node:', endNode);

      // Check if the selection is empty
      if (!range.toString().trim()) return;

      // Get the start and end containers and offsets of the range
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      // If the format is already applied to the node or the child nodes remove them
      const nodesInRange = traverseNodes(range, command, startContainer, endContainer);

      // Remove formatting from the selected nodes
      const removed = removeFormatting(nodesInRange, command, range, selection);

      // Check if the selection spans across multiple nodes
      if (startContainer === endContainer) {

        // Check if the formatting was removed
        if (removed) {
          // Clear the selection after removing formatting
          selection.removeAllRanges();
        }
        else {
          // Apply formatting to the selected text
          applyFormatToSelection(command, range);

          // Clear the selection after applying formatting
          selection.removeAllRanges();
        }
      }
      else {
        // Apply formatting surrounding the selected area
        applyFormatToSelection(command, range);

        selection.removeAllRanges();
      }

      firstKeypress = false; // Consider a keydown as a keypress for placeholder removal
    }

    // Handle undo, and redo combinations: Undo - ctrl+z or cmd+z, Redo - ctrl+y or cmd+y
    else if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
      e.preventDefault();

      // Check if undo combination is pressed
      if (e.key.toLowerCase() === 'z') {
        undo();
      }

      // Check if redo combination is pressed
      else if (e.key.toLowerCase() === 'y') {
        redo();
      }

      // Change the isUndoRedoAction to false
      isUndoRedoAction = false;
    }
  });

  // apply formatting to the selected text
  const applyFormatToSelection = (command, range) => {
    // Create the corresponding element for the formatting command
    const element = document.createElement(command);

    const selectedContent = range.extractContents();
    element.appendChild(selectedContent);

    // Replace the selected content with the formatted element
    range.deleteContents();
    range.insertNode(element);
  };

  // Helper function for recursive traversal
  const traverseNodes = (range, command, startContainer, endContainer) => {

    // Check if start and end containers are the same and it's a text node
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      const parentElement = startContainer.parentNode;

      // Check if the parent element is a <command> and it contains only one text node
      if (parentElement.tagName.toLowerCase() === command && parentElement.childNodes.length === 1 && parentElement.firstChild === startContainer) {
        return [parentElement]; // Include the <strong> element
      }
    }

    // Create an array to hold the nodes
    const nodes = [];

    // Create a tree walker to traverse the common ancestor container
    const treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ALL, {
      acceptNode: node => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    }, false);

    while (treeWalker.nextNode()) {
      nodes.push(range.commonAncestorContainer, treeWalker.currentNode);
    }

    // log common ancestor container
    console.log('Common Ancestor Container:', range.commonAncestorContainer);

    // log common ancestor container parent node
    console.log('Common Ancestor Container Parent Node:', range.commonAncestorContainer.parentNode);

    return nodes;
  }

  // Node formatting removal without affecting the selection range
  const removeNodeFormatting = (selection, range, targetNode) => {
    // create an array to hold ranges of the selected nodes
    const ranges = [];
    const rangeCount = selection.rangeCount;

    // Split the section into multiple ranges if the selection spans across multiple nodes
    let i = 0;
    for (i; i < rangeCount; i++) {
      const range = selection.getRangeAt(i);
      // Skip ranges that don't intersect with the target node
      if (!range.intersectsNode(targetNode)) continue;
    }

    // Split the range into two: before and after the target node
    const beforeRange = document.createRange();
    beforeRange.setStart(range.startContainer, range.startOffset);
    beforeRange.setEnd(targetNode, 0);

    const afterRange = document.createRange();
    afterRange.setStart(targetNode, 0);
    afterRange.setEnd(range.endContainer, range.endOffset);

    // Add the ranges to the array
    ranges.push(beforeRange, afterRange);

    // Replace the target node with its child nodes
    while (targetNode.firstChild) {
      targetNode.parentNode.insertBefore(targetNode.firstChild, targetNode);
    }

    // Remove the target node if it's not nul
    if (targetNode.parentNode) {
      targetNode.parentNode.removeChild(targetNode);
    }

    // Restore the selection with the modified ranges
    selection.removeAllRanges();
    ranges.forEach(range => selection.addRange(range));
  }

  // Removing formatting from the selected nodes
  const removeFormatting = (nodes, command, range, selection) => {
    const targetElements = nodes.filter(
      (node) => node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === command
    );

    if (targetElements.length > 0) {
      // Directly remove each target element, leaving its child nodes intact
      for (const element of targetElements) {
        // Remove the node formatting
        removeNodeFormatting(selection, range, element);
      }

      // log the target elements
      console.log('Target Elements:', targetElements);

      // Return true if the formatting was removed
      return true;
    }
    else {
      // Return false if no formatting was removed
      return false;
    }
  }

  // Function to store mutations
  const storeMutations = mutations => {
    const snapshot = mutations.map(mutation => {
      if (mutation.type === 'characterData') {
        return {
          type: 'characterData',
          target: mutation.target,
          oldValue: mutation.oldValue,
          newValue: mutation.target.data
        };
      } else if (mutation.type === 'childList') {
        return {
          type: 'childList',
          target: mutation.target,
          addedNodes: Array.from(mutation.addedNodes),
          removedNodes: Array.from(mutation.removedNodes)
        };
      }
      return null;
    });
    return snapshot;
  }

  // Function to apply mutations
  const applyMutations = (mutations, undo = false) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'characterData') {
        if (undo) {
          console.log('Old Value:', mutation.oldValue);
          mutation.target.data = mutation.oldValue;
        } else {
          mutation.target.data = mutation.newValue;
        }
      } else if (mutation.type === 'childList') {
        if (undo) {
          mutation.addedNodes.forEach(node => node.remove());
          mutation.removedNodes.forEach(node => mutation.target.appendChild(node));
        } else {
          mutation.removedNodes.forEach(node => node.remove());
          mutation.addedNodes.forEach(node => mutation.target.appendChild(node));
        }
      }
    });
  }

  // Function to undo the last action
  const undo = () => {
    if (undoStack.length > 1) {
      const mutations = undoStack.pop();
      redoStack.push(mutations);
      isUndoRedoAction = true;
      applyMutations(mutations, true);
      // isUndoRedoAction = false;
    }
  }

  // Function to redo the last action
  const redo = () => {
    if (redoStack.length > 0) {
      const mutations = redoStack.pop();
      undoStack.push(mutations);
      isUndoRedoAction = true;
      applyMutations(mutations, false);
      // isUndoRedoAction = false;
    }
  }



  // Handle button clicks to insert HTML tags
  const buttons = document.querySelectorAll(".toolbar button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.getAttribute("data-command");
      const value = this.getAttribute("data-value");
      if (command) {
        currentFormatting = button.dataset.node; // Update currentFormatting variable
        if (command === "insertHTML" && value) {
          // Create range variable
          const range = window.getSelection().getRangeAt(0);

          // Get the selected text (if any)
          const selectedText = window.getSelection().toString();

          if (selectedText) {
            // Wrap the selected text with a pre element containing a code element
            document.execCommand(
              "insertHTML",
              false,
              `<pre><code>${selectedText}</code></pre>`
            );
          } else {
            // If no text is selected, insert an empty pre element with a code element
            const preElement = document.createElement("pre");
            const codeElement = document.createElement("code");
            preElement.appendChild(codeElement);
            range.insertNode(preElement);
          }
        } else {
          document.execCommand(command, false, null);
        }
        firstKeypress = false; // Consider a button click as a keypress for placeholder removal
      }
    });
  });

  // Get the containing LI element
  const getContainingLi = (node) => {
    while (node && node.nodeName !== "LI") {
      node = node.parentNode;
    }
    return node;
  };

  // Get the current formatting of the selected text
  const getCurrentFormatting = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let parentNode = range.commonAncestorContainer;
      while (parentNode && parentNode.parentNode !== editor) {
        parentNode = parentNode.parentNode;
      }
      if (parentNode && parentNode.nodeName !== "EDITOR") {
        return parentNode.nodeName.toLowerCase();
      }
    }
    return null; // No specific formatting found
  };

  // Handle input events
  const handleInput = (e) => {
    // const editorContent = editor.innerHTML.trim(); // Get the trimmed HTML content of the editor

    // Strip all html tags and check if the content is empty
    const editorContent = editor.textContent.trim(); // Get the trimmed text content of the editor

    // Get the current selection and range
    const selection = window.getSelection(); // Get the current selection
    const outerRange = selection.getRangeAt(0); // Get the range of the selection

    // For debugging purposes
    // console.log(`
    //   Content: ${editorContent} -
    // 	Length: ${editorContent.length} -
    // 	Start: ${outerRange.startOffset} -
    // 	End: ${outerRange.endOffset}
    // `);

    // get content length
    const contentLength = editorContent.length;

    // Check if content was deleted and the deletion reached the end
    if (
      contentLength <= 1 &&
      outerRange.startOffset < 5 &&
      outerRange.endOffset < 5
    ) {
      // Clear editor contents
      editor.innerHTML = "";

      // Show placeholder
      placeholder.classList.remove("inactive");
      firstKeypress = true;

      // Create a new paragraph element and append it to the editor
      const paragraph = document.createElement("p");
      // console.log(editorContent, outerRange.startOffset, outerRange.endOffset);
      paragraph.textContent = "\u200B"; // Add a zero-width space to make the paragraph focusable
      editor.appendChild(paragraph);

      console.log(paragraph);
      // Set the cursor at the beginning of the paragraph
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(paragraph, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      editor.focus();
    }
  };

  // Handle input events
  editor.addEventListener("input", (e) => {
    // const key = e.key; // const {key} = event; ES6+
    // if (key === "Backspace" || key === "Delete") {
    // 	handleInput(e);
    // }

    handleInput(e);
  });
});
