import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useDegrees } from '../contexts/DegreesContext';
import { Calculator, TrendingUp } from 'lucide-react';

const GPASimulator = ({ degreeId }) => {
  const { degrees, courses: allCourses } = useDegrees();
  const [simulatedCourses, setSimulatedCourses] = useState([]);
  const [targetGPA, setTargetGPA] = useState('');

  const degree = degrees.find(d => d.id === degreeId);
  const courses = allCourses.filter(c => c.degreeId === degreeId);
  if (!degree) return null;
  const calculateProjectedGPA = () => {
    // חישוב ממוצע צפוי עם קורסים חדשים
    const currentCourses = courses;
    const allCourses = [...currentCourses, ...simulatedCourses];
    
    let totalCredits = 0;
    let totalPoints = 0;
    
    allCourses.forEach(course => {
      if (course.status === 'graded' && course.grade >= 55) {
        totalCredits += course.credits;
        totalPoints += course.grade * course.credits;
      }
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const addSimulatedCourse = () => {
    setSimulatedCourses([...simulatedCourses, {
      id: Date.now(),
      name: '',
      credits: 3,
      grade: 85,
      status: 'graded'
    }]);
  };

  const updateSimulatedCourse = (id, field, value) => {
    setSimulatedCourses(simulatedCourses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const removeSimulatedCourse = (id) => {
    setSimulatedCourses(simulatedCourses.filter(course => course.id !== id));
  };
  const calculateRequiredGrade = () => {
    if (!targetGPA) return null;
    
    const currentCourses = courses;
    let currentCredits = 0;
    let currentPoints = 0;
    
    currentCourses.forEach(course => {
      if (course.status === 'graded' && course.grade >= 55) {
        currentCredits += course.credits;
        currentPoints += course.grade * course.credits;
      }
    });
    
    const remainingCredits = (degree.totalCredits || 120) - currentCredits;
    const requiredTotalPoints = targetGPA * (degree.totalCredits || 120);
    const requiredAdditionalPoints = requiredTotalPoints - currentPoints;
    
    if (remainingCredits <= 0) return null;
    
    const requiredAverage = requiredAdditionalPoints / remainingCredits;
    return Math.max(55, Math.min(100, requiredAverage)).toFixed(1);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Calculator className="h-5 w-5" />
          מחשבון חיזוי ציונים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* חיזוי ציונים */}
        <div className="space-y-3">
          <h3 className="font-semibold text-right">הוסף קורסים עתידיים:</h3>
          
          {simulatedCourses.map((course, index) => (
            <div key={course.id} className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => removeSimulatedCourse(course.id)}
                className="text-red-600"
              >
                ❌
              </Button>
              <Input
                placeholder="שם הקורס"
                value={course.name}
                onChange={(e) => updateSimulatedCourse(course.id, 'name', e.target.value)}
                className="text-right"
              />
              <Input
                type="number"
                placeholder="נק״ז"
                min="1"
                max="10"
                value={course.credits}
                onChange={(e) => updateSimulatedCourse(course.id, 'credits', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="ציון"
                min="0"
                max="100"
                value={course.grade}
                onChange={(e) => updateSimulatedCourse(course.id, 'grade', parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          ))}
          
          <Button onClick={addSimulatedCourse} variant="outline" className="w-full">
            + הוסף קורס
          </Button>
        </div>

        {/* תוצאות */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">ממוצע צפוי:</span>
            <span className="text-2xl font-bold text-blue-600">
              {calculateProjectedGPA()}
            </span>
          </div>
        </div>

        {/* מחשבון ציון נדרש */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold text-right">מחשבון ציון נדרש:</h3>
          <div className="flex gap-2 items-center">
            <Label>ממוצע יעד:</Label>
            <Input
              type="number"
              placeholder="85"
              min="55"
              max="100"
              step="0.1"
              value={targetGPA}
              onChange={(e) => setTargetGPA(e.target.value)}
              className="w-24"
            />
          </div>
          
          {targetGPA && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-right">
                כדי להגיע לממוצע {targetGPA}, תצטרך ממוצע של{' '}
                <span className="font-bold text-green-600">
                  {calculateRequiredGrade() || 'לא אפשרי'}
                </span>
                {' '}בקורסים הנותרים
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GPASimulator;
