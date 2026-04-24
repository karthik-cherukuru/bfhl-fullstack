const express = require('express');
const { validateAndSeparate } = require('../logic/validator');
const { buildHierarchies } = require('../logic/treeBuilder');
const { buildSummary } = require('../logic/summarizer');

const router = express.Router();

router.post('/', (req, res) => {
  const { data } = req.body || {};

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'data must be an array' });
  }

  const { validEdges, invalidEntries, duplicateEdges } = validateAndSeparate(data);
  const hierarchies = buildHierarchies(validEdges);
  const summary = buildSummary(hierarchies);

  return res.status(200).json({
    user_id: 'karthikcherukuru_11052005',
    email_id: 'karthik_cherukuru@srmap.edu.in',
    college_roll_number: 'AP23110010658',
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary
  });
});

module.exports = router;
