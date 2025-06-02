import { useState } from 'react';
import { useDegrees } from '../contexts/DegreesContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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

const EditDegreeDialog = ({ degree, trigger }) => {
  const { updateDegree } = useDegrees();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: degree.name || '',
    institution: degree.institution || '',
    totalCredits: degree.totalCredits || '',
    status: degree.status || 'active',
    description: degree.description || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        totalCredits: parseFloat(formData.totalCredits) || 0
      };

      await updateDegree(degree.id, updateData);
      setOpen(false);
    } catch (error) {
      console.error('Error updating degree:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>עריכת תואר</DialogTitle>
          <DialogDescription>
            ערוך את פרטי התואר. השינויים יישמרו אוטומטית.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם התואר *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="לדוגמה: תואר ראשון במדעי המחשב"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">מוסד לימודים</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              placeholder="לדוגמה: האוניברסיטה העברית"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalCredits">סה״כ נק״ז נדרשות</Label>
              <Input
                id="totalCredits"
                type="number"
                min="0"
                step="0.5"
                value={formData.totalCredits}
                onChange={(e) => handleInputChange('totalCredits', e.target.value)}
                placeholder="120"
              />
            </div>

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
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="paused">מושהה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="פרטים נוספים על התואר..."
              rows={3}
            />
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

export default EditDegreeDialog;
