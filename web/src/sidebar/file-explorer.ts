export const DEMO_FILES = [
  ["expedition.yaml", "4.2 KB"],
  ["checkpoint.yaml", "1.1 KB"],
  ["results/ctd_profiles.json", "86 KB"],
  ["README.md", "2.4 KB"],
] as const;

export function renderFileExplorer(): string {
  return `<div class="file-tree">${DEMO_FILES.map(([name, size]) => `<button class="file-row"><span>${name}</span><small>${size}</small></button>`).join("")}</div>`;
}
