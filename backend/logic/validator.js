function validateAndSeparate(data) {
  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const addedToDuplicates = new Set();

  const validPattern = /^[A-Z]->[A-Z]$/;

  for (const entry of data) {
    const trimmed = typeof entry === 'string' ? entry.trim() : String(entry).trim();

    if (!validPattern.test(trimmed)) {
      invalidEntries.push(entry);
      continue;
    }

    const [parent, child] = trimmed.split('->');

    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    const edgeKey = `${parent}->${child}`;

    if (seenEdges.has(edgeKey)) {
      if (!addedToDuplicates.has(edgeKey)) {
        duplicateEdges.push(edgeKey);
        addedToDuplicates.add(edgeKey);
      }
    } else {
      seenEdges.add(edgeKey);
      validEdges.push({ parent, child });
    }
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

module.exports = { validateAndSeparate };
