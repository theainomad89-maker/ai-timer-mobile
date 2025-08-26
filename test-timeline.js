// Simple test to verify timeline generation
const testWorkout = {
  "title": "Double-Unders and Kettlebell Swings",
  "total_minutes": 12,
  "blocks": [
    {
      "type": "INTERVAL",
      "work_seconds": 60,
      "rest_seconds": 60,
      "sets": 6,
      "sequence": [
        {
          "name": "45 Double-Unders + Max Kettlebell Swings",
          "seconds": 60
        }
      ]
    }
  ]
};

console.log("Test workout:", JSON.stringify(testWorkout, null, 2));

// This would test the buildTimeline function
// const timeline = buildTimeline(testWorkout);
// console.log("Generated timeline:", timeline);
