const mergeTopicAnalysisSorted = (topicA = {}, topicB = {}) => {
  const merged = {};

  // Merge both maps
  for (let topic in topicA) {
    merged[topic] = (merged[topic] || 0) + topicA[topic];
  }

  for (let topic in topicB) {
    merged[topic] = (merged[topic] || 0) + topicB[topic];
  }

  // Sort descending
  return Object.fromEntries(
    Object.entries(merged).sort((a, b) => b[1] - a[1])
  );
};

module.exports = { mergeTopicAnalysisSorted };
