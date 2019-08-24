const fs = require("fs");

const input = fs.readFileSync(0, "utf-8");

function getAngeboteneSemester(input) {
  const result = [];
  if (input.includes("Jedes Semester")) {
    result.push("SoSe", "WiSe");
  } else {
    if (input.includes("Wintersemester")) {
      result.push("WiSe");
    }
    if (input.includes("Sommersemester")) {
      result.push("SoSe");
    }
  }
  return result;
}

function getDependencies(input) {
  const matches = input.match(/HPI[-\w\n]+/gm);
  if (!matches) {
    return [];
  }
  return matches.map(m => m.replace("\n", ""));
}

function parseBeschreibung(input) {
  return {
    semester: getAngeboteneSemester(input),
    dependencies: getDependencies(input)
  }
}

const modules = (() => {
  const parts = input.split(/^HPI-(?=.+-.+:)/gm);
  parts.splice(0, 1);
  const modules = {};
  parts.forEach(part => {
    const indexOfColon = part.indexOf(":");
    const modulname = part.substr(0, indexOfColon);
    const beschreibung = part.substr(indexOfColon);
    const fqModulname = "HPI-" + modulname;
    modules[fqModulname] = parseBeschreibung(beschreibung);
  })
  return modules;
})()

function generateDot(modules) {
  const sanitizeKey = key => key.replace("-", "_").replace("-", "_");

  const nodes = Object.entries(modules).map(([key, m]) => {
    const [ semester, color ] = (() => {
      if ([0, 2].includes(m.semester.length)) {
        return ["", "black"];
      }
      if (m.semester.includes("WiSe")) {
        return ["(W)", "blue"];
      }
      if (m.semester.includes("SoSe")) {
        return ["(S)", "orange"];
      }
    })();
    return `${sanitizeKey(key)} [label="${key} ${semester}" color=${color}];`
  });

  const edges = Object.entries(modules).map(([key, m]) => {
    return m.dependencies.map(dep => `${sanitizeKey(key)} -> ${sanitizeKey(dep)}`).join("\n")
  });
  
  return `
  digraph {
    rankdir=RL;
    // Module
    ${nodes.join("\n")}

    // Abhängigkeiten
    ${edges.join("\n")}
  }
  `;
}

console.log(generateDot(modules));