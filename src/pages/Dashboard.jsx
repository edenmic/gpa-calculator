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
  
  // Accessibility state
  const [announceMessage, setAnnounceMessage] = useState('');
  const [focusedElement, setFocusedElement] = useState(null);
  
  // Check for accessibility preferences
  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }
    
    // Add keyboard navigation listeners
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && focusedElement) {
        focusedElement.blur();
        setFocusedElement(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedElement]);
  
  // Announce changes to screen readers
  const announceToScreenReader = (message) => {
    setAnnounceMessage(message);
    setTimeout(() => setAnnounceMessage(''), 1000);
  };
  
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
    announceToScreenReader('רענון הנתונים החל');
    fetchDegrees();
  };

  const handleLogout = async () => {
    try {
      announceToScreenReader('מתנתק מהמערכת');
      await logout();    } catch (error) {
      console.error('Logout error:', error);
      announceToScreenReader('שגיאה בהתנתקות');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="min-h-screen bg-gray-50" role="main" aria-label="לוח הבקרה הראשי">
      {/* Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>      {/* Skip to main content link */}
      <a 
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          textDecoration: 'none',
          zIndex: 100,
          transition: 'top 0.3s'
        }}
        onFocus={(e) => {
          e.target.style.top = '6px';
        }}
        onBlur={(e) => {
          e.target.style.top = '-40px';
        }}
      >
        דלג לתוכן הראשי
      </a>      {/* Header */}
      <header className="bg-white shadow-sm border-b" role="banner">
        {/* Accessibility toolbar - always visible */}
        <div className="bg-gray-100 border-b border-gray-200 py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center space-x-2 space-x-reverse">
              <span className="text-xs text-gray-600">נגישות:</span>
              <button
                onClick={() => {
                  const currentSize = document.documentElement.style.fontSize || '16px';
                  const newSize = parseInt(currentSize) + 2;
                  document.documentElement.style.fontSize = `${Math.min(newSize, 24)}px`;
                  announceToScreenReader('גופן הוגדל');
                }}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                aria-label="הגדל טקסט"
                title="הגדל טקסט"
              >
                A+
              </button>
              <button
                onClick={() => {
                  const currentSize = document.documentElement.style.fontSize || '16px';
                  const newSize = parseInt(currentSize) - 2;
                  document.documentElement.style.fontSize = `${Math.max(newSize, 12)}px`;
                  announceToScreenReader('גופן הוקטן');
                }}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                aria-label="הקטן טקסט"
                title="הקטן טקסט"
              >
                A-
              </button>
              <button
                onClick={() => {
                  document.documentElement.style.fontSize = '16px';
                  announceToScreenReader('גופן אופס לגודל רגיל');
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                aria-label="אפס גודל טקסט"
                title="אפס גודל טקסט"
              >
                אפס
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600 ml-3" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900" id="page-title">GPA Calculator</h1>
            </div>
            <nav className="flex items-center space-x-4 space-x-reverse" role="navigation" aria-label="פעולות ראשיות">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center"
                aria-label={loading ? 'רענון בתהליך' : 'רענן נתונים'}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                רענן
              </Button>
              <div className="text-sm text-gray-700" role="status" aria-label="משתמש מחובר">
                שלום, {user?.displayName || 'משתמש'}
              </div>              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center"
                aria-label="התנתק מהמערכת"
              >
                <LogOut className="h-4 w-4 ml-2" aria-hidden="true" />
                יציאה
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="תוכן ראשי">
        {error && (
          <ErrorAlert 
            error={error} 
            onRetry={() => setError(null)} 
          />
        )}        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" id="degrees-heading">התארים שלי</h2>
          <p className="text-gray-600">עקוב אחר ההתקדמות האקדמית שלך</p>
        </div>

        {/* Quick Stats */}
        {degrees.length > 0 && (
          <section aria-labelledby="stats-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <h3 id="stats-heading" className="sr-only">סטטיסטיקות מהירות</h3>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" aria-hidden="true" />
                  <div className="mr-4">
                    <p className="text-2xl font-bold text-gray-900" aria-label={`${degrees.length} תארים פעילים`}>{degrees.length}</p>
                    <p className="text-gray-600">תארים פעילים</p>
                  </div>
                </div>
              </CardContent>
            </Card><Card>
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
              </CardContent>            </Card>
          </section>
        )}

        {/* Degrees List */}
        <section aria-labelledby="degrees-heading">
          <div className="space-y-6">            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">התארים שלי</h3>
              <AddDegreeDialog />
            </div>

          {degrees.length === 0 ? (
            // Empty State
            <Card role="region" aria-labelledby="empty-state-heading">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                <h3 id="empty-state-heading" className="text-lg font-semibold text-gray-900 mb-2">
                  עדיין לא הוספת תארים
                </h3>
                <p className="text-gray-600 mb-6">
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
                </Card>              ))}
            </div>
          )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Developer Info */}
            <div className="text-center md:text-right">
              <p className="text-sm font-semibold text-gray-900">
                נבנה על ידי עדן מיכאלי הרשקו
              </p>
              <div className="flex justify-center md:justify-end space-x-4 space-x-reverse mt-2">
                <a
                  href="https://linkedin.com/in/eden-michaeli-hershko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  title="LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/edenmic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 text-sm transition-colors"
                  title="GitHub"
                >
                  GitHub
                </a>
                <a
                  href="mailto:eden.mic.her@gmail.com"
                  className="text-green-600 hover:text-green-800 text-sm transition-colors"
                  title="שלח מייל"
                >
                  מייל
                </a>
              </div>
            </div>

            {/* Support Info */}
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">
                נתקלתם בבאג או צריכים עזרה?
              </p>
              <a
                href="mailto:eden.mic.her@gmail.com?subject=GPA Calculator - תמיכה טכנית"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                נשמח לסייע! שלחו מייל
              </a>
              <p className="text-xs text-gray-400 mt-1">
                © {new Date().getFullYear()} GPA Calculator v1.0.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
