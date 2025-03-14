import React from "react";

interface ScoreProps {
  score: {
    "Grammatical Range & Accuracy": number;
    "Coherence & Cohesion": number;
    "Lexical Resource": number;
    "Task Achievement": number;
  };
}

const ScoreDisplay: React.FC<ScoreProps> = ({ score }) => {
  return (
    <div className="p-4 border rounded-lg shadow-lg w-96 bg-white">
      <h2 className="text-xl font-bold mb-4">IELTS Score Breakdown</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Grammatical Range & Accuracy:</strong> {score["Grammatical Range & Accuracy"]}
        </li>
        <li>
          <strong>Coherence & Cohesion:</strong> {score["Coherence & Cohesion"]}
        </li>
        <li>
          <strong>Lexical Resource:</strong> {score["Lexical Resource"]}
        </li>
        <li>
          <strong>Task Achievement:</strong> {score["Task Achievement"]}
        </li>
      </ul>
    </div>
  );
};

export default ScoreDisplay;
