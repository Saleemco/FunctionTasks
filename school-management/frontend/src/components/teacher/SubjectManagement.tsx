import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resultService } from "../../services/result.service";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { DataTable } from "../ui/DataTable";
import toast from "react-hot-toast";

export const SubjectManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "");
  const [scores, setScores] = useState<Record<string, { ca1: string; ca2: string; exam: string }>>({});

  const queryClient = useQueryClient();

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ["teacher-subjects"],
    queryFn: resultService.getMySubjects,
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["subject-students", selectedSubject],
    queryFn: async () => {
      if (!selectedSubject) return null;
      const subject = subjectsData?.teachingSubjects?.find((s: any) => s.id === selectedSubject);
      if (!subject) return null;
      // Fetch students from the class
      const res = await resultService.getClassResults(subject.classId, "current-term");
      return res.data;
    },
    enabled: !!selectedSubject && !!subjectsData,
  });

  const submitScoreMutation = useMutation({
    mutationFn: resultService.enterScores,
    onSuccess: () => {
      toast.success("Score saved successfully");
      queryClient.invalidateQueries({ queryKey: ["subject-students"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save score");
    },
  });

  useEffect(() => {
    if (selectedSubject) {
      setSearchParams({ subject: selectedSubject });
    }
  }, [selectedSubject, setSearchParams]);

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = (studentId: string) => {
    const studentScores = scores[studentId];
    if (!studentScores) return;

    const subject = subjectsData?.teachingSubjects?.find((s: any) => s.id === selectedSubject);
    if (!subject) return;

    submitScoreMutation.mutate({
      studentId,
      subjectId: selectedSubject,
      termId: "current-term", // You should get this from your active term context
      ca1: parseInt(studentScores.ca1) || 0,
      ca2: parseInt(studentScores.ca2) || 0,
      exam: parseInt(studentScores.exam) || 0,
    });
  };

  const subjectOptions =
    subjectsData?.teachingSubjects?.map((subject: any) => ({
      value: subject.id,
      label: `${subject.name} - ${subject.class?.name}`,
    })) || [];

  const selectedSubjectData = subjectsData?.teachingSubjects?.find((s: any) => s.id === selectedSubject);

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (item: any) => (
        <div>
          <p className="font-medium">
            {item.user?.firstName} {item.user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{item.admissionNo}</p>
        </div>
      ),
    },
    {
      key: "ca1",
      header: "CA1 (20)",
      render: (item: any) => (
        <Input
          type="number"
          max={20}
          min={0}
          className="w-20"
          value={scores[item.id]?.ca1 || ""}
          onChange={(e) => handleScoreChange(item.id, "ca1", e.target.value)}
        />
      ),
    },
    {
      key: "ca2",
      header: "CA2 (20)",
      render: (item: any) => (
        <Input
          type="number"
          max={20}
          min={0}
          className="w-20"
          value={scores[item.id]?.ca2 || ""}
          onChange={(e) => handleScoreChange(item.id, "ca2", e.target.value)}
        />
      ),
    },
    {
      key: "exam",
      header: "Exam (60)",
      render: (item: any) => (
        <Input
          type="number"
          max={60}
          min={0}
          className="w-20"
          value={scores[item.id]?.exam || ""}
          onChange={(e) => handleScoreChange(item.id, "exam", e.target.value)}
        />
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (item: any) => {
        const s = scores[item.id];
        const total = (parseInt(s?.ca1) || 0) + (parseInt(s?.ca2) || 0) + (parseInt(s?.exam) || 0);
        return <span className="font-bold">{s ? total : "-"}</span>;
      },
    },
    {
      key: "action",
      header: "Action",
      render: (item: any) => (
        <Button
          size="sm"
          onClick={() => handleSubmit(item.id)}
          isLoading={submitScoreMutation.isPending}
        >
          Save
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
        <p className="text-gray-600">Enter and manage student scores</p>
      </div>

      <Card>
        <Select
          label="Select Subject"
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setScores({});
          }}
          options={[{ value: "", label: "Choose a subject..." }, ...subjectOptions]}
        />
      </Card>

      {selectedSubject && selectedSubjectData && (
        <Card
          title={`${selectedSubjectData.name} - ${selectedSubjectData.class?.name}`}
          subtitle={`Max Scores: CA1 (20), CA2 (20), Exam (60)`}
        >
          <DataTable
            columns={columns}
            data={studentsData || []}
            keyExtractor={(item) => item.id}
            isLoading={studentsLoading}
          />
        </Card>
      )}
    </div>
  );
};

export default SubjectManagement;
