const fs = require("fs");
const path =
  "c:/Users/akash/Desktop/Projects/basecase/components/interview/report/InterviewReport.tsx";
let txt = fs.readFileSync(path, "utf8");

// remove useScrollReveal definition
txt = txt.replace(
  /function useScrollReveal\(\) \{[\s\S]*?return \{ ref, visible \};\s*\}/,
  "",
);

// remove useScrollReveal calls
txt = txt.replace(/const \w+Reveal = useScrollReveal\(\);\n?/g, "");

// un-gate visible
txt = txt.replace(/opacity:\s*visible\s*\?\s*1\s*:\s*0/g, "opacity: 1");
txt = txt.replace(
  /transform:\s*visible\s*\?\s*["']translateY\(0\)["']\s*:\s*["']translateY\(20px\)["']/g,
  'transform: "translateY(0)"',
);
txt = txt.replace(
  /opacity:\s*\w+Reveal\.visible\s*\?\s*1\s*:\s*0/g,
  "opacity: 1",
);
txt = txt.replace(
  /transform:\s*\w+Reveal\.visible\s*\?[\s\S]*?["']translateY\(20px\)["']/g,
  'transform: "translateY(0)"',
);

// Remove prop passing
txt = txt.replace(/visible=\{\w+Reveal\.visible\}/g, "");
txt = txt.replace(/ref=\{\w+Reveal\.ref\}/g, "");

txt = txt.replace(/visible\s*:\s*boolean;/g, "visible?: boolean;");

fs.writeFileSync(path, txt, "utf8");
console.log("Script done");
