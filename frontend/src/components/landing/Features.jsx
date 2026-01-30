import React from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Search,
  BarChart3,
  Shield,
  Zap,
  Users,
  Code2,
  Star,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'GitHub Analysis',
    description: 'We analyze repositories, commits, stars, and contribution patterns to build a complete developer profile.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Smart Ranking',
    description: 'Our algorithm scores developers based on code quality, activity, and language expertise.',
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Advanced Search',
    description: 'Filter by programming language, location, experience level, and minimum star count.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Verified Skills',
    description: 'Skills are extracted from actual code, not self-reported. What you see is what you get.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-time Updates',
    description: 'Profiles sync with GitHub to show the latest activity and contributions.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Team Collaboration',
    description: 'Share shortlists with your team and collaborate on hiring decisions.',
  },
];

const stats = [
  { icon: <Code2 className="w-8 h-8" />, value: '50+', label: 'Languages Supported' },
  { icon: <Star className="w-8 h-8" />, value: '98%', label: 'Match Accuracy' },
  { icon: <TrendingUp className="w-8 h-8" />, value: '3x', label: 'Faster Hiring' },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg-subtle opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything you need to hire{' '}
            <span className="gradient-text">top developers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform provides comprehensive tools to evaluate, compare, and hire developers based on their actual code.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-8 rounded-2xl bg-card border border-border"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
