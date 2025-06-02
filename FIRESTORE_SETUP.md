# הוראות להגדרת Firebase Firestore

## 1. כללי אבטחה (Security Rules)

1. גש ל-Firebase Console: https://console.firebase.google.com
2. בחר את הפרויקט שלך
3. לך ל-Firestore Database
4. לחץ על "Rules"
5. החלף את הכללים הקיימים בכללים מהקובץ `firestore.rules`
6. לחץ "Publish"

## 2. אינדקסים (Indexes)

אם תקבל שגיאות על חסרים אינדקסים, Firebase יציע לך ליצור אותם אוטומטיט.
אתה יכול גם ליצור אותם ידנית:

### אינדקס עבור degrees:
- Collection: `degrees`
- Fields: `userId` (Ascending), `createdAt` (Descending)

### אינדקס עבור courses:
- Collection: `courses`
- Fields: `degreeId` (Ascending), `year` (Ascending), `semester` (Ascending)

## 3. בדיקה

אחרי ההגדרה:
1. הרץ את האפליקציה
2. נסה להתחבר עם Google
3. נסה להוסיף תואר
4. בדוק בקונסול הדפדפן (F12 -> Console) אם יש שגיאות
5. בדוק ב-Firestore Console אם הנתונים נשמרים

## 4. פתרון בעיות נפוצות

### שגיאה: "Missing or insufficient permissions"
- בדוק שהכללי אבטחה מוגדרים נכון
- וודא שהמשתמש מחובר לפני ביצוע פעולות

### שגיאה: "The query requires an index"
- Firebase יציע לך קישור ליצירת האינדקס
- לחץ על הקישור וחכה שהאינדקס ייבנה (כמה דקות)

### הנתונים לא נטענים אחרי רענון
- בדוק בקונסול אם יש שגיאות JavaScript
- וודא שה-useEffect רץ כמו שצריך
- בדוק ש-user.uid זהה בין הפעלות
