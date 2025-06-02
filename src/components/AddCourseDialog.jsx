import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDegrees } from '../contexts/DegreesContext';
import { Plus } from 'lucide-react';
import ErrorAlert from './ErrorAlert';

const AddCourseDialog = ({ degreeId, trigger }) => {
  const { addCourse, degrees, courses } = useDegrees();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
    name: '',
    credits: '',
    grade: '',    status: 'planned',
    semester: '',
    year: '1',
    isPassing: null, // null = graded, true = pass, false = fail
    isPassFail: false // checkbox to determine if it's pass/fail course
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.credits || !formData.semester || !formData.year) {
      setError('אנא מלא את כל השדות הנדרשים');
      return;
    }

    // Validate credits (max 10)
    const credits = parseFloat(formData.credits);
    if (credits > 10) {
      setError('כמות הנק"ז לא יכולה לעלות על 10');
      return;
    }

    if (credits <= 0) {
      setError('כמות הנק"ז חייבת להיות גדולה מ-0');
      return;
    }    // Check if adding this course will exceed the degree's total credits
    const currentDegree = degrees.find(d => d.id === degreeId);
    const currentCourses = courses.filter(c => c.degreeId === degreeId);
    const currentTotalCredits = currentCourses.reduce((sum, course) => sum + course.credits, 0);
    
    if (currentTotalCredits + credits > currentDegree.totalCredits) {
      setError(`⚠️ חריגה מכמות הנק"ז הנדרשת!\n\nהוספת ${credits} נק"ז תגרום לחריגה מכמות הנק"ז הנדרשת לתואר.\n\n📊 נק"ז נוכחי: ${currentTotalCredits}\n➕ נק"ז להוסיף: ${credits}\n📈 סך הכל: ${currentTotalCredits + credits}\n🎯 מותר: ${currentDegree.totalCredits}\n\n❌ חריגה: ${(currentTotalCredits + credits) - currentDegree.totalCredits} נק"ז`);
      return;
    }

    // Validate grade for completed courses
    if (formData.status === 'completed' && !formData.isPassFail && !formData.grade) {
      setError('אנא הזן ציון עבור קורס שהושלם');
      return;
    }

    // Validate pass/fail for completed pass/fail courses
    if (formData.status === 'completed' && formData.isPassFail && formData.isPassing === null) {
      setError('אנא בחר עובר/נכשל עבור קורס עובר/נכשל');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const courseData = {
        ...formData,
        degreeId,
        credits: parseFloat(formData.credits),
        grade: formData.isPassFail ? null : (formData.grade ? parseFloat(formData.grade) : null),
        year: parseInt(formData.year),
        isPassing: formData.isPassFail ? formData.isPassing : null
      };

      // Remove isPassFail from the data we send to Firestore
      delete courseData.isPassFail;
      
      await addCourse(courseData);
      
      // Reset form and close dialog
      setFormData({
        name: '',
        credits: '',
        grade: '',
        status: 'planned',        semester: '',
        year: '1',
        isPassing: null,
        isPassFail: false
      });
      setOpen(false);
    } catch (error) {
      setError('שגיאה בהוספת הקורס');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePassFailToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      isPassFail: checked,
      grade: checked ? '' : prev.grade,
      isPassing: checked ? null : null
    }));
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      setError(null); // Clear any previous errors when opening
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center">
            <Plus className="h-4 w-4 ml-2" />
            הוסף קורס
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>הוסף קורס חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי הקורס החדש
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorAlert error={error} onRetry={() => setError(null)} />}
          
          <div className="space-y-2">
            <Label htmlFor="name">שם הקורס *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="למשל: מבוא למדעי המחשב"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">            <div className="space-y-2">
              <Label htmlFor="credits">נקודות זכות * (עד 10)</Label>
              <Input
                id="credits"
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', e.target.value)}
                placeholder="4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">שנה *</Label>
              <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר שנה" />
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
              <Label htmlFor="semester">סמסטר *</Label>
              <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סמסטר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="א">סמסטר א'</SelectItem>
                  <SelectItem value="ב">סמסטר ב'</SelectItem>
                  <SelectItem value="קיץ">סמסטר קיץ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">מתוכנן</SelectItem>
                  <SelectItem value="in-progress">בתהליך</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="failed">נכשל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pass/Fail Checkbox */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="passFailCourse"
              checked={formData.isPassFail}
              onCheckedChange={handlePassFailToggle}
            />
            <Label htmlFor="passFailCourse">קורס עובר/נכשל</Label>
          </div>

          {/* Grade or Pass/Fail Selection */}
          {formData.status === 'completed' && (
            <div className="space-y-2">
              {formData.isPassFail ? (
                <div>
                  <Label>תוצאה *</Label>
                  <Select 
                    value={formData.isPassing === null ? '' : formData.isPassing.toString()} 
                    onValueChange={(value) => handleInputChange('isPassing', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תוצאה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">עובר</SelectItem>
                      <SelectItem value="false">נכשל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="grade">ציון *</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder="85"
                    required
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'מוסיף...' : 'הוסף קורס'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
