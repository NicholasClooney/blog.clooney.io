---
title: Building My Own Subspace Builder
eleventyNavigation:
  key: post-1
---

Last month, my girlfriend mentioned she needed a sleek portfolio site, and I realized I’d been meaning to start a personal tech blog.

I wanted something lightweight—easy to spin up and even easier to tweak. So I dove in: building a small 11ty + Tachyons site from scratch, pushing every iteration live in under a minute, and watching her face light up with each update even though she’s halfway across the country.

Repo link: [https://github.com/NicholasClooney/11ty-subspace-builder](https://github.com/NicholasClooney/11ty-subspace-builder)

---

## Table of Contents

1. [Motivation](#motivation)
2. [Why 11ty?](#why-11ty)
3. [Tachyons for CSS](#tachyons-for-css)
4. [Special shoutout to ChatGPT](#special-shoutout-to-chatgpt)
5. [Design inspirations](#design-inspirations)
6. [The "magic" part](#the-"magic"-part)
7. [Key Takeaways](#key-takeaways)

---

## Motivation

I had almost no experience building websites or writing CSS before this, so diving into Eleventy and Tachyons felt like learning a fun new craft. I love building things for people I care about, and seeing their reaction to each new feature is incredibly rewarding. This project wasn’t just about code—it was about sharing progress in real time, learning a few new tools, and having fun along the way.

## Why 11ty?

* **Super lightweight & zero-config**: Start writing Markdown and Nunjucks immediately—no webpack or complex installs.
* **Nunjucks templating**: Easy to create reusable layouts and partials, even for newcomers.

## Tachyons for CSS

* **Utility-first classes**: Style directly in markup (`pa3`, `bg-near-black`, etc.), so there’s no CSS hide-and-seek.
* **Discoverable & consistent**: Tachyons’ naming conventions are intuitive, making it fast to prototype.

## Special shoutout to ChatGPT

I started thinking of our workflow like *pair programming*: ChatGPT as the **driver**—hands on deck, writing keyframe animations, toggling nav classes, refining selectors—and me as the **navigator**—watching, providing feedback, and keeping us on course. It’s been a joy collaborating this way and has completely transformed my troubleshooting process.

## Design inspirations

* Studied a few slick sites to nail the hamburger menu behavior and visuals.
* Added a simple fade+slide keyframe to give the nav a polished feel without adding bulk.

## The "magic" part

* **Local edits** → **git push** → **Cloudflare Pages deploy**: \~30 seconds.
* My girlfriend across the country refreshes the URL and sees the latest tweaks almost instantly. Truly mind-blowing for a lightweight setup.

---

## Key Takeaways

* **Developer-first workflow**: 11ty’s zero-config approach lets you focus on content, not tooling.
* **Rapid styling**: Tachyons makes CSS painless and maintainable.
* **CI/CD simplicity**: A simple `git push` triggers Cloudflare Workers to deploy the site in seconds.
