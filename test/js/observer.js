"use strict";

class MutationHandler {
  static redoMutations(undidMutations) {
    if (undidMutations) for (let i = undidMutations.length | 0, record, type, target, addedNodes, removedNodes, nextSibling, value; i;) {
      record = undidMutations[i = i - 1 | 0];
      type = record.type;
      target = record.target;
      if (type === "childList") {
        addedNodes = record.addedNodes;
        removedNodes = record.removedNodes;
        nextSibling = record.nextSibling;

        for (let k = removedNodes.length | 0; k; k = k + 1 | 0) {
          target.removeChild(removedNodes[k]);
        }
        for (let k = 0, len = addedNodes.length | 0; k < len; k = k + 1 | 0) {
          target.insertBefore(addedNodes[k], nextSibling);
        }
      } else {
        value = record.newValue;

        if (type === "characterData") {
          target.data = value;
        }

        if (type === "attributes") {
          target.setAttribute(record.attributeName, value);
        }
      }
    }
  }

  static undoMutations(undidMutations) {
    if (undidMutations) for (let i = 0, len = undidMutations.length | 0, record, type, target, addedNodes, removedNodes, nextSibling, value; i < len; i = i + 1 | 0) {
      record = undidMutations[i];
      type = record.type;
      target = record.target;
      if (type === "childList") {
        addedNodes = record.addedNodes;
        removedNodes = record.removedNodes;
        nextSibling = record.nextSibling;

        for (let k = removedNodes.length | 0; k; k = k + 1 | 0) {
          target.insertBefore(removedNodes[k], nextSibling);
        }
        for (let k = 0, len = addedNodes.length | 0; k < len; k = k + 1 | 0) {
          target.removeChild(addedNodes[k]);
        }
      } else {
        value = record.oldValue;

        if (type === "characterData") {
          target.data = value;
        }

        if (type === "attributes") {
          target.setAttribute(record.attributeName, value);
        }
      }
    }
  }

  static addNewValuePropertyToMutationRecords(mutationRecords) {
    if (mutationRecords.length === 1) {
      let record = mutationRecords[0];
      if (record.type === "attributes") {
        record.newValue = record.target.getAttributeNS(record.attributeNamespace, record.attributeName);
      }
      if (record.type === "characterData") {
        record.newValue = record.target.data;
      }
    } else {
      let attributeValuesMap = new WeakMap();

      for (let i = mutationRecords.length | 0, record, obj, target, attrName; i > 0; i = i - 1 | 0) {
        record = mutationRecords[i];
        if (record.type === "attributes" || record.type === "characterData") {
          target = record.target;
          obj = attributeValuesMap.get(target);

          if (!obj) attributeValuesMap.set(target, (obj = {}));

          attrName = record.attributeName;

          record.newValue = obj[attrName] || target.getAttributeNS(record.attributeNamespace, attrName);

          obj[attrName] = target.oldValue;
        }
      }
      Object.freeze(record);
    }
    Object.freeze(mutationRecords);

    return mutationRecords;
  }
}

// Export the class
export default MutationHandler;