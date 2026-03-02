import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to find your next hire?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of companies using SkillHire to find and hire the best developers.
            Get started for free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-white/90 shadow-xl dark:bg-white dark:text-gray-900"
                icon={<Github className="w-5 h-5" />}
              >
                Get Started Free
              </Button>

            </Link>
            <Link to="/recruiter">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-2 border-white/30 hover:bg-white/10"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Explore as Recruiter
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/60">
            No credit card required · Free forever for developers
          </p>
        </motion.div>
      </div>
    </section>
  );
};
