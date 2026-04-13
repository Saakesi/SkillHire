import React from "react";
import { Layout } from "../components/layout/Layout";

export default function About() {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold">About SkillHire</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            SkillHire helps developers and recruiters connect through real work signals.
            We combine profile analytics, referral workflows, connections, and messaging in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-2">For Developers</h2>
            <p className="text-sm text-muted-foreground">
              Build a public technical profile, track your score, receive referrals, and grow your network.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-2">For Recruiters</h2>
            <p className="text-sm text-muted-foreground">
              Search developers by quality signals, manage shortlists, request connections, and chat directly.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
