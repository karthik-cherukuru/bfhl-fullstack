function buildHierarchies(validEdges) {
  const childrenMap = {};
  const childParentMap = {};
  const allNodes = new Set();

  for (const { parent, child } of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);

    if (Object.prototype.hasOwnProperty.call(childParentMap, child)) {
      continue;
    }

    childParentMap[child] = parent;
    if (!childrenMap[parent]) {
      childrenMap[parent] = [];
    }
    childrenMap[parent].push(child);
  }

  const nodesWithParent = new Set(Object.keys(childParentMap));
  const roots = [...allNodes].filter((node) => !nodesWithParent.has(node));

  const undirected = {};
  for (const node of allNodes) {
    undirected[node] = new Set();
  }

  for (const [child, parent] of Object.entries(childParentMap)) {
    undirected[parent].add(child);
    undirected[child].add(parent);
  }

  const visited = new Set();
  const components = [];

  for (const node of allNodes) {
    if (visited.has(node)) {
      continue;
    }

    const component = new Set();
    const queue = [node];

    while (queue.length > 0) {
      const current = queue.shift();
      if (component.has(current)) {
        continue;
      }

      component.add(current);
      visited.add(current);

      for (const neighbor of undirected[current] || []) {
        if (!component.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    components.push([...component]);
  }

  const hierarchies = [];

  for (const component of components) {
    const componentRoots = component.filter((node) => roots.includes(node));
    const root = componentRoots.length > 0
      ? [...componentRoots].sort()[0]
      : [...component].sort()[0];

    const componentSet = new Set(component);
    const hasCycle = detectCycle(root, childrenMap, new Set(), new Set(), componentSet);

    if (hasCycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = buildTree(root, childrenMap, componentSet);
      const depth = calcDepth(root, childrenMap, componentSet);
      hierarchies.push({ root, tree, depth });
    }
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  return hierarchies;
}

function detectCycle(node, childrenMap, visiting, visited, componentSet) {
  if (!componentSet.has(node)) {
    return false;
  }

  if (visiting.has(node)) {
    return true;
  }

  if (visited.has(node)) {
    return false;
  }

  visiting.add(node);
  const children = childrenMap[node] || [];
  for (const child of children) {
    if (!componentSet.has(child)) {
      continue;
    }
    if (detectCycle(child, childrenMap, visiting, visited, componentSet)) {
      return true;
    }
  }

  visiting.delete(node);
  visited.add(node);
  return false;
}

function buildTree(node, childrenMap, componentSet) {
  const children = (childrenMap[node] || []).filter((child) => componentSet.has(child));
  const result = {};

  for (const child of children) {
    result[child] = buildTree(child, childrenMap, componentSet)[child];
  }

  return { [node]: result };
}

function calcDepth(node, childrenMap, componentSet) {
  const children = (childrenMap[node] || []).filter((child) => componentSet.has(child));
  if (children.length === 0) {
    return 1;
  }

  return 1 + Math.max(...children.map((child) => calcDepth(child, childrenMap, componentSet)));
}

module.exports = { buildHierarchies };
