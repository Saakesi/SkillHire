import React from "react";
import { Layout } from "../components/layout/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">
          By using SkillHire, you agree to provide accurate profile information,
          use networking features responsibly, and avoid spam or abusive behavior.
        </p>
        <p className="text-sm text-muted-foreground">
          We may suspend accounts that violate platform integrity or user safety.
        </p>
      </section>
    </Layout>
  );
}
