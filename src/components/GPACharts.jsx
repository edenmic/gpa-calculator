import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useDegrees } from '../contexts/DegreesContext';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const GPACharts = ({ degreeId }) => {
  const { degrees, courses: allCourses } = useDegrees();
  const degree = degrees.find(d => d.id === degreeId);
  const courses = allCourses.filter(c => c.degreeId === degreeId);
  
  if (!degree || !courses) return null;
  // נתונים לגרף התקדמות לפי שנים
  const getYearlyData = () => {
    const yearlyStats = {};
    
    courses.forEach(course => {
      if (course.status === 'graded' && course.grade >= 55) {
        if (!yearlyStats[course.year]) {
          yearlyStats[course.year] = {
            year: `שנה ${['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'][course.year - 1]}`,
            totalCredits: 0,
            totalPoints: 0,
            courseCount: 0
          };
        }
        
        yearlyStats[course.year].totalCredits += course.credits;
        yearlyStats[course.year].totalPoints += course.grade * course.credits;
        yearlyStats[course.year].courseCount++;
      }
    });
    
    return Object.values(yearlyStats).map(year => ({
      ...year,
      gpa: year.totalCredits > 0 ? (year.totalPoints / year.totalCredits).toFixed(1) : 0
    })).sort((a, b) => a.year.localeCompare(b.year));
  };

  // נתונים לגרף התפלגות ציונים
  const getGradeDistribution = () => {
    const ranges = {
      '55-69': { name: '55-69', count: 0, color: '#ef4444' },
      '70-79': { name: '70-79', count: 0, color: '#f97316' },
      '80-89': { name: '80-89', count: 0, color: '#eab308' },
      '90-100': { name: '90-100', count: 0, color: '#22c55e' }
    };
      courses.forEach(course => {
      if (course.status === 'graded') {
        if (course.grade >= 90) ranges['90-100'].count++;
        else if (course.grade >= 80) ranges['80-89'].count++;
        else if (course.grade >= 70) ranges['70-79'].count++;
        else if (course.grade >= 55) ranges['55-69'].count++;
      }
    });
    
    return Object.values(ranges).filter(range => range.count > 0);
  };
  // נתונים לגרף נקודות זכות לפי שנה
  const getCreditsByYear = () => {
    const yearlyCredits = {};
    
    courses.forEach(course => {
      if (course.status === 'graded' && course.grade >= 55) {
        const yearName = `שנה ${['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'][course.year - 1]}`;
        yearlyCredits[yearName] = (yearlyCredits[yearName] || 0) + course.credits;
      }
    });
    
    return Object.entries(yearlyCredits).map(([year, credits]) => ({
      year,
      credits
    }));
  };

  const yearlyData = getYearlyData();
  const gradeDistribution = getGradeDistribution();
  const creditsByYear = getCreditsByYear();

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <TrendingUp className="h-5 w-5" />
          גרפים וסטטיסטיקות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">התקדמות</TabsTrigger>
            <TabsTrigger value="distribution">התפלגות ציונים</TabsTrigger>
            <TabsTrigger value="credits">נקודות זכות</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-semibold mb-4 text-right">התקדמות ממוצע לפי שנים</h3>
              {yearlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[50, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  אין מספיק נתונים להצגה
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-semibold mb-4 text-right">התפלגות ציונים</h3>
              {gradeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  אין מספיק נתונים להצגה
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="credits" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-semibold mb-4 text-right">נקודות זכות לפי שנה</h3>
              {creditsByYear.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={creditsByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="credits" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  אין מספיק נתונים להצגה
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GPACharts;
