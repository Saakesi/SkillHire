import React from "react";
import { Layout } from "../components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          SkillHire uses account information and profile analytics to provide ranking, referral,
          connection, and messaging features. We only store data needed for these workflows.
        </p>
        <p className="text-sm text-muted-foreground">
          You can request account data updates or deletion by contacting support@skillhire.app.
        </p>
      </section>
    </Layout>
  );
}
