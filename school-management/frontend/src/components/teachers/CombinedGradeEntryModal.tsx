import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CombinedGradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  students: any[];
  subjects: any[];
  selectedStudent?: any;
  terms?: any[]; // <-- Added terms prop
}

export const CombinedGradeEntryModal = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  subjects,
  selectedStudent,
  terms = [], // <-- Default empty array
}: CombinedGradeEntryModalProps) => {
  const [formData, setFormData] = useState({
    studentId: selectedStudent?.id || "",
    subjectId: "",
    termId: "", // <-- Added termId
    caScore: "",
    examScore: "",
    caRemarks: "",
    examRemarks: ""
  });

  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens with selected student
  useEffect(() => {
    if (isOpen) {
      setFormData({
        studentId: selectedStudent?.id || "",
        subjectId: "",
        termId: "", // Reset termId
        caScore: "",
        examScore: "",
        caRemarks: "",
        examRemarks: ""
      });
    }
  }, [isOpen, selectedStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate term selection
    if (!formData.termId) {
      alert("Please select a term");
      return;
    }
    
    const caScoreValue = parseFloat(formData.caScore);
    const examScoreValue = parseFloat(formData.examScore);
    
    if (isNaN(caScoreValue) || isNaN(examScoreValue)) {
      alert("Please enter both CA and Exam scores");
      return;
    }
    
    if (caScoreValue < 0 || caScoreValue > 40) {
      alert("CA score must be between 0 and 40");
      return;
    }
    
    if (examScoreValue < 0 || examScoreValue > 60) {
      alert("Exam score must be between 0 and 60");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Calculate percentages
      const caPercentage = (caScoreValue / 40) * 100;
      const examPercentage = (examScoreValue / 60) * 100;
      
      // Submit both grades with termId
      await onSubmit({
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        termId: formData.termId, // <-- Include termId
        ca: {
          score: caScoreValue,
          maxScore: 40,
          percentage: caPercentage,
          type: "CA",
          category: "CA",
          remarks: formData.caRemarks
        },
        exam: {
          score: examScoreValue,
          maxScore: 60,
          percentage: examPercentage,
          type: "EXAM",
          category: "EXAM",
          remarks: formData.examRemarks
        }
      });
      
      // Reset form on success
      setFormData({
        studentId: "",
        subjectId: "",
        termId: "",
        caScore: "",
        examScore: "",
        caRemarks: "",
        examRemarks: ""
      });
    } catch (error) {
      console.error("Error submitting grades:", error);
    } finally {
      setSubmitting(false);
    }
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

  const caScore = parseFloat(formData.caScore);
  const examScore = parseFloat(formData.examScore);
  const caPercentage = !isNaN(caScore) ? (caScore / 40) * 100 : 0;
  const examPercentage = !isNaN(examScore) ? (examScore / 60) * 100 : 0;
  const finalScore = (!isNaN(caScore) ? caScore : 0) + (!isNaN(examScore) ? examScore : 0);
  const finalPercentage = (finalScore / 100) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter Grades" size="lg">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 font-medium">Grading System:</p>
        <div className="text-xs text-blue-600 mt-1 space-y-1">
          <p>• Continuous Assessment (CA): Max 40 points → 40% of final grade</p>
          <p>• Examination: Max 60 points → 60% of final grade</p>
          <p className="font-medium mt-2">Final Grade = CA Score + Exam Score (out of 100)</p>
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

        {/* Term Selection - NEW */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.termId}
            onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
            required
          >
            <option value="">Select Term</option>
            {terms.length > 0 ? (
              terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.session?.name ? `(${term.session.name})` : ""}
                </option>
              ))
            ) : (
              <option value="" disabled>No terms available</option>
            )}
          </select>
          {terms.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No active terms found. Please create a term first.</p>
          )}
        </div>

        {/* CA and Exam Fields - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* CA Section */}
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-700 mb-3">Continuous Assessment (CA)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-40) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={formData.caScore}
                  onChange={(e) => setFormData({ ...formData, caScore: e.target.value })}
                  required
                  placeholder="0 - 40"
                />
              </div>
              {formData.caScore && (
                <div className="text-sm">
                  <span className="text-gray-600">Percentage: </span>
                  <span className={getGradeColor(caPercentage)}>
                    {caPercentage.toFixed(1)}%
                  </span>
                  <span className="ml-2 text-gray-600">Grade: </span>
                  <span className={getGradeColor(caPercentage)}>
                    {getGradeLetter(caPercentage)}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                  value={formData.caRemarks}
                  onChange={(e) => setFormData({ ...formData, caRemarks: e.target.value })}
                  placeholder="CA remarks..."
                />
              </div>
            </div>
          </div>

          {/* Exam Section */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-3">Examination</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-60) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  value={formData.examScore}
                  onChange={(e) => setFormData({ ...formData, examScore: e.target.value })}
                  required
                  placeholder="0 - 60"
                />
              </div>
              {formData.examScore && (
                <div className="text-sm">
                  <span className="text-gray-600">Percentage: </span>
                  <span className={getGradeColor(examPercentage)}>
                    {examPercentage.toFixed(1)}%
                  </span>
                  <span className="ml-2 text-gray-600">Grade: </span>
                  <span className={getGradeColor(examPercentage)}>
                    {getGradeLetter(examPercentage)}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                  value={formData.examRemarks}
                  onChange={(e) => setFormData({ ...formData, examRemarks: e.target.value })}
                  placeholder="Exam remarks..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Grade Preview */}
        {formData.caScore && formData.examScore && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Final Grade Preview</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Score:</span>
              <span className="text-xl font-bold">{finalScore} / 100</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Percentage:</span>
              <span className={"text-xl font-bold " + getGradeColor(finalPercentage)}>
                {finalPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: finalPercentage + "%" }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Final Grade:</span>
              <span className={"text-2xl font-bold " + getGradeColor(finalPercentage)}>
                {getGradeLetter(finalPercentage)}
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting} className="flex-1">
            Submit Both Grades
          </Button>
        </div>
      </form>
    </Modal>
  );
};