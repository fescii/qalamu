document.addEventListener("DOMContentLoaded", function () {
  // Get the editable div
  const editor = document.querySelector(".editor");
  const section = document.querySelector("section.container");
  const placeholder = section.querySelector("p.placeholder");

  // Handle key press events
  let firstKeypress = true;
  let currentFormatting = "p";

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
      currentFormatting = getCurrentFormatting();

      console.log(currentFormatting);

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

        // get the parent node of the text node
        const parentNode = currentNode.parentNode;

        // If the cursor is inside a text node, check its position within the <p> element
        const cursorOffset = range.startOffset;
        const nodeLength = currentNode.length;

        // Check if the cursor is at the end of the text node and the next node is not br element
        if (cursorOffset === nodeLength) {
          // Check if there is next sibling
          const nextSibling = currentNode.nextSibling;

          console.log("cursor is at the end of the text node");
          // If the cursor is at the end of the text node, insert a new paragraph element
          const paragraph = document.createElement("p");
          paragraph.textContent = "\u200B"; // Zero-width space for focusability
          editor.insertBefore(paragraph, nextSibling);
          range.setStart(paragraph, 0);
          range.collapse(true);
          editor.focus();
        } else {
          console.log("Cursor is not at the end of the text node");
          // Cursor is between contents, insert <br> manually
          const br = document.createElement("br");
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        console.log("Cursor is not inside a block element");
        const range = window.getSelection().getRangeAt(0);
        const brElement = document.createElement("br");
        range.insertNode(brElement);
        range.setStart(brElement, 0);
        range.collapse(false); // Move cursor to the next line
      }
    }
  });

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

      // Get the start and end containers and offsets of the range
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      // console.log('Start Container:', startContainer);
      // console.log('End Container:', endContainer);

      // Check if the selection spans across multiple nodes
      if (startContainer === endContainer) {
        console.log('Selection is within the same node');
        // Create the corresponding element for the formatting command
        const element = document.createElement(command);

        // Apply formatting directly to the selected text using range and selection
        element.textContent = range.toString(); // Set the content of the element to the selected text

        // Replace the selected content with the formatted element
        range.deleteContents();
        range.insertNode(element);

        // Move the selection to cover the newly inserted element
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      else {
        console.log('Selection spans across multiple nodes');
        // Iterate over each node within the selection range and apply underline to text nodes
        const nodesInRange = [];
        let currentNode = startContainer;

        // Iterate over each node within the selection range
        while (currentNode) {
          // breaks the loop if the current node is equal to the end container
          if (currentNode.isSameNode(endContainer)) break;

          // Check if the current node is a text node
          if (currentNode.nodeType === Node.TEXT_NODE) {
            nodesInRange.push(currentNode);
          }
          else {
            // Apply formatting to the current node
            const newRange = document.createRange();
            newRange.selectNodeContents(currentNode);
            // selection.removeAllRanges();

            // apply formatting to the text node
            applyFormatToSelection(command, newRange);
          }
          currentNode = currentNode.nextSibling;
        }

        // Add the last node to the array
        nodesInRange.push(endContainer);

        // for debugging purposes
        console.log('Nodes in range:', nodesInRange);

        // Apply formatting to each text node within the selection range
        nodesInRange.forEach((node, index) => {
          // Check if node.textContent is empty
          if (!node.textContent.trim()) return;

          const start = index === 0 ? startOffset : 0;
          const end = index === nodesInRange.length - 1 ? endOffset : node.length;
          applyPartialFormatTextNode(command, node, start, end)
        });

        // Clear the selection after applying formatting
        selection.removeAllRanges();
      }





      // const selection = window.getSelection();
      // const range = selection.getRangeAt(0);

      // const command = e.key === "b" ? "strong" : e.key === "i" ? "em" : "u";

      

      firstKeypress = false; // Consider a keydown as a keypress for placeholder removal
    }
  });

  // Helper function to apply formatting to the selected text
  const applyPartialFormatTextNode = (command, node, start, end) => {
    const text = node.textContent;
    const textBeforeSelection = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const textAfterSelection = text.substring(end);

    console.log('selected text:', selectedText);

    // Create command element to wrap the text parts
    const textBeforeNode = document.createTextNode(textBeforeSelection);
    const selectedTextNode = document.createElement(command);
    selectedTextNode.textContent = selectedText;
    const textAfterNode = document.createTextNode(textAfterSelection);

    // Replace the original node with the wrapped parts
    node.replaceWith(textBeforeNode, selectedTextNode, textAfterNode);
  };

  // apply formatting to the selected text
  const applyFormatToSelection = (command, range) => {
    // Create the corresponding element for the formatting command
    const element = document.createElement(command);

    // Apply formatting directly to the selected text using range and selection
    element.textContent = range.toString(); // Set the content of the element to the selected text

    // Replace the selected content with the formatted element
    range.deleteContents();
    range.insertNode(element);

    // Move the selection to cover the newly inserted element
    // range.selectNodeContents(element);
    // selection.removeAllRanges();
    // selection.addRange(range);
  };

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
