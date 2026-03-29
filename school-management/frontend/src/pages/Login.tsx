import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { UserPlus, LogIn, Users, Briefcase, BookOpen } from "lucide-react";
import { authService } from "../services/auth.service";
import { classService } from "../services/class.service";
import { subjectService } from "../services/subject.service";
import toast from "react-hot-toast";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [registrationType, setRegistrationType] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "TEACHER",
    classIds: [] as string[],
    subjectIds: [] as string[],
  });

  useEffect(() => {
    if (!isLogin && registrationType === 'TEACHER') {
      loadClassesAndSubjects();
    }
  }, [isLogin, registrationType]);

  const loadClassesAndSubjects = async () => {
    try {
      const classesData = await classService.getAll();
      setClasses(classesData);
      
      const subjectsData = await subjectService.getAll();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClassSelection = (classId: string) => {
    setFormData(prev => {
      const current = prev.classIds || [];
      if (current.includes(classId)) {
        return { ...prev, classIds: current.filter(id => id !== classId) };
      } else {
        return { ...prev, classIds: [...current, classId] };
      }
    });
  };

  const handleSubjectSelection = (subjectId: string) => {
    setFormData(prev => {
      const current = prev.subjectIds || [];
      if (current.includes(subjectId)) {
        return { ...prev, subjectIds: current.filter(id => id !== subjectId) };
      } else {
        return { ...prev, subjectIds: [...current, subjectId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        navigate("/dashboard");
      } else {
        const registerData: any = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: registrationType,
        };

        if (registrationType === 'TEACHER') {
          registerData.classIds = formData.classIds;
          registerData.subjectIds = formData.subjectIds;
        }

        await authService.register(registerData);
        toast.success('Registration successful! You can now login.');
        setIsLogin(true);
        setFormData({ 
          email: "", 
          password: "", 
          firstName: "", 
          lastName: "", 
          role: "TEACHER",
          classIds: [],
          subjectIds: [],
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create an Account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? "register here" : "sign in"}
            </button>
          </p>
        </div>

        {!isLogin && (
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setRegistrationType('TEACHER')}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ' + (registrationType === 'TEACHER' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300')}
            >
              <Briefcase className="w-5 h-5" />
              Register as Teacher
            </button>
            <button
              type="button"
              onClick={() => setRegistrationType('PARENT')}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ' + (registrationType === 'PARENT' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300')}
            >
              <Users className="w-5 h-5" />
              Register as Parent
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {registrationType === 'TEACHER' && (
                  <>
                    {/* Classes Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Classes Teaching *
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                        {classes.length > 0 ? (
                          classes.map((cls) => (
                            <label 
                              key={cls.id} 
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.classIds.includes(cls.id)}
                                onChange={() => handleClassSelection(cls.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">
                                {cls.name}
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No classes available. Please add classes first.
                          </p>
                        )}
                      </div>
                      {formData.classIds.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Selected {formData.classIds.length} class(es)
                        </p>
                      )}
                    </div>

                    {/* Subjects Section - Grouped by Class */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subjects Teaching *
                      </label>
                      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-4 bg-white">
                        {classes.length > 0 ? (
                          classes.map((cls) => {
                            const subjectsForClass = subjects.filter((subject: any) => 
                              subject.classes?.some((c: any) => c.id === cls.id) || 
                              subject.classId === cls.id
                            );
                            
                            if (subjectsForClass.length === 0) return null;
                            
                            return (
                              <div key={cls.id} className="space-y-2">
                                <div className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                  {cls.name}
                                </div>
                                <div className="pl-4 space-y-1">
                                  {subjectsForClass.map((subject: any) => (
                                    <label 
                                      key={subject.id} 
                                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.subjectIds.includes(subject.id)}
                                        onChange={() => handleSubjectSelection(subject.id)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">
                                        {subject.name}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No subjects available. Please add subjects first.
                          </p>
                        )}
                      </div>
                      {formData.subjectIds.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Selected {formData.subjectIds.length} subject(s)
                        </p>
                      )}
                    </div>
                  </>
                )}

                {registrationType === 'PARENT' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      📝 Parent registration is simple. Just provide your basic information.
                      You can link your children to your account after registration.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register as {registrationType === 'TEACHER' ? 'Teacher' : 'Parent'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}