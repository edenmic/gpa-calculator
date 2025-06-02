import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDegrees } from '../contexts/DegreesContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import AddDegreeDialog from '../components/AddDegreeDialog';
import EditDegreeDialog from '../components/EditDegreeDialog';
import DeleteDegreeDialog from '../components/DeleteDegreeDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  LogOut, 
  GraduationCap,
  Calculator,
  Award,
  RefreshCw,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { degrees, courses, loading, error, setError, fetchDegrees, calculateDegreeStats } = useDegrees();
  
  // Function to get real-time stats for a degree
  const getDegreeStats = (degreeId) => {
    const degreeCourses = courses.filter(course => course.degreeId === degreeId);
    if (degreeCourses.length === 0) {
      const degree = degrees.find(d => d.id === degreeId);
      return {
        currentGPA: degree?.currentGPA || 0,
        completedCredits: degree?.completedCredits || 0
      };
    }
    return calculateDegreeStats(degreeCourses);
  };
  
  useEffect(() => {
    console.log('Dashboard: degrees changed', { degrees, loading, error, user: user?.uid });
  }, [degrees, loading, error, user]);

  const handleRefresh = () => {
    fetchDegrees();
  };

  const handleLogout = async () => {
    try {
      await logout();    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600 ml-3" />
              <h1 className="text-xl font-bold text-gray-900">GPA Calculator</h1>
            </div>
              <div className="flex items-center space-x-4 space-x-reverse">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                רענן
              </Button>
              <div className="text-sm text-gray-700">
                שלום, {user?.displayName || 'משתמש'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 ml-2" />
                יציאה
              </Button>
            </div>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <ErrorAlert 
            error={error} 
            onRetry={() => setError(null)} 
          />
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">התארים שלי</h2>
          <p className="text-gray-600">עקוב אחר ההתקדמות האקדמית שלך</p>
        </div>        {/* Quick Stats */}
        {degrees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                  <div className="mr-4">
                    <p className="text-2xl font-bold text-gray-900">{degrees.length}</p>
                    <p className="text-gray-600">תארים פעילים</p>
                  </div>
                </div>
              </CardContent>
            </Card>            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="mr-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {degrees.length > 0 ? (() => {
                        const firstDegree = degrees[0];
                        const stats = getDegreeStats(firstDegree.id);
                        return stats.currentGPA ? stats.currentGPA.toFixed(1) : 'N/A';
                      })() : 'N/A'}
                    </p>
                    <p className="text-gray-600">ממוצע נוכחי</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="mr-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {degrees.length > 0 ? (() => {
                        const firstDegree = degrees[0];
                        const stats = getDegreeStats(firstDegree.id);
                        return stats.completedCredits || 0;
                      })() : 0}
                    </p>
                    <p className="text-gray-600">נק"ז הושלמו</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Degrees List */}          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">התארים שלי</h3>
              <AddDegreeDialog />
            </div>

          {degrees.length === 0 ? (
            // Empty State
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  עדיין לא הוספת תארים
                </h3>                <p className="text-gray-600 mb-6">
                  התחל במעקב אחר ההתקדמות האקדמית שלך
                </p>
                <AddDegreeDialog 
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף תואר ראשון
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            // Degrees Cards
            <div className="grid gap-6">              {degrees.map((degree) => (
                <Card key={degree.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">                        <CardTitle className="text-right">{degree.name}</CardTitle>
                        {degree.institution && (
                          <p className="text-sm text-gray-600 mt-1">{degree.institution}</p>
                        )}
                        {degree.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{degree.description}</p>
                        )}
                        <div className="flex items-center space-x-2 space-x-reverse mt-2">
                          <Badge variant="secondary">
                            {degree.status === 'active' ? 'פעיל' : 
                             degree.status === 'completed' ? 'הושלם' : 'מושהה'}
                          </Badge>
                        </div>
                      </div>                      
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/degree/${degree.id}`)}
                        >
                          צפה בפרטים
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <EditDegreeDialog 
                              degree={degree}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  ערוך תואר
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuSeparator />
                            <DeleteDegreeDialog 
                              degree={degree}
                              trigger={
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  מחק תואר
                                </DropdownMenuItem>
                              }
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                    <CardContent>
                    {(() => {
                      const stats = getDegreeStats(degree.id);
                      return (
                        <>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                {stats.currentGPA ? stats.currentGPA.toFixed(1) : 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">ממוצע נוכחי</p>
                            </div>
                            
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {stats.completedCredits || 0}
                              </p>
                              <p className="text-sm text-gray-600">נק"ז הושלמו</p>
                            </div>
                            
                            <div>
                              <p className="text-2xl font-bold text-purple-600">
                                {(degree.totalCredits || 0) - (stats.completedCredits || 0)}
                              </p>
                              <p className="text-sm text-gray-600">נק"ז נותרו</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>התקדמות</span>
                              <span>
                                {degree.totalCredits > 0 ? 
                                  Math.round(((stats.completedCredits || 0) / degree.totalCredits) * 100) 
                                  : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${degree.totalCredits > 0 ? 
                                    ((stats.completedCredits || 0) / degree.totalCredits) * 100 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
