import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Search,
  BarChart3,
  MessageSquare,
  UserCheck,
  Share2,
  Users,
  Shield,
  Layers
} from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Real Developer Scoring',
    description: 'Profiles are scored from real GitHub activity like repositories, commits, reviews, stars, and project quality signals.',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'GitHub + LeetCode Profile',
    description: 'Showcase coding depth with combined GitHub analytics, LeetCode stats, language strengths, and skill badges.',
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Recruiter Search & Shortlists',
    description: 'Recruiters can search indexed developers with score and skill filters, then save candidates into shortlists.',
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Referral Workflows',
    description: 'Users can discover open referral profiles, send requests with notes, and track incoming and sent referral status.',
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: 'LinkedIn-Style Connections',
    description: 'Both developers and recruiters can send, accept, or decline connection requests before starting direct chat.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Real-Time Messaging',
    description: 'Accepted connections and referrals unlock socket-powered messaging with inbox, unread counts, and live updates.',
  },
];

const stats = [
  { icon: <Layers className="w-8 h-8" />, value: '2 Roles', label: 'Developer + Recruiter Workflows' },
  { icon: <Shield className="w-8 h-8" />, value: 'Role-Based', label: 'Protected Dashboards & Access' },
  { icon: <Users className="w-8 h-8" />, value: 'Connections', label: 'Referral + Messaging Graph' },
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
            Hiring + Networking built for{' '}
            <span className="gradient-text">real engineering signals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SkillHire combines developer growth tools and recruiter workflows, from analysis and referrals to connections and messaging.
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
