// lib/collegeEmailValidator.js

// Exact domain → high confidence (matches your seeded colleges)
const KNOWN_DOMAINS = new Set([
  // IITs
  "iitb.ac.in", "iitd.ac.in", "iitm.ac.in", "iitk.ac.in",
  "iitkgp.ac.in", "iith.ac.in", "iitbbs.ac.in", "iitg.ac.in",
  "iiti.ac.in", "iitj.ac.in", "iitr.ac.in", "iitmandi.ac.in",
  "iitpkd.ac.in", "iitp.ac.in", "iitbhilai.ac.in", "iitgn.ac.in",
  "iitjammu.ac.in", "iittirupati.ac.in", "iitdh.ac.in",
  "iitgoa.ac.in", "iitropar.ac.in",

  // NITs
  "nitk.ac.in",    "nitt.edu",       "nitw.ac.in",  "mnit.ac.in",
  "nitp.ac.in",    "nitc.ac.in",     "nits.ac.in",  "nitm.ac.in",
  "nitrr.ac.in",   "nitj.ac.in",     "nitgoa.ac.in","nitmanipur.ac.in",
  "nitdelhi.ac.in","mnnit.ac.in",    "vnit.ac.in",  "svnit.ac.in",
  "manit.ac.in",   "nitdgp.ac.in",   "nitjsr.ac.in","nitpy.ac.in",
  "nith.ac.in",    "nitraipur.ac.in","nituk.ac.in",  "nitsilchar.ac.in",
  "nita.ac.in",    "nitnagaland.ac.in",

  // IIITs
  "iiit.ac.in",        "students.iiit.ac.in", // IIIT Hyderabad
  "iiitd.ac.in",       "iiitb.ac.in",
  "iiita.ac.in",       "iiitl.ac.in",
  "iiitm.ac.in",       "iiitdmj.ac.in",
  "iiitdmk.ac.in",     "iiitsricity.ac.in",
  "iiitg.ac.in",       "iiitkalyani.ac.in",
  "iiitlucknow.ac.in", "iiitpune.ac.in",
  "iiitn.ac.in",       "iiitranchi.ac.in",
  "iiitsurat.ac.in",   "iiitvadodara.ac.in",
  "iiitkota.ac.in",    "iiitsonepat.ac.in",
  "iiitdwd.ac.in",

  // BITS
  "bits-pilani.ac.in",
  "goa.bits-pilani.ac.in",
  "hyderabad.bits-pilani.ac.in",
  "pilani.bits-pilani.ac.in",

]);



const BLOCKED_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com",
  "throwam.com",    "fakeedu.com",       "dispostable.com",
]);

export function validateCollegeEmail(email) {
  const lower = email.toLowerCase().trim();
  const parts  = lower.split("@");

  if (parts.length !== 2 || !parts[1].includes(".")) {
    return { valid: false, reason: "Invalid email format" };
  }

  const domain = parts[1];

  if (BLOCKED_DOMAINS.has(domain)) {
    return { valid: false, reason: "Disposable email not allowed" };
  }

  if (KNOWN_DOMAINS.has(domain)) {
    return { valid: true, confidence: "high", domain };
  }

  if (TRUSTED_PATTERNS.some((p) => p.test(domain))) {
    return { valid: true, confidence: "medium", domain };
  }

  return { valid: false, reason: "Not recognised as a college email" };
}