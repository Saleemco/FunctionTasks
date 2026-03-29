import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  students: any[];
  subjects: any[];
  selectedStudent?: any;
}

export const GradeEntryModal = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  subjects,
  selectedStudent,
}: GradeEntryModalProps) => {
  const [formData, setFormData] = useState({
    studentId: selectedStudent?.id || "",
    subjectId: "",
    score: "",
    type: "CA",
    maxScore: "40",
    remarks: ""
  });

  const handleTypeChange = (type: string, maxScore: number) => {
    setFormData({ ...formData, type, maxScore: maxScore.toString(), score: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreValue = parseFloat(formData.score);
    const maxScoreValue = parseFloat(formData.maxScore);
    const percentage = (scoreValue / maxScoreValue) * 100;
    
    onSubmit({
      ...formData,
      percentage: percentage.toFixed(1),
      grade: getGradeLetter(percentage)
    });
  };

  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 45) return "D";
    if (percentage >= 40) return "E";
    return "F";
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  const scorePercentage = formData.score ? (parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter Grade" size="lg">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 font-medium">Grading System:</p>
        <div className="text-xs text-blue-600 mt-1 space-y-1">
          <p>• Continuous Assessment (CA): Max 40 points → 40% of final grade</p>
          <p>• Examination: Max 60 points → 60% of final grade</p>
          <p>• Total: 100 points</p>
          <p className="font-medium mt-2">Final Grade = CA Score + Exam Score</p>
          <p className="text-blue-500 mt-1">Example: CA=35/40, Exam=55/60 → Total = 90/100 (A)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            required
            disabled={!!selectedStudent}
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || student.firstName + " " + student.lastName} ({student.admissionNo})
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.className}
              </option>
            ))}
          </select>
        </div>

        {/* Assessment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Type *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange("CA", 40)}
              className={"px-4 py-3 text-sm font-medium rounded-lg transition-all " + (
                formData.type === "CA"
                  ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <div className="font-bold text-lg">Continuous Assessment (CA)</div>
              <div className="text-xs mt-1">Max Score: 40 • Weight: 40%</div>
              <div className="text-xs text-gray-500 mt-1">Enter score out of 40</div>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("EXAM", 60)}
              className={"px-4 py-3 text-sm font-medium rounded-lg transition-all " + (
                formData.type === "EXAM"
                  ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <div className="font-bold text-lg">Examination</div>
              <div className="text-xs mt-1">Max Score: 60 • Weight: 60%</div>
              <div className="text-xs text-gray-500 mt-1">Enter score out of 60</div>
            </button>
          </div>
        </div>

        {/* Score Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Score *
            </label>
            <Input
              name="score"
              type="number"
              min="0"
              max={formData.maxScore}
              step="0.5"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              required
              placeholder={"0 - " + formData.maxScore}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === "CA" 
                ? "Enter score between 0 and 40" 
                : "Enter score between 0 and 60"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Score
            </label>
            <Input
              name="maxScore"
              type="number"
              value={formData.maxScore}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        {/* Score Preview */}
        {formData.score && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="text-lg font-bold text-blue-600">
                {formData.score} / {formData.maxScore}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className={"text-lg font-bold " + getGradeColor(scorePercentage)}>
                {scorePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: Math.min(scorePercentage, 100) + "%" }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Grade:</span>
              <span className={"text-xl font-bold " + getGradeColor(scorePercentage)}>
                {getGradeLetter(scorePercentage)}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 border-t pt-2">
              {formData.type === "CA" ? (
                <p>This contributes {formData.score} points to final grade (max 40)</p>
              ) : (
                <p>This contributes {formData.score} points to final grade (max 60)</p>
              )}
            </div>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Add any remarks or feedback..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Submit Grade
          </Button>
        </div>
      </form>
    </Modal>
  );
};
