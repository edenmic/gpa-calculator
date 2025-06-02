# GPA Calculator - מחשבון ממוצע

## תיאור הפרויקט

אפליקציית ווב לחישוב ממוצע ציונים (GPA) במוסדות הלימוד הגבוהים בישראל. האפליקציה מאפשרת מעקב אחר תארים מרובים, קורסים, ציונים ונקודות זכות.

## תכונות עיקריות

### 🎓 ניהול תארים
- יצירת ועריכת תארים מרובים
- מעקב אחר התקדמות לפי נקודות זכות
- תמיכה בתארים שונים (תואר ראשון, שני, וכו')

### 📚 ניהול קורסים
- הוספת קורסים עם פרטים מלאים
- תמיכה בציונים מספריים (0-100)
- תמיכה בקורסים עובר/נכשל
- ארגון לפי שנים וסמסטרים
- תמיכה בעברית: שנים א', ב', ג' וכו'

### 📊 חישובי ממוצע מתקדמים
- חישוב ממוצע כללי משוקלל
- ממוצע לפי שנה וסמסטר
- התחשבות בנקודות זכות
- הפרדה בין קורסים מציונים לעובר/נכשל

### 📱 ממשק משתמש מתקדם
- עיצוב רספונסיבי לנייד ומחשב
- תמיכה מלאה בעברית (RTL)
- אנימציות וויזואליזציה של התקדמות
- אייקונים ורמות צבע לפי הישגים

### 🔐 אבטחה והתחברות
- התחברות מאובטחת עם Google
- שמירת נתונים בענן (Firebase)
- גיבוי אוטומטי של כל הנתונים

## טכנולוגיות

- **Frontend**: React 18, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Authentication & Firestore)
- **State Management**: React Context
- **Routing**: React Router DOM

## התקנה והפעלה

### דרישות מוקדמות
- Node.js (גרסה 16 ומעלה)
- npm או yarn
- חשבון Firebase

### שלבי התקנה

1. **שכפול הפרויקט:**
```bash
git clone https://github.com/[USERNAME]/gpa-calculator.git
cd gpa-calculator
```

2. **התקנת תלויות:**
```bash
npm install
```

3. **הגדרת Firebase:**
- צור פרויקט חדש ב-Firebase Console
- הפעל Authentication עם Google Provider
- צור Firestore Database
- העתק את הגדרות הפרויקט לקובץ `src/config/firebase.js`

4. **הפעלת השרת המקומי:**
```bash
npm run dev
```

### הגדרת Firebase

עקוב אחר ההוראות המפורטות בקובץ `FIRESTORE_SETUP.md`.

## שימוש

1. **התחברות:** התחבר עם חשבון Google
2. **יצירת תואר:** הוסף תואר חדש עם פרטים
3. **הוספת קורסים:** הוסף קורסים לכל תואר
4. **צפייה בסטטיסטיקות:** צפה בממוצע והתקדמות
5. **עריכה:** ערוך קורסים ותארים בכל עת

## מבנה הפרויקט

```
src/
├── components/          # רכיבי UI
│   ├── ui/             # רכיבי shadcn/ui
│   └── *.jsx           # רכיבי האפליקציה
├── contexts/           # Context providers
├── pages/              # דפי האפליקציה
├── config/             # הגדרות Firebase
├── hooks/              # Custom React hooks
└── lib/                # פונקציות עזר
```

## תרומה לפרויקט

נשמח לתרומות! אנא:
1. צור Fork של הפרויקט
2. צור branch חדש לתכונה שלך
3. בצע commit עם הודעה ברורה
4. פתח Pull Request

## רישיון

הפרויקט הזה ברישיון MIT. ראה קובץ LICENSE לפרטים.

## צור קשר

לשאלות או הצעות, אנא פתח Issue בגיטהאב.

---

🎯 **נבנה עם ❤️ לסטודנטים בישראל**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
