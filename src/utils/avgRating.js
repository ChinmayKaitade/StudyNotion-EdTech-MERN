export default function GetAvgRating(ratingArr) {
  // ✅ Handle undefined, null, or empty array
  if (!Array.isArray(ratingArr) || ratingArr.length === 0) return 0;

  const totalReviewCount = ratingArr.reduce((acc, curr) => {
    // ✅ Handle missing rating key safely
    const ratingValue = Number(curr?.rating) || 0;
    return acc + ratingValue;
  }, 0);

  const multiplier = Math.pow(10, 1);
  const avgReviewCount =
    Math.round((totalReviewCount / ratingArr.length) * multiplier) / multiplier;

  return avgReviewCount;
}
