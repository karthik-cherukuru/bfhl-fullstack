function buildSummary(hierarchies) {
  const nonCyclic = hierarchies.filter((entry) => !entry.has_cycle);
  const cyclic = hierarchies.filter((entry) => entry.has_cycle);

  const total_trees = nonCyclic.length;
  const total_cycles = cyclic.length;

  let largest_tree_root = '';
  if (nonCyclic.length > 0) {
    const sorted = [...nonCyclic].sort((a, b) => {
      if (b.depth !== a.depth) {
        return b.depth - a.depth;
      }
      return a.root.localeCompare(b.root);
    });
    largest_tree_root = sorted[0].root;
  }

  return { total_trees, total_cycles, largest_tree_root };
}

module.exports = { buildSummary };
