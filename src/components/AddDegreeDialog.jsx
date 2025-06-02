import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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

const AddDegreeDialog = ({ trigger }) => {
  const { addDegree } = useDegrees();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
    name: '',
    totalCredits: '',
    degreeType: '',
    institution: '',
    status: 'active',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.totalCredits || !formData.degreeType) {
      setError('אנא מלא את כל השדות הנדרשים');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await addDegree({
        ...formData,
        totalCredits: parseFloat(formData.totalCredits),
        completedCredits: 0,
        currentGPA: 0
      });
        // Reset form and close dialog
      setFormData({
        name: '',
        totalCredits: '',
        degreeType: '',
        institution: '',
        status: 'active',
        description: ''
      });
      setOpen(false);
    } catch (error) {
      setError('שגיאה בהוספת התואר');
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center">
            <Plus className="h-4 w-4 ml-2" />
            הוסף תואר חדש
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוסף תואר חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי התואר החדש שברצונך לעקוב אחריו
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorAlert error={error} onRetry={() => setError(null)} />}
          
          <div className="space-y-2">
            <Label htmlFor="name">שם התואר *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="למשל: תואר ראשון במדעי המחשב"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="degreeType">סוג התואר *</Label>
            <Select value={formData.degreeType} onValueChange={(value) => handleInputChange('degreeType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג תואר" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bachelor">תואר ראשון</SelectItem>
                <SelectItem value="master">תואר שני</SelectItem>
                <SelectItem value="doctorate">תואר שלישי</SelectItem>
                <SelectItem value="diploma">תעודה</SelectItem>
                <SelectItem value="certificate">הסמכה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">מוסד לימודים</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              placeholder="למשל: אוניברסיטת תל אביב"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCredits">סך נקודות זכות לסיום התואר *</Label>
            <Input
              id="totalCredits"
              type="number"
              step="0.5"
              value={formData.totalCredits}
              onChange={(e) => handleInputChange('totalCredits', e.target.value)}
              placeholder="למשל: 121.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">סטטוס</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
                <SelectItem value="paused">מושהה</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {loading ? 'מוסיף...' : 'הוסף תואר'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDegreeDialog;
