const payload = {
  data: [
    'A->B', 'A->C', 'B->D', 'C->E', 'E->F',
    'X->Y', 'Y->Z', 'Z->X',
    'P->Q', 'Q->R',
    'G->H', 'G->H', 'G->I',
    'hello', '1->2', 'A->'
  ]
};

async function run() {
  const response = await fetch('http://localhost:3000/bfhl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.assert(response.status === 200, 'Expected HTTP 200');
  const json = await response.json();

  console.assert(json.user_id === 'karthikcherukuru_11052005', 'Incorrect user_id');
  console.assert(json.email_id === 'karthik_cherukuru@srmap.edu.in', 'Incorrect email_id');
  console.assert(json.college_roll_number === 'AP23110010658', 'Incorrect college_roll_number');

  console.assert(Array.isArray(json.hierarchies), 'hierarchies must be an array');
  console.assert(Array.isArray(json.invalid_entries), 'invalid_entries must be an array');
  console.assert(Array.isArray(json.duplicate_edges), 'duplicate_edges must be an array');
  console.assert(typeof json.summary === 'object', 'summary must be an object');

  const roots = json.hierarchies.map((h) => h.root);
  console.assert(JSON.stringify(roots) === JSON.stringify(['A', 'G', 'P', 'X']), 'Unexpected hierarchy roots');

  const byRoot = Object.fromEntries(json.hierarchies.map((h) => [h.root, h]));

  console.assert(byRoot.A.depth === 4, 'A depth should be 4');
  console.assert(byRoot.G.depth === 2, 'G depth should be 2');
  console.assert(byRoot.P.depth === 3, 'P depth should be 3');
  console.assert(byRoot.X.has_cycle === true, 'X should be cyclic');
  console.assert(!('depth' in byRoot.X), 'Cycle entry must not include depth');
  console.assert(!('has_cycle' in byRoot.A), 'Tree entry must not include has_cycle');

  console.assert(
    JSON.stringify(byRoot.A.tree) === JSON.stringify({ A: { B: { D: {} }, C: { E: { F: {} } } } }),
    'Unexpected tree shape for A'
  );
  console.assert(
    JSON.stringify(byRoot.G.tree) === JSON.stringify({ G: { H: {}, I: {} } }),
    'Unexpected tree shape for G'
  );
  console.assert(
    JSON.stringify(byRoot.P.tree) === JSON.stringify({ P: { Q: { R: {} } } }),
    'Unexpected tree shape for P'
  );
  console.assert(
    JSON.stringify(byRoot.X.tree) === JSON.stringify({}),
    'Cycle tree must be empty object'
  );

  console.assert(
    JSON.stringify(json.invalid_entries) === JSON.stringify(['hello', '1->2', 'A->']),
    'Unexpected invalid_entries'
  );
  console.assert(
    JSON.stringify(json.duplicate_edges) === JSON.stringify(['G->H']),
    'Unexpected duplicate_edges'
  );
  console.assert(new Set(json.duplicate_edges).size === json.duplicate_edges.length, 'duplicate_edges must be unique');

  console.assert(json.summary.total_trees === 3, 'summary.total_trees must be 3');
  console.assert(json.summary.total_cycles === 1, 'summary.total_cycles must be 1');
  console.assert(json.summary.largest_tree_root === 'A', 'summary.largest_tree_root must be A');

  console.log('All assertions passed.');
}

run().catch((error) => {
  console.error('Test execution failed:', error.message);
  process.exit(1);
});
