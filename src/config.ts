import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.homeserverfail.in/",
  author: "Sathya Narayana Bhat",
  profile: "https://github.com/Psycho-not0078/",
  desc: "Notes from a DevSecOps engineer's homelab - Kubernetes, GitOps, security tooling, and the things that break.",
  title: "homeserverfail",
  ogImage: "og-default.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  // editPost: {
  //   url: "https://github.com/Psycho-not0078/Psycho-not0078.github.io/edit/main/src/content/blog",
  //   text: "Suggest Changes",
  //   appendFilePath: true,
  // },
};

export const LOCALE = {
  lang: "en",
  langTag: ["en-IN"],
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Psycho-not0078/",
    linkTitle: `${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sathya-narayana-bhat/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:hello@homeserverfail.in",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
];