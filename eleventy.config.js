const markdownIt = require("markdown-it");

// Collin Westerlund site. The pages keep their hand-built layout; only the parts
// Collin edits (releases, notebook, press, photos, videos, links) come from
// src/_data and can be changed in the editor at /admin/.

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/root": "/" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.ignores.add("src/root/**");

  const md = markdownIt({ html: false, linkify: true, typographer: true });
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet("href") || "";
    if (/^https?:/.test(href)) { tokens[idx].attrSet("target", "_blank"); tokens[idx].attrSet("rel", "noopener"); }
    return self.renderToken(tokens, idx, options);
  };
  eleventyConfig.addFilter("md", (s) => md.render(String(s || "")));

  const d = (iso) => new Date(String(iso).slice(0, 10) + "T12:00:00Z");
  const fmt = (iso, o) => d(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...o });
  eleventyConfig.addFilter("monYear", (iso) => fmt(iso, { month: "short", year: "numeric" }));
  eleventyConfig.addFilter("monDayYear", (iso) => fmt(iso, { month: "short", day: "numeric", year: "numeric" }));
  eleventyConfig.addFilter("rel", (p) => String(p || "").replace(/^\//, ""));
  eleventyConfig.addFilter("newestFirst", (arr) => [...(arr || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))));
  eleventyConfig.addFilter("firstLink", (r) => r.spotify || r.apple || r.link || r.tidal || r.youtube || "#");
  eleventyConfig.addFilter("isNew", (iso) => (Date.now() - d(iso)) / 864e5 < 120);
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
  eleventyConfig.addFilter("today", () => new Date().toISOString().slice(0, 10));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
