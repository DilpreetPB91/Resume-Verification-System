function analyzeText(text) {
  if (!text) return { hasName: false, hasCollege: false, hasDate: false, status: "Fake ❌" };
  
  const textLower = text.toLowerCase();
  const hasName = /name|student|candidate|this certifies that/i.test(textLower);
  const hasCollege = /college|university|institute|school|academy|udemy|coursera/i.test(textLower);
  const hasDate = /\d{4}/.test(textLower) || /\d{2}\/\d{2}\/\d{4}/.test(textLower);

  const score = [hasName, hasCollege, hasDate].filter(Boolean).length;

  let status = "Fake ❌";
  if (score === 3) status = "Verified ✅";
  else if (score === 2) status = "Suspicious ⚠️";

  return { hasName, hasCollege, hasDate, status };
}

module.exports = analyzeText;