import { Grade } from "@prisma/client";

export const calculateGrade = (total: number): Grade => {
  if (total >= 70) return Grade.A;
  if (total >= 60) return Grade.B;
  if (total >= 50) return Grade.C;
  if (total >= 45) return Grade.D;
  if (total >= 40) return Grade.E;
  return Grade.F;
};

export const getGradePoint = (grade: Grade): number => {
  const points: Record<Grade, number> = {
    [Grade.A]: 5.0,
    [Grade.B]: 4.0,
    [Grade.C]: 3.0,
    [Grade.D]: 2.0,
    [Grade.E]: 1.0,
    [Grade.F]: 0.0,
  };
  return points[grade];
};

export const calculateGPA = (results: { grade: Grade; unit?: number }[]): number => {
  if (results.length === 0) return 0;

  const totalPoints = results.reduce((sum, result) => {
    return sum + getGradePoint(result.grade) * (result.unit || 1);
  }, 0);

  const totalUnits = results.reduce((sum, result) => sum + (result.unit || 1), 0);

  return parseFloat((totalPoints / totalUnits).toFixed(2));
};
