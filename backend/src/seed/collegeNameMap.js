// src/utils/collegeNameMap.js
export const DOMAIN_TO_NAME = {
  // IITs
  "iitb.ac.in":        "IIT Bombay",
  "iitd.ac.in":        "IIT Delhi",
  "iitm.ac.in":        "IIT Madras",
  "iitk.ac.in":        "IIT Kanpur",
  "iitkgp.ac.in":      "IIT Kharagpur",
  "iith.ac.in":        "IIT Hyderabad",
  "iitg.ac.in":        "IIT Guwahati",
  "iitr.ac.in":        "IIT Roorkee",
  "iiti.ac.in":        "IIT Indore",
  "iitp.ac.in":        "IIT Patna",
  "iitbbs.ac.in":      "IIT Bhubaneswar",
  "iitj.ac.in":        "IIT Jodhpur",
  "iitmandi.ac.in":    "IIT Mandi",
  "iitpkd.ac.in":      "IIT Palakkad",
  "iitbhilai.ac.in":   "IIT Bhilai",
  "iitgn.ac.in":       "IIT Gandhinagar",
  "iitjammu.ac.in":    "IIT Jammu",
  "iittirupati.ac.in": "IIT Tirupati",
  "iitdh.ac.in":       "IIT Dharwad",
  "iitgoa.ac.in":      "IIT Goa",
  "iitropar.ac.in":    "IIT Ropar",

  // NITs
  "nitk.ac.in":        "NIT Karnataka",
  "nitt.edu":          "NIT Trichy",
  "nitw.ac.in":        "NIT Warangal",
  "mnit.ac.in":        "MNIT Jaipur",
  "nitp.ac.in":        "NIT Patna",
  "nitc.ac.in":        "NIT Calicut",
  "mnnit.ac.in":       "MNNIT Allahabad",
  "vnit.ac.in":        "VNIT Nagpur",
  "svnit.ac.in":       "SVNIT Surat",
  "manit.ac.in":       "MANIT Bhopal",
  "nitrr.ac.in":       "NIT Raipur",
  "nitj.ac.in":        "NIT Jalandhar",
  "nitdgp.ac.in":      "NIT Durgapur",
  "nitjsr.ac.in":      "NIT Jamshedpur",
  "nitdelhi.ac.in":    "NIT Delhi",
  "nitsilchar.ac.in":  "NIT Silchar",
  "nita.ac.in":        "NIT Agartala",

  // IIITs
  "iiit.ac.in":           "IIIT Hyderabad",
  "students.iiit.ac.in":  "IIIT Hyderabad",
  "iiitd.ac.in":          "IIIT Delhi",
  "iiitb.ac.in":          "IIIT Bangalore",
  "iiita.ac.in":          "IIIT Allahabad",
  "iiitdmj.ac.in":        "IIITDM Jabalpur",
  "iiitn.ac.in":          "IIIT Nagpur",
  "iiitpune.ac.in":       "IIIT Pune",
  "iiitl.ac.in":          "IIIT Lucknow",

  // BITS
  "bits-pilani.ac.in":            "BITS Pilani",
  "goa.bits-pilani.ac.in":        "BITS Goa",
  "hyderabad.bits-pilani.ac.in":  "BITS Hyderabad",
  "pilani.bits-pilani.ac.in":     "BITS Pilani",

  // IIMs
  "iima.ac.in":  "IIM Ahmedabad",
  "iimb.ac.in":  "IIM Bangalore",
  "iimc.ac.in":  "IIM Calcutta",
  "iimk.ac.in":  "IIM Kozhikode",
  "iiml.ac.in":  "IIM Lucknow",
};

export function getCollegeName(domain) {
  if (!domain) return null;
  return DOMAIN_TO_NAME[domain.toLowerCase()] || domain; // fallback to raw domain
}