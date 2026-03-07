import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ArrowLeft, Code2, Star, GitFork } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithGitHub } = useAuth();

  const handleGitHubLogin = () => {
    setLoading(true);
    loginWithGitHub();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">GitHire</span>
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground mb-8">
              Sign in with your GitHub account to access your profile and get discovered by top recruiters.
            </p>



            <Button
              variant="github"
              size="lg"
              className="w-full mb-4"
              onClick={handleGitHubLogin}
              loading={loading}
              icon={<Github className="w-5 h-5" />}
            >
              Continue with GitHub
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                What happens when you sign in:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Code2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    We analyze your public GitHub profile and repositories
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    A developer score is calculated based on your contributions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <GitFork className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Your profile becomes visible to recruiters (optional)
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="absolute inset-0 flex items-center justify-center p-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full max-w-lg"
          >
            {/* Mock Profile Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                  JD
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    John Doe
                  </div>
                  <div className="text-white/70">@johndoe</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">47</div>
                  <div className="text-xs text-white/60">Repos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1.2K</div>
                  <div className="text-xs text-white/60">Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2.8K</div>
                  <div className="text-xs text-white/60">Commits</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['TypeScript', 'React', 'Node.js', 'Python'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-white/20 text-white text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white rounded-xl px-4 py-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-semibold text-gray-800">
                  Score: 92
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
