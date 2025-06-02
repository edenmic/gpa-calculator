import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import ErrorAlert from '../components/ErrorAlert';
import { BookOpen, Calculator, TrendingUp } from 'lucide-react';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      setError('שגיאה בהתחברות. אנא ווידא שהגדרת את Firebase בצורה נכונה.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 pb-24">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GPA Calculator</h1>
          <p className="text-gray-600 mt-2">מחשבון ממוצע תואר מתקדם</p>
        </div>

        {/* Features Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">מה תוכל לעשות?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 space-x-reverse">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">ניהול תארים מרובים</h3>
                <p className="text-sm text-gray-600">עקוב אחר כמה תארים במקביל</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-x-reverse">
              <Calculator className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">חישוב ממוצע מדויק</h3>
                <p className="text-sm text-gray-600">ממוצע משוקלל לפי נק"ז</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-x-reverse">
              <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">מעקב התקדמות</h3>
                <p className="text-sm text-gray-600">גרפים וסטטיסטיקות מתקדמות</p>
              </div>
            </div>
          </CardContent>
        </Card>        {/* Login Button */}
        <Card>
          <CardContent className="pt-6">
            <ErrorAlert 
              error={error} 
              onRetry={() => setError(null)} 
            />
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 ml-2"></div>
                  מתחבר...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  התחבר עם Google
                </div>
              )}
            </Button>
          </CardContent>
        </Card>        <p className="text-center text-sm text-gray-500">
          על ידי התחברות אתה מסכים לתנאי השימוש
        </p>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Developer Info */}            <div className="text-center md:text-right">
              <p className="text-sm font-semibold text-gray-900">
                נבנה על ידי עדן מיכאלי הרשקו
              </p>
              <div className="flex justify-center md:justify-end space-x-4 space-x-reverse mt-2">
                <a
                  href="https://linkedin.com/in/eden-michaeli-hershko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  title="LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/edenmic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 text-sm transition-colors"
                  title="GitHub"
                >
                  GitHub
                </a>
                <a
                  href="mailto:eden.mic.her@gmail.com"
                  className="text-green-600 hover:text-green-800 text-sm transition-colors"
                  title="שלח מייל"
                >
                  מייל
                </a>
              </div>
            </div>            {/* Support Info */}
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">
                נתקלתם בבאג או צריכים עזרה?
              </p>
              <a
                href="mailto:eden.mic.her@gmail.com?subject=GPA Calculator - תמיכה טכנית"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                נשמח לסייע! שלחו מייל
              </a>
              <p className="text-xs text-gray-400 mt-1">
                © {new Date().getFullYear()} GPA Calculator v1.0.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
