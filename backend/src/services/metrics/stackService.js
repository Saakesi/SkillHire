export const getStack = (languagePercentages) => {
  const frontendLanguages = ["HTML", "CSS", "SCSS", "Sass"];
  const backendLanguages = [
    "Python", "Java", "Go", "Rust",
    "C#", "PHP", "Ruby", "Kotlin", "Scala"
  ];

  let frontendWeight = 0;
  let backendWeight = 0;

  for (const [lang, percent] of Object.entries(languagePercentages)) {

    if (frontendLanguages.includes(lang))
      frontendWeight += percent;

    if (backendLanguages.includes(lang))
      backendWeight += percent;

    if (lang === "JavaScript" || lang === "TypeScript") {

      const htmlWeight = languagePercentages["HTML"] || 0;
      const cssWeight = languagePercentages["CSS"] || 0;

      const frontendSignal = htmlWeight + cssWeight;

      // Cap frontend signal influence at 0.3 (30%)
      const frontendRatio = Math.min(frontendSignal / 0.3, 1);

      frontendWeight += percent * frontendRatio;
      backendWeight += percent * (1 - frontendRatio);
    }
  }

  // console.log("frontend: ", frontendWeight, " backend: ", backendWeight);

  let developerType = "Unknown";

  if (frontendWeight > backendWeight + 0.1)
    developerType = "Frontend";
  else if (backendWeight > frontendWeight + 0.1)
    developerType = "Backend";
  else if (frontendWeight > 0 && backendWeight > 0)
    developerType = "Full Stack";

  const techStack = [];

  if (languagePercentages["JavaScript"] || languagePercentages["TypeScript"])
    techStack.push("JavaScript Ecosystem");

  if (languagePercentages["Python"])
    techStack.push("Python Ecosystem");

  if (languagePercentages["Go"])
    techStack.push("Go Ecosystem");

  if (languagePercentages["Java"])
    techStack.push("JVM Ecosystem");

  if (languagePercentages["Rust"])
    techStack.push("Systems Programming");

  return { developerType, techStack };
};