import React, { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useDegrees } from '../contexts/DegreesContext';
import { Download, FileText, Table } from 'lucide-react';

const ExportData = ({ degreeId }) => {
  const { degrees, courses: allCourses } = useDegrees();
  const degree = degrees.find(d => d.id === degreeId);
  const courses = allCourses.filter(c => c.degreeId === degreeId);
  
  if (!degree) return null;

  const calculateDegreeStats = (courses) => {
    let totalCredits = 0;
    let completedCredits = 0;
    let totalPoints = 0;
    let passedCourses = 0;
    let failedCourses = 0;
    let gradedCourses = 0;    courses.forEach(course => {
      if (course.status === 'completed') {
        if (course.isPassing === true) {
          // Pass/fail course that passed
          completedCredits += course.credits;
          passedCourses++;
        } else if (course.isPassing === false) {
          // Pass/fail course that failed
          failedCourses++;
        } else if (course.grade !== null && course.grade !== undefined) {
          // Graded course
          gradedCourses++;
          if (course.grade >= 55) {
            completedCredits += course.credits;
            totalPoints += course.grade * course.credits;
            passedCourses++;
          } else {
            failedCourses++;
          }
        }
      } else if (course.status === 'in-progress') {
        // Course in progress - don't count in any calculations
      }
      
      if (course.status !== 'in-progress') {
        totalCredits += course.credits;
      }
    });

    // חישוב ממוצע נכון - רק על בסיס קורסים עם ציון
    let gradedCredits = 0;
    let gradedPoints = 0;
    
    courses.forEach(course => {
      if (course.status === 'completed' && 
          course.grade !== null && 
          course.grade !== undefined && 
          !course.isPassing &&
          course.grade >= 55) {
        gradedCredits += course.credits;
        gradedPoints += course.grade * course.credits;
      }
    });

    const gpa = gradedCredits > 0 ? (gradedPoints / gradedCredits) : 0;
    const progress = degree.totalCredits ? (completedCredits / degree.totalCredits) * 100 : 0;

    return {
      gpa: gpa.toFixed(2),
      completedCredits,
      totalCredits,
      progress: progress.toFixed(1),
      passedCourses,
      failedCourses,
      gradedCourses,
      totalCourses: courses.length
    };
  };
  const exportToCSV = () => {
    const stats = calculateDegreeStats(courses);
    
    // כותרות עברית
    const headers = [
      'שם הקורס',
      'שנה',
      'סמסטר', 
      'נקודות זכות',
      'סטטוס',
      'ציון'
    ];    // הוספת נתונים
    const rows = courses.map(course => [
      course.name,
      `שנה ${['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'][course.year - 1]}`,
      course.semester === 'א' ? 'סמסטר א\'' : 
      course.semester === 'ב' ? 'סמסטר ב\'' : 
      course.semester === 'קיץ' ? 'סמסטר קיץ' : 
      'לא הוגדר',
      course.credits,
      course.status === 'completed' 
        ? (course.isPassing === true ? 'עבר' 
           : course.isPassing === false ? 'נכשל' 
           : 'הושלם')
        : 'בתהליך',
      course.status === 'completed' && course.grade !== null && course.grade !== undefined && !course.isPassing 
        ? course.grade 
        : ''
    ]);
    
    // הוספת סיכום
    rows.push([]);
    rows.push(['=== סיכום ===']);
    rows.push(['ממוצע כללי', stats.gpa]);
    rows.push(['נקודות זכות שנצברו', stats.completedCredits]);
    rows.push(['אחוז התקדמות', `${stats.progress}%`]);
    rows.push(['קורסים שעברו', stats.passedCourses]);
    rows.push(['קורסים שנכשלו', stats.failedCourses]);
    
    // יצירת תוכן CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // הורדה
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${degree.name}_תעודה.csv`;
    link.click();
  };
  const exportToPDF = () => {
    const stats = calculateDegreeStats(courses);
    
    // יצירת תוכן HTML לדפוס
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>תעודה - ${degree.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .stats { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #4CAF50; color: white; }
          .passed { background-color: #d4edda; }
          .failed { background-color: #f8d7da; }
          .in-progress { background-color: #fff3cd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>תעודה אקדמית</h1>
          <h2>${degree.name}</h2>
          <p>תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</p>
        </div>
        
        <div class="stats">
          <h3>סיכום כללי</h3>
          <p><strong>ממוצע כללי:</strong> ${stats.gpa}</p>
          <p><strong>נקודות זכות שנצברו:</strong> ${stats.completedCredits} מתוך ${degree.totalCredits || 'לא הוגדר'}</p>
          <p><strong>אחוז התקדמות:</strong> ${stats.progress}%</p>
          <p><strong>קורסים שעברו:</strong> ${stats.passedCourses}</p>
          <p><strong>קורסים שנכשלו:</strong> ${stats.failedCourses}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>שם הקורס</th>
              <th>שנה</th>
              <th>סמסטר</th>
              <th>נק״ז</th>
              <th>ציון</th>
              <th>סטטוס</th>
            </tr>
          </thead>          <tbody>
            ${courses.map(course => {
              const status = course.status === 'completed' 
                ? (course.isPassing === true ? 'עבר' 
                   : course.isPassing === false ? 'נכשל' 
                   : 'הושלם')
                : 'בתהליך';
              
              const grade = course.status === 'completed' && course.grade !== null && course.grade !== undefined && !course.isPassing 
                ? course.grade 
                : '-';
                
              const cssClass = course.status === 'completed' 
                ? (course.isPassing === false ? 'failed' : 'passed')
                : 'in-progress';
                
              return `
              <tr class="${cssClass}">
                <td>${course.name}</td>
                <td>שנה ${['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'][course.year - 1]}</td>                <td>${course.semester === 'א' ? 'סמסטר א\'' : 
                      course.semester === 'ב' ? 'סמסטר ב\'' : 
                      course.semester === 'קיץ' ? 'סמסטר קיץ' : 
                      'לא הוגדר'}</td>
                <td>${course.credits}</td>
                <td>${grade}</td>
                <td>${status}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // פתיחה בחלון חדש לדפוס
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToJSON = () => {
    const exportData = {
      degree: {
        name: degree.name,
        totalCredits: degree.totalCredits,
        startYear: degree.startYear
      },      courses: courses,
      statistics: calculateDegreeStats(courses),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${degree.name}_נתונים.json`;
    link.click();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Download className="h-5 w-5" />
          ייצוא נתונים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            תעודה (PDF)
          </Button>
          
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Excel/CSV
          </Button>
          
          <Button onClick={exportToJSON} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            גיבוי (JSON)
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 text-right">
          <p>• תעודה - דוח מסודר עם כל הקורסים והציונים</p>
          <p>• Excel/CSV - לעיבוד נתונים בתוכנות חיצוניות</p>
          <p>• גיבוי - לשמירה והעברה של כל הנתונים</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportData;
