import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDegrees } from '../contexts/DegreesContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import AddCourseDialog from '../components/AddCourseDialog';
import EditDegreeDialog from '../components/EditDegreeDialog';
import EditCourseDialog from '../components/EditCourseDialog';
import DeleteCourseDialog from '../components/DeleteCourseDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
// Export component only
import ExportData from '../components/ExportData';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp,  BookOpen,
  Calendar,
  GraduationCap,
  MoreVertical
} from 'lucide-react';

const DegreePage = () => {
  const { degreeId } = useParams();
  const navigate = useNavigate();  const { user } = useAuth();
  const { degrees, courses: allCourses, loading, error, deleteCourse, calculateDegreeStats } = useDegrees();
  const [selectedSemester, setSelectedSemester] = useState('all');

  // Helper function to convert year number to Hebrew letter
  const getHebrewYear = (year) => {
    const hebrewYears = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
    return hebrewYears[year - 1] || year.toString();
  };

  // Find the current degree and its courses
  const degree = degrees.find(d => d.id === degreeId);
  const courses = allCourses.filter(c => c.degreeId === degreeId);
  
  // Calculate real-time statistics
  const currentStats = degree && courses.length > 0 ? calculateDegreeStats(courses) : {
    currentGPA: degree?.currentGPA || 0,
    completedCredits: degree?.completedCredits || 0
  };

  useEffect(() => {
    if (!loading && !degree) {
      // Degree not found, redirect to dashboard
      navigate('/dashboard');
    }
  }, [degree, loading, navigate]);  const calculateSemesterStats = (semester, year) => {
    // All completed courses in the semester
    const allSemesterCourses = courses.filter(course => 
      course.semester === semester && 
      parseInt(course.year) === parseInt(year) &&
      course.status === 'completed'
    );

    if (allSemesterCourses.length === 0) return null;

    // Graded courses only (for GPA calculation)
    const gradedCourses = allSemesterCourses.filter(course => 
      course.grade !== null && 
      course.grade !== undefined &&
      !course.isPassing &&
      course.isPassing !== true && 
      course.isPassing !== false
    );

    // Pass/fail courses that passed
    const passedCourses = allSemesterCourses.filter(course => 
      course.isPassing === true
    );

    // All successful courses for credit calculation
    const successfulCourses = [...gradedCourses, ...passedCourses];
    
    const totalCredits = successfulCourses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = gradedCourses.reduce((sum, course) => sum + (course.grade * course.credits), 0);
    const gradedCredits = gradedCourses.reduce((sum, course) => sum + course.credits, 0);
    const gpa = gradedCredits > 0 ? weightedSum / gradedCredits : 0;

    return {
      gpa: gpa,
      credits: totalCredits,
      courses: successfulCourses.length
    };
  };
  // Function to calculate yearly GPA
  const calculateYearlyGPA = (year) => {
    // All completed courses in the year
    const allYearCourses = courses.filter(course => 
      parseInt(course.year) === parseInt(year) &&
      course.status === 'completed'
    );

    if (allYearCourses.length === 0) return null;

    // Graded courses only (for GPA calculation)
    const gradedCourses = allYearCourses.filter(course => 
      course.grade !== null && 
      course.grade !== undefined &&
      !course.isPassing &&
      course.isPassing !== true && 
      course.isPassing !== false
    );

    // Pass/fail courses that passed
    const passedCourses = allYearCourses.filter(course => 
      course.isPassing === true
    );

    // All successful courses for credit calculation
    const successfulCourses = [...gradedCourses, ...passedCourses];
    
    const totalCredits = successfulCourses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = gradedCourses.reduce((sum, course) => sum + (course.grade * course.credits), 0);
    const gradedCredits = gradedCourses.reduce((sum, course) => sum + course.credits, 0);
    const gpa = gradedCredits > 0 ? weightedSum / gradedCredits : 0;

    return {
      gpa: gpa,
      credits: totalCredits,
      courses: successfulCourses.length
    };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { label: 'הושלם', variant: 'default' },
      'in-progress': { label: 'בתהליך', variant: 'secondary' },
      'planned': { label: 'מתוכנן', variant: 'outline' },
      'failed': { label: 'נכשל', variant: 'destructive' }
    };
    
    return statusMap[status] || { label: status, variant: 'outline' };
  };

  if (!degree) {
    return <div>טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center ml-4"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה לדשבורד
              </Button>
            </div>
              <div className="flex items-center space-x-4 space-x-reverse">
              <AddCourseDialog 
                degreeId={degreeId}
                trigger={
                  <Button className="flex items-center">
                    <Plus className="h-4 w-4 ml-2" />
                    הוסף קורס
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Degree Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{degree.name}</h1>
              <div className="flex items-center space-x-4 space-x-reverse mt-2">
                <Badge variant="secondary">
                  {degree.status === 'active' ? 'פעיל' : 'מושלם'}
                </Badge>                <span className="text-gray-600">
                  {currentStats.completedCredits} מתוך {degree.totalCredits} נק"ז
                </span>
              </div>            </div>
            <EditDegreeDialog 
              degree={degree}
              trigger={
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 ml-2" />
                  ערוך תואר
                </Button>
              }
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="mr-4">                  <p className="text-2xl font-bold text-gray-900">
                    {currentStats.currentGPA?.toFixed(1)}
                  </p>
                  <p className="text-gray-600">ממוצע כללי</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.status === 'completed').length}
                  </p>
                  <p className="text-gray-600">קורסים הושלמו</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.status === 'in-progress').length}
                  </p>
                  <p className="text-gray-600">קורסים פעילים</p>
                </div>
              </div>
            </CardContent>
          </Card>          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-orange-600 ml-3" />
                  <div>                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((currentStats.completedCredits / degree.totalCredits) * 100)}%
                    </p>
                    <p className="text-gray-600">התקדמות</p>
                  </div>
                </div>
              </div>
              {(() => {
                const progressPercent = (currentStats.completedCredits / degree.totalCredits) * 100;
                const progressColor = progressPercent >= 75 ? 'bg-green-500' : 
                                    progressPercent >= 50 ? 'bg-blue-500' : 
                                    progressPercent >= 25 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${progressColor} h-3 rounded-full transition-all duration-500 ease-in-out`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                );
              })()}
              <p className="text-sm text-gray-500 mt-2">
                {currentStats.completedCredits} מתוך {degree.totalCredits} נק"ז
              </p>            </CardContent>
          </Card>        </div>

        {/* Export Data */}
        <ExportData degreeId={degreeId} />

        {/* Courses Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>קורסים</CardTitle>
              <AddCourseDialog 
                degreeId={degreeId}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    הוסף קורס
                  </Button>
                }
              />
            </div>
          </CardHeader>          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full" style={{gridTemplateColumns: `repeat(${2 + [...new Set(courses.map(c => parseInt(c.year)))].length}, 1fr)`}}>
                <TabsTrigger value="all">הכל</TabsTrigger>
                {(() => {
                  // Get all unique years from courses and sort them
                  const years = [...new Set(courses.map(c => parseInt(c.year)))].sort((a, b) => a - b);
                  return years.map(year => (
                    <TabsTrigger key={year} value={`year${year}`}>
                      שנה {getHebrewYear(year)}
                    </TabsTrigger>
                  ));
                })()}
                <TabsTrigger value="completed">הושלמו</TabsTrigger>
              </TabsList><TabsContent value="all" className="mt-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      עדיין לא הוספת קורסים
                    </h3>
                    <p className="text-gray-600 mb-6">
                      התחל להוסיף קורסים כדי לעקוב אחר ההתקדמות שלך
                    </p>
                    <AddCourseDialog 
                      degreeId={degreeId}
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 ml-2" />
                          הוסף קורס ראשון
                        </Button>
                      }
                    />
                  </div>
                ) : (                <div className="space-y-6">
                  {/* Group by year */}
                  {(() => {
                    // Get all unique years from courses and sort them
                    const years = [...new Set(courses.map(c => parseInt(c.year)))].sort((a, b) => a - b);
                    
                    return years.map(year => {
                      const yearCourses = courses.filter(c => parseInt(c.year) === year);
                      if (yearCourses.length === 0) return null;                      return (
                        <div key={year}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">שנה {getHebrewYear(year)}</h3>
                          <div className="flex items-center space-x-4 space-x-reverse">
                            {(() => {
                              const yearStats = calculateYearlyGPA(year);
                              const allYearCourses = courses.filter(c => parseInt(c.year) === year);
                              const completedYearCourses = allYearCourses.filter(c => c.status === 'completed');
                              const yearProgress = allYearCourses.length > 0 ? (completedYearCourses.length / allYearCourses.length) * 100 : 0;
                              
                              return (
                                <>
                                  {yearStats && (
                                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                      ממוצע: {yearStats.gpa.toFixed(1)} | {yearStats.credits} נק"ז
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-xs text-gray-500">
                                      {completedYearCourses.length}/{allYearCourses.length} קורסים
                                    </span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          yearProgress === 100 ? 'bg-green-500' : 
                                          yearProgress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}
                                        style={{ width: `${yearProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </>
                              );                            })()}
                          </div>
                        </div>
                        
                        {/* Group by semester */}
                        {['א', 'ב', 'קיץ'].map(semester => {
                          const semesterCourses = yearCourses.filter(c => c.semester === semester);
                          if (semesterCourses.length === 0) return null;

                          const stats = calculateSemesterStats(semester, year);

                          return (
                            <div key={`${year}-${semester}`} className="mb-6">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-700">
                                  סמסטר {semester}
                                </h4>                                {stats && (
                                  <div className="text-sm text-gray-600">
                                    ממוצע: {stats.gpa.toFixed(1)} | {stats.credits} נק"ז | {stats.courses} קורסים
                                  </div>
                                )}
                              </div>

                              <div className="grid gap-3">
                                {semesterCourses.map(course => (
                                  <div key={course.id} className="border rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">{course.name}</h5>
                                        <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                          <span className="text-sm text-gray-600">
                                            {course.credits} נק"ז
                                          </span>
                                          <Badge {...getStatusBadge(course.status)}>
                                            {getStatusBadge(course.status).label}
                                          </Badge>
                                          {course.isPassing === true && (
                                            <Badge variant="outline">עובר</Badge>
                                          )}
                                          {course.isPassing === false && (
                                            <Badge variant="destructive">נכשל</Badge>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2 space-x-reverse">
                                        {course.grade !== null && (
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                              {course.grade}
                                            </div>
                                            <div className="text-xs text-gray-500">ציון</div>
                                          </div>
                                        )}                                        
                                        <div className="flex space-x-1 space-x-reverse">
                                          <EditCourseDialog 
                                            course={course}
                                            trigger={
                                              <Button variant="outline" size="sm">
                                                <Edit2 className="h-4 w-4" />
                                              </Button>
                                            }
                                          />
                                          <DeleteCourseDialog 
                                            course={course}
                                            trigger={
                                              <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );                        })}
                      </div>
                    );
                    });
                  })()}
                </div>
                )}
              </TabsContent>

              {/* Dynamic year tabs */}
              {(() => {
                const years = [...new Set(courses.map(c => parseInt(c.year)))].sort((a, b) => a - b);
                return years.map(year => (
                  <TabsContent key={`year${year}`} value={`year${year}`} className="mt-6">
                    {(() => {
                      const yearCourses = courses.filter(c => parseInt(c.year) === year);
                      if (yearCourses.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            אין קורסים עדיין בשנה {year}
                          </div>
                        );
                      }                      return (
                        <div className="space-y-6">                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">שנה {getHebrewYear(year)}</h3>
                            <div className="flex items-center space-x-4 space-x-reverse">
                              {(() => {
                                const yearStats = calculateYearlyGPA(year);
                                const allYearCourses = courses.filter(c => parseInt(c.year) === year);
                                const completedYearCourses = allYearCourses.filter(c => c.status === 'completed');
                                const yearProgress = allYearCourses.length > 0 ? (completedYearCourses.length / allYearCourses.length) * 100 : 0;
                                
                                return (
                                  <>
                                    {yearStats && (
                                      <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                        ממוצע: {yearStats.gpa.toFixed(1)} | {yearStats.credits} נק"ז
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <span className="text-xs text-gray-500">
                                        {completedYearCourses.length}/{allYearCourses.length} קורסים
                                      </span>
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-300 ${
                                            yearProgress === 100 ? 'bg-green-500' : 
                                            yearProgress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                          }`}
                                          style={{ width: `${yearProgress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          
                          {/* Group by semester */}
                          {['א', 'ב', 'קיץ'].map(semester => {
                            const semesterCourses = yearCourses.filter(c => c.semester === semester);
                            if (semesterCourses.length === 0) return null;

                            const stats = calculateSemesterStats(semester, year);

                            return (
                              <div key={semester} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-medium">סמסטר {semester}</h4>
                                  {stats && (
                                    <div className="text-sm text-gray-600">
                                      ממוצע: {stats.gpa.toFixed(1)} | {stats.credits} נק״ז
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  {semesterCourses.map(course => (
                                    <div key={course.id} className="border rounded p-3">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 space-x-reverse">
                                            <h5 className="font-medium">{course.name}</h5>
                                            {course.code && (
                                              <span className="text-sm text-gray-500">({course.code})</span>
                                            )}
                                            <span className="text-sm text-gray-500">{course.credits} נק״ז</span>
                                          </div>
                                          <div className="flex items-center space-x-2 space-x-reverse mt-1">
                                            <Badge 
                                              variant={
                                                course.status === 'completed' ? 'default' :
                                                course.status === 'in-progress' ? 'secondary' :
                                                course.status === 'planned' ? 'outline' : 'destructive'
                                              }
                                            >
                                              {course.status === 'completed' ? 'הושלם' :
                                               course.status === 'in-progress' ? 'בתהליך' :
                                               course.status === 'planned' ? 'מתוכנן' : 'נכשל'}
                                            </Badge>
                                            {course.isPassFail && (
                                              <Badge variant="outline">עובר/נכשל</Badge>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-2 space-x-reverse">
                                          {course.grade !== null && (
                                            <div className="text-center">
                                              <div className="text-2xl font-bold text-blue-600">
                                                {course.grade}
                                              </div>
                                              <div className="text-xs text-gray-500">ציון</div>
                                            </div>
                                          )}
                                          
                                          <div className="flex space-x-1 space-x-reverse">
                                            <EditCourseDialog 
                                              course={course}
                                              trigger={
                                                <Button variant="outline" size="sm">
                                                  <Edit2 className="h-4 w-4" />
                                                </Button>
                                              }
                                            />
                                            <DeleteCourseDialog 
                                              course={course}
                                              trigger={
                                                <Button variant="outline" size="sm">
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </TabsContent>
                ));
              })()}

              {/* Completed courses tab */}
              <TabsContent value="completed" className="mt-6">
                {(() => {
                  const completedCourses = courses.filter(c => c.status === 'completed');
                  if (completedCourses.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        אין קורסים שהושלמו עדיין
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {completedCourses.map(course => (
                        <div key={course.id} className="border rounded p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <h5 className="font-medium">{course.name}</h5>
                                {course.code && (
                                  <span className="text-sm text-gray-500">({course.code})</span>
                                )}                                <span className="text-sm text-gray-500">
                                  שנה {getHebrewYear(parseInt(course.year))}, סמסטר {course.semester}
                                </span>
                                <span className="text-sm text-gray-500">{course.credits} נק״ז</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {course.grade !== null && (
                                <div className="text-center">
                                  <div className="text-xl font-bold text-blue-600">
                                    {course.grade}
                                  </div>
                                </div>
                              )}
                              <EditCourseDialog 
                                course={course}
                                trigger={
                                  <Button variant="outline" size="sm">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DegreePage;
