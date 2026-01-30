import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ArrowRight, Star, GitFork, Code2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const Hero = () => {
  return (
    <section className="pt-6 relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-bg-subtle" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">Now in public beta</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 text-balance"
        >
          Hire Developers Based on{' '}
          <span className="gradient-text">Real Code</span>,{' '}
          <br className="hidden sm:block" />
          Not Just Resumes
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          GitHire analyzes GitHub profiles to surface the best developers.
          Search by skills, stars, and activity. No more guessing.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/login">
            <Button variant="gradient" size="lg" icon={<Github className="w-5 h-5" />}>
              Continue with GitHub
            </Button>
          </Link>
          <Link to="/recruiter">
            <Button variant="outline" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              I'm a Recruiter
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">50K+</div>
            <div className="text-sm text-muted-foreground">Developers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">2M+</div>
            <div className="text-sm text-muted-foreground">Repos Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">500+</div>
            <div className="text-sm text-muted-foreground">Companies Hiring</div>
          </div>
        </motion.div>

        {/* Floating Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Main Card */}
            <div className="glass rounded-2xl p-6 shadow-2xl mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-foreground">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">@sarahchen · San Francisco</div>
                </div>
                <div className="ml-auto px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                  Open to Work
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Go', 'Kubernetes', 'gRPC', 'PostgreSQL'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Code2 className="w-4 h-4" /> 89 repos
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" /> 4.5K stars
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" /> 892 forks
                </span>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-8 -left-8 glass rounded-xl p-4 shadow-lg hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-foreground">Score: 95</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-8 -right-8 glass rounded-xl p-4 shadow-lg hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-foreground">Top 5% in Go</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
