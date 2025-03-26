import React from "react";

interface ScoreProps {
  score?: {
    "Grammatical Range & Accuracy"?: number;
    "Coherence & Cohesion"?: number;
    "Lexical Resource"?: number;
    "Task Achievement"?: number;
  };
}

const ScoreDisplay: React.FC<ScoreProps> = ({ score }) => {
  console.log("📊 Received score in ScoreDisplay:", score); // Debug

  if (!score) {
    return (
      <div className="p-4 border rounded-lg shadow-lg w-96 bg-white text-red-500 text-center">
        No score data available.
      </div>
    );
  }

  const grammar = score["Grammatical Range & Accuracy"] ?? 0;
  const cohesion = score["Coherence & Cohesion"] ?? 0;
  const lexical = score["Lexical Resource"] ?? 0;
  const task = score["Task Achievement"] ?? 0;

  const overallScore = ((grammar + cohesion + lexical + task) / 4).toFixed(1);

  return (
    <div className="p-4 border rounded-lg shadow-lg w-96 bg-white">
      <h2 className="text-xl font-bold mb-4">IELTS Score Breakdown</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Grammatical Range & Accuracy:</strong> {grammar}</li>
        <li><strong>Coherence & Cohesion:</strong> {cohesion}</li>
        <li><strong>Lexical Resource:</strong> {lexical}</li>
        <li><strong>Task Achievement:</strong> {task}</li>
      </ul>

      <div className="mt-4 p-2 border-t font-bold text-lg text-center">
        Overall Score: {overallScore}
      </div>
    </div>
  );
};

export default ScoreDisplay;
