import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const DegreesContext = createContext();

export const useDegrees = () => {
  const context = useContext(DegreesContext);
  if (!context) {
    throw new Error('useDegrees must be used within a DegreesProvider');
  }
  return context;
};

export const DegreesProvider = ({ children }) => {
  const { user } = useAuth();
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Fetch degrees for current user
  const fetchDegrees = async () => {
    if (!user) {
      console.log('No user found, clearing degrees');
      setDegrees([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching degrees for user:', user.uid);
      setLoading(true);
      
      // Simple query first - just by userId
      const q = query(
        collection(db, 'degrees'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Degrees query result:', querySnapshot.size, 'documents');
      
      const degreesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt on client side
      degreesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      console.log('Degrees data:', degreesData);
      setDegrees(degreesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching degrees:', error);
      setError('שגיאה בטעינת התארים');
    } finally {
      setLoading(false);
    }
  };  // Fetch all courses for all user's degrees
  const fetchAllCourses = async () => {
    if (!user || degrees.length === 0) {
      setCourses([]);
      return;
    }

    try {
      const degreeIds = degrees.map(d => d.id);
      let allCourses = [];

      // Firebase 'in' operator has a limit of 10 items, so we need to batch if needed
      for (let i = 0; i < degreeIds.length; i += 10) {
        const batch = degreeIds.slice(i, i + 10);
        const q = query(
          collection(db, 'courses'),
          where('degreeId', 'in', batch)
        );
        
        const querySnapshot = await getDocs(q);
        const batchCourses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        allCourses = [...allCourses, ...batchCourses];
      }
      
      // Sort courses on client side
      allCourses.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const semesterOrder = { 'א': 1, 'ב': 2, 'קיץ': 3 };
        return (semesterOrder[a.semester] || 4) - (semesterOrder[b.semester] || 4);
      });
      
      console.log('Fetched courses:', allCourses.length);
      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('שגיאה בטעינת הקורסים');
    }
  };

  // Fetch courses for a specific degree
  const fetchCourses = async (degreeId) => {
    if (!degreeId) return [];    try {
      const q = query(
        collection(db, 'courses'),
        where('degreeId', '==', degreeId)
      );
      
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
        // Sort on client side
      const sortedCourses = coursesData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const semesterOrder = { 'א': 1, 'ב': 2, 'קיץ': 3 };
        return (semesterOrder[a.semester] || 4) - (semesterOrder[b.semester] || 4);
      });
      
      return sortedCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('שגיאה בטעינת הקורסים');
      return [];
    }
  };
  // Add new degree
  const addDegree = async (degreeData) => {
    try {
      console.log('Adding degree for user:', user.uid, 'Data:', degreeData);
      const docData = {
        ...degreeData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'degrees'), docData);
      console.log('Degree added with ID:', docRef.id);
      
      const newDegree = { id: docRef.id, ...docData };
      
      setDegrees(prev => [newDegree, ...prev]);
      return newDegree;
    } catch (error) {
      console.error('Error adding degree:', error);
      setError('שגיאה בהוספת התואר');
      throw error;
    }
  };
  // Update degree
  const updateDegree = async (degreeId, updateData) => {
    try {
      console.log('Updating degree:', degreeId, 'with data:', updateData);
      
      const degreeRef = doc(db, 'degrees', degreeId);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await updateDoc(degreeRef, updatePayload);
      
      setDegrees(prev => prev.map(degree => 
        degree.id === degreeId 
          ? { ...degree, ...updatePayload }
          : degree
      ));
      
      console.log('Degree updated successfully');
    } catch (error) {
      console.error('Error updating degree:', error);
      setError('שגיאה בעדכון התואר');
      throw error;
    }
  };
  // Delete degree
  const deleteDegree = async (degreeId) => {
    try {
      console.log('Deleting degree:', degreeId);
      
      // First delete all courses for this degree
      const coursesQuery = query(
        collection(db, 'courses'),
        where('degreeId', '==', degreeId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      
      console.log('Found courses to delete:', coursesSnapshot.size);
      
      // Delete courses
      const deletePromises = coursesSnapshot.docs.map(courseDoc => 
        deleteDoc(doc(db, 'courses', courseDoc.id))
      );
      await Promise.all(deletePromises);
      
      // Delete degree
      await deleteDoc(doc(db, 'degrees', degreeId));
      
      // Update local state
      setDegrees(prev => prev.filter(degree => degree.id !== degreeId));
      setCourses(prev => prev.filter(course => course.degreeId !== degreeId));
      
      console.log('Degree and courses deleted successfully');
    } catch (error) {
      console.error('Error deleting degree:', error);
      setError('שגיאה במחיקת התואר');
      throw error;
    }
  };  // Add new course
  const addCourse = async (courseData) => {
    try {
      const docData = {
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'courses'), docData);
      const newCourse = { id: docRef.id, ...docData };
      
      // Update local state first
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      
      // Calculate stats with the updated courses array
      const degreeCourses = updatedCourses.filter(course => course.degreeId === courseData.degreeId);
      const stats = calculateDegreeStats(degreeCourses);
      
      // Update degree document
      await updateDegree(courseData.degreeId, {
        currentGPA: stats.currentGPA,
        completedCredits: stats.completedCredits
      });
      
      return newCourse;
    } catch (error) {
      console.error('Error adding course:', error);
      setError('שגיאה בהוספת הקורס');
      throw error;
    }
  };  // Update course
  const updateCourse = async (courseId, updateData) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await updateDoc(courseRef, updatePayload);
      
      // Find the course to get the degreeId before updating
      const course = courses.find(c => c.id === courseId);
      
      // Update local state
      const updatedCourses = courses.map(course => 
        course.id === courseId 
          ? { ...course, ...updatePayload }
          : course
      );
      setCourses(updatedCourses);
      
      // Calculate stats with the updated courses array
      if (course) {
        const degreeCourses = updatedCourses.filter(c => c.degreeId === course.degreeId);
        const stats = calculateDegreeStats(degreeCourses);
        
        // Update degree document
        await updateDegree(course.degreeId, {
          currentGPA: stats.currentGPA,
          completedCredits: stats.completedCredits
        });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setError('שגיאה בעדכון הקורס');
      throw error;
    }
  };
  // Delete course
  const deleteCourse = async (courseId) => {
    try {
      const course = courses.find(c => c.id === courseId);
      
      await deleteDoc(doc(db, 'courses', courseId));
      
      // Update local state
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      
      // Calculate stats with the updated courses array
      if (course) {
        const degreeCourses = updatedCourses.filter(c => c.degreeId === course.degreeId);
        const stats = calculateDegreeStats(degreeCourses);
        
        // Update degree document
        await updateDegree(course.degreeId, {
          currentGPA: stats.currentGPA,
          completedCredits: stats.completedCredits
        });
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('שגיאה במחיקת הקורס');
      throw error;
    }
  };// Calculate degree statistics from courses array
  const calculateDegreeStats = (degreeCourses) => {
    console.log('Calculating stats for courses:', degreeCourses.length);
    
    // All completed courses (regardless of grading type)
    const allCompletedCourses = degreeCourses.filter(course => 
      course.status === 'completed'
    );
    
    console.log('Completed courses:', allCompletedCourses.length);
    
    // Graded courses (have numeric grade and not pass/fail)
    const gradedCourses = allCompletedCourses.filter(course => 
      course.grade !== null && 
      course.grade !== undefined &&
      course.isPassing !== true
    );
    
    console.log('Graded courses:', gradedCourses.length);
    
    // Pass/fail courses that passed
    const passedCourses = allCompletedCourses.filter(course => 
      course.isPassing === true
    );
    
    console.log('Passed courses:', passedCourses.length);
    
    // All successfully completed courses (graded + passed)
    const successfulCourses = [...gradedCourses, ...passedCourses];
    
    console.log('Total successful courses:', successfulCourses.length);
    
    // Calculate GPA (only for graded courses)
    let totalWeightedGrades = 0;
    let totalGradedCredits = 0;
    
    gradedCourses.forEach(course => {
      totalWeightedGrades += course.grade * course.credits;
      totalGradedCredits += course.credits;
    });
    
    // Calculate total completed credits (all successful courses)
    const completedCredits = successfulCourses.reduce((sum, course) => sum + course.credits, 0);      
    const currentGPA = totalGradedCredits > 0 ? totalWeightedGrades / totalGradedCredits : 0;
    
    console.log('Calculated stats:', { currentGPA, completedCredits });
    
    return { currentGPA, completedCredits };
  };

  // Calculate and update degree statistics
  const updateDegreeStats = async (degreeId) => {
    try {
      // Use current local state instead of fetching from DB
      const degreeCourses = courses.filter(course => course.degreeId === degreeId);
        const stats = calculateDegreeStats(degreeCourses);
      
      // Update degree document
      await updateDegree(degreeId, {
        currentGPA: stats.currentGPA,
        completedCredits: stats.completedCredits
      });
      
    } catch (error) {
      console.error('Error updating degree stats:', error);
    }
  };
  // Fetch degrees when user changes
  useEffect(() => {
    fetchDegrees();
  }, [user]);

  // Fetch courses when degrees are loaded
  useEffect(() => {
    if (degrees.length > 0) {
      fetchAllCourses();
    }
  }, [degrees, user]);  const value = {
    degrees,
    courses,
    loading,
    error,
    setError,
    fetchDegrees,
    fetchCourses,
    fetchAllCourses,
    addDegree,
    updateDegree,
    deleteDegree,
    addCourse,
    updateCourse,
    deleteCourse,
    updateDegreeStats,
    calculateDegreeStats
  };

  return (
    <DegreesContext.Provider value={value}>
      {children}
    </DegreesContext.Provider>
  );
};
