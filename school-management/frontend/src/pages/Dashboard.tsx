import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "../components/dashboards/AdminDashboard";
import { PrincipalDashboard } from "../components/dashboards/PrincipalDashboard";
import { TeacherDashboard } from "../components/dashboards/TeacherDashboard";
import { BursarDashboard } from "../components/dashboards/BursarDashboard";
import { ParentDashboard } from "../components/dashboards/ParentDashboard";
import { StudentDashboard } from "../components/dashboards/StudentDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  console.log('👤 Current user:', user);
  console.log('📍 Dashboard rendering with role:', user?.role);

  switch (user?.role) {
    case 'PRINCIPAL':
      return <PrincipalDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'BURSAR':
      return <BursarDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No dashboard available for role: {user?.role}</p>
        </div>
      );
  }
}