import React from "react";
import { Layout } from "../components/layout/Layout";

export default function Contact() {
  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Contact</h1>
        <p className="text-muted-foreground">
          Questions, feedback, or partnership ideas? Reach out and we will get back to you.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <p className="text-sm"><span className="font-medium">Email:</span> support@skillhire.tech</p>
          <p className="text-sm"><span className="font-medium">For recruiters:</span> recruiter@skillhire.tech</p>
          <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM to 6 PM IST</p>
        </div>
      </section>
    </Layout>
  );
}
