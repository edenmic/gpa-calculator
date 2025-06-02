import { useState } from 'react';
import { useDegrees } from '../contexts/DegreesContext';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';

const DeleteDegreeDialog = ({ degree, trigger }) => {
  const { deleteDegree } = useDegrees();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDegree(degree.id);
      setOpen(false);
    } catch (error) {
      console.error('Error deleting degree:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת תואר</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            האם אתה בטוח שברצונך למחוק את התואר "<strong>{degree.name}</strong>"?
            <br />
            <br />
            <span className="text-red-600 font-medium">
              פעולה זו תמחק גם את כל הקורסים הקשורים לתואר זה ולא ניתן לבטלה.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel disabled={loading}>
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            מחק תואר
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDegreeDialog;
