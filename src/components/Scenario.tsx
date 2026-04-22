"use client";

import { useState, useRef, useEffect } from "react";

interface ScenarioProps {
  scenarioId: string;
  imageUrl: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  onDecisionMade: (isCorrect: boolean) => void;
}

export default function Scenario({
  scenarioId,
  imageUrl,
  question,
  options,
  onDecisionMade,
}: ScenarioProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedbackAnimation, setShowFeedbackAnimation] = useState(false);

  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);

  const handleOptionClick = (optionId: string, isCorrect: boolean) => {
    if (selectedOption !== null) return; // Prevent multiple selections

    setSelectedOption(optionId);
    setShowFeedbackAnimation(true);

    if (isCorrect) {
      setFeedback("Excellent choice!");
      correctSoundRef.current?.play();
    } else {
      setFeedback("Not the best decision. Try again!");
      incorrectSoundRef.current?.play();
    }
    onDecisionMade(isCorrect);
  };

  useEffect(() => {
    if (showFeedbackAnimation) {
      const timer = setTimeout(() => {
        setShowFeedbackAnimation(false);
      }, 1500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [showFeedbackAnimation]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">{question}</h2>
      <div className="mb-6">
        <img src={imageUrl} alt={`Scenario ${scenarioId}`} className="w-full h-auto rounded-md" />
      </div>
      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id, option.isCorrect)}
            className={`w-full text-left p-3 rounded-md transition-all duration-200
              ${selectedOption === option.id
                ? (option.isCorrect ? "bg-green-600" : "bg-red-600")
                : "bg-gray-700 hover:bg-gray-600"}
              ${selectedOption && !option.isCorrect && option.id !== selectedOption ? "opacity-50" : ""}
              text-white font-medium`}
            disabled={selectedOption !== null}
          >
            {option.text}
          </button>
        ))}
      </div>
      {feedback && (
        <p className={`mt-6 text-center text-xl font-semibold
          ${selectedOption && options.find(opt => opt.id === selectedOption)?.isCorrect ? "text-green-400" : "text-red-400"}
          ${showFeedbackAnimation ? "animate-pulse" : ""}`}>
          {feedback}
        </p>
      )}

      {/* Audio elements for feedback sounds */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
    </div>
  );
}
