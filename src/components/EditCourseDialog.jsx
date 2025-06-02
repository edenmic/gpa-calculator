import { useState } from 'react';
import { useDegrees } from '../contexts/DegreesContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Edit2, Loader2 } from 'lucide-react';
import ErrorAlert from './ErrorAlert';

const EditCourseDialog = ({ course, trigger }) => {
  const { updateCourse, degrees, courses } = useDegrees();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: course.name || '',
    code: course.code || '',
    credits: course.credits || '',
    semester: course.semester || 'א',
    year: course.year || '1',
    status: course.status || 'in-progress',
    grade: course.grade || '',
    isPassFail: course.isPassFail || false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      setError(null); // Clear any previous errors when opening
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Validate credits (max 10)
    const credits = parseFloat(formData.credits);
    if (credits > 10) {
      setError('כמות הנק"ז לא יכולה לעלות על 10');
      return;
    }

    if (credits <= 0) {
      setError('כמות הנק"ז חייבת להיות גדולה מ-0');
      return;
    }    // Check if updating credits will exceed the degree's total credits
    const currentDegree = degrees.find(d => d.id === course.degreeId);
    const currentCourses = courses.filter(c => c.degreeId === course.degreeId && c.id !== course.id);
    const currentTotalCredits = currentCourses.reduce((sum, c) => sum + c.credits, 0);
    
    if (currentTotalCredits + credits > currentDegree.totalCredits) {
      setError(`⚠️ חריגה מכמות הנק"ז הנדרשת!\n\nעדכון ל-${credits} נק"ז יגרום לחריגה מכמות הנק"ז הנדרשת לתואר.\n\n📊 נק"ז נוכחי (ללא קורס זה): ${currentTotalCredits}\n➕ נק"ז חדש לקורס: ${credits}\n📈 סך הכל: ${currentTotalCredits + credits}\n🎯 מותר: ${currentDegree.totalCredits}\n\n❌ חריגה: ${(currentTotalCredits + credits) - currentDegree.totalCredits} נק"ז`);
      return;
    }

    setLoading(true);
    setError(null);
    try {const updateData = {
        ...formData,
        credits: parseFloat(formData.credits) || 0,
        year: formData.year, // Keep as string since we use "1", "2", etc.
        grade: formData.isPassFail ? null : (parseFloat(formData.grade) || null)
      };      await updateCourse(course.id, updateData);
      setOpen(false);
    } catch (error) {
      console.error('Error updating course:', error);
      setError('שגיאה בעדכון הקורס');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>עריכת קורס</DialogTitle>
          <DialogDescription>
            ערוך את פרטי הקורס. השינויים יישמרו אוטומטית.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם הקורס *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="לדוגמה: מבוא למדעי המחשב"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">קוד הקורס</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="לדוגמה: CS101"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">            <div className="space-y-2">
              <Label htmlFor="credits">נק״ז (עד 10)</Label>
              <Input
                id="credits"
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', e.target.value)}
                placeholder="3"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">סמסטר</Label>
              <Select 
                value={formData.semester} 
                onValueChange={(value) => handleInputChange('semester', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="א">סמסטר א'</SelectItem>
                  <SelectItem value="ב">סמסטר ב'</SelectItem>
                  <SelectItem value="קיץ">סמסטר קיץ</SelectItem>
                </SelectContent>
              </Select>
            </div>            <div className="space-y-2">
              <Label htmlFor="year">שנה</Label>
              <Select 
                value={formData.year} 
                onValueChange={(value) => handleInputChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="1">שנה א'</SelectItem>
                  <SelectItem value="2">שנה ב'</SelectItem>
                  <SelectItem value="3">שנה ג'</SelectItem>
                  <SelectItem value="4">שנה ד'</SelectItem>
                  <SelectItem value="5">שנה ה'</SelectItem>
                  <SelectItem value="6">שנה ו'</SelectItem>
                  <SelectItem value="7">שנה ז'</SelectItem>
                  <SelectItem value="8">שנה ח'</SelectItem>
                  <SelectItem value="9">שנה ט'</SelectItem>
                  <SelectItem value="10">שנה י'</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">בתהליך</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="planned">מתוכנן</SelectItem>
                  <SelectItem value="dropped">נטוש</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">ציון</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                placeholder="85"
                disabled={formData.isPassFail || formData.status !== 'completed'}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isPassFail"
              checked={formData.isPassFail}
              onChange={(e) => handleInputChange('isPassFail', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPassFail">קורס עובר/נכשל</Label>          </div>

          {error && <ErrorAlert message={error} />}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              שמור שינויים
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
