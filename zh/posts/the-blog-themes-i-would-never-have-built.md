---
title: "那些我原本不会做的博客主题，以及可以挑剔的自由"
date: 2026-11-15
time: "22:22"
tags:
  - ai
  - web-development
  - design
excerpt: |
  AI 让我有余地把想法放大。十一种博客主题，换作以前，我根本找不到时间设计和实现；这次一边推进另外三到五个项目，一边断断续续用一天来探索。一个设计实验室，许多被放弃的想法，还有一个不断被我简化的主题选择器。尝试的成本低到，我终于负担得起挑剔。
---

我的博客看起来有点太素了，有点单薄。我想看看它还能变成什么样。

<style>
.theme-story-grid,.theme-story-before{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.6rem 0;}
.theme-story-showcase{grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;}
.theme-story-figure{min-width:0;margin:1.5rem 0;}
.theme-story-grid .theme-story-figure,.theme-story-before .theme-story-figure{margin:0;}
.theme-story-figure img{box-sizing:border-box;display:block;width:100%;height:auto;border:1px solid var(--rule,currentColor);border-radius:3px;}
.theme-story-figure figcaption{margin-top:.5rem;font-size:.85rem;line-height:1.5;text-align:center;}
.theme-story-before{grid-template-columns:repeat(8,minmax(0,1fr));gap:.35rem;}
.theme-story-before figcaption{font-size:.65rem;overflow-wrap:anywhere;}
@media(max-width:600px){.theme-story-grid{grid-template-columns:1fr;}.theme-story-showcase{grid-template-columns:repeat(2,minmax(0,1fr));}.theme-story-before{display:flex;overflow-x:auto;padding-bottom:.65rem;}.theme-story-before .theme-story-figure{flex:0 0 120px;}}
</style>

<div class="theme-story-before">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-sun.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-sun.webp" alt="旧版博客首页的 Sun 主题" loading="lazy" /></a><figcaption>Sun</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-default.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-default.webp" alt="旧版博客首页的 Default 主题" loading="lazy" /></a><figcaption>Default</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-mint.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-mint.webp" alt="旧版博客首页的 Mint 主题" loading="lazy" /></a><figcaption>Mint</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-grape.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-grape.webp" alt="旧版博客首页的 Grape 主题" loading="lazy" /></a><figcaption>Grape</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-charcoal.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-charcoal.webp" alt="旧版博客首页的 Charcoal 主题" loading="lazy" /></a><figcaption>Charcoal</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-deep-blue.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-deep-blue.webp" alt="旧版博客首页的 Deep Blue 主题" loading="lazy" /></a><figcaption>Deep Blue</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-midnight.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-midnight.webp" alt="旧版博客首页的 Midnight 主题" loading="lazy" /></a><figcaption>Midnight</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-terminal.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-terminal.webp" alt="旧版博客首页的 Terminal 主题" loading="lazy" /></a><figcaption>Terminal</figcaption></figure>
</div>

*原来的主题，按原有顺序排列。布局一样，颜色不同。点击截图可以看大图；在手机上可以左右滑动这一排。*

结果，这变成了十一种主题选择、[一个 design lab skill](https://github.com/TheClooneyCollection/skills/tree/main/skills/design-lab)，以及一个讨论次数远超我预期的主题选择器。我断断续续做了大约一天，同时还在推进另外三到五个项目。

我很难想象自己独自设计出所有这些，更别说把它们实现了。一天内肯定不行。更可能的情况是，我看看需要投入多少时间，选一个差不多的，然后回去做其他想做的东西。

这一次，我真的有余地探索了。

<div class="theme-story-grid">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-light.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-light.webp" alt="当前主题选择器，展示全部八种浅色选项" loading="lazy" /></a><figcaption>已实现的浅色选择器，共八种选项。此处展开以展示完整列表。</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-dark.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-dark.webp" alt="当前主题选择器，展示全部十种深色选项" loading="lazy" /></a><figcaption>已实现的深色选择器，共十种选项，此处展开完整列表。几个主题同时支持明暗两种模式。</figcaption></figure>
</div>

[[toc]]

## 到底需要多少个主题？

结果对我来说，是 11 个主题，加上明暗模式。大概吧。

这些选择，看图比描述更直观。下面是同一个首页、相同尺寸的截图，按探索的方向分组。点击任意图片都可以看大图。

### 纸张、网格与硬边

Warm Paper 安静，有书卷气。我喜欢 Swiss 的色彩与对比度之间的平衡。Brutalist 把颜色推得更大胆，给各个元素加上硬朗的边缘。Zine 则活泼得多。

<div class="theme-story-grid theme-story-showcase">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-paper-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-paper-verified.webp" alt="博客首页的新 Warm Paper 主题" loading="lazy" /></a><figcaption>Warm Paper</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-swiss-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-swiss-verified.webp" alt="博客首页的新 Swiss 主题" loading="lazy" /></a><figcaption>Swiss</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-brutalist-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-brutalist-verified.webp" alt="博客首页的新 Brutalist 主题" loading="lazy" /></a><figcaption>Brutalist</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-zine-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-zine-verified.webp" alt="博客首页的新 Zine 主题" loading="lazy" /></a><figcaption>Zine</figcaption></figure>
</div>

### 玻璃与光

Soft Glass 更柔和、圆润。Liquid Glass 更强调半透明层次与高光。它的深色版本有 Aurora 和 Indigo 两套配色。

<div class="theme-story-grid theme-story-showcase">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-glass-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-glass-verified.webp" alt="博客首页的新 Soft Glass 主题" loading="lazy" /></a><figcaption>Soft Glass</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-light-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-light-verified.webp" alt="博客首页的新 Liquid Glass Light 主题" loading="lazy" /></a><figcaption>Liquid Glass Light</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-verified.webp" alt="博客首页的新 Liquid Glass Dark · Aurora 主题" loading="lazy" /></a><figcaption>Liquid Glass Dark · Aurora</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-indigo-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-indigo-verified.webp" alt="博客首页的新 Liquid Glass Dark · Indigo 主题" loading="lazy" /></a><figcaption>Liquid Glass Dark · Indigo</figcaption></figure>
</div>

### 三种科幻风格

Starship 沉静、宽敞。Retro sci-fi 更温暖，形状和条纹也更厚重。Halo 则走深色与霓虹的方向。

<div class="theme-story-grid theme-story-showcase">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-starship-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-starship-verified.webp" alt="博客首页的新 Starship 主题" loading="lazy" /></a><figcaption>Starship</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-retro-futurist-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-retro-futurist-verified.webp" alt="博客首页的新 Retro sci-fi 主题" loading="lazy" /></a><figcaption>Retro sci-fi</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-holo-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-holo-verified.webp" alt="博客首页的新 Halo 主题" loading="lazy" /></a><figcaption>Halo</figcaption></figure>
</div>

这就是十一种视觉选择，包括 Liquid Glass 的两套深色配色。它们并不是十一个独立的网站，而是阅读同一个网站的不同方式，无论你看的是长文、时间线，还是中文译文。

## Design Lab：在决定之前，先有地方试一试

我们从八个方向开始，后来又加了一些。等 Liquid Glass 和另外几种科幻方案加入时，最初的设计稿一共有十三种。

我不想只凭描述做选择。“暖色纸张”听起来不错，但把我的实际文章放进去是什么样？在手机上呢？首页上喜欢的东西，读到长文一半时还合适吗？

于是我们做了一个私有的设计实验室：用博客真实的公开内容制作一次性的设计稿，放进同一个画廊。我可以在手机上打开、比较版本、给出反馈。与此同时，agents 可以并行探索不同方向，我去做别的事。

<div class="theme-story-grid">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-directions.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-directions.webp" alt="实际设计实验室画廊，包含早期视觉方向和评审记录" loading="lazy" /></a><figcaption>最初的画廊：不同设计方向旁边是我的评审记录。</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-finalists.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-finalists.webp" alt="扩展后的主题画廊，包含修改版本和对比区域" loading="lazy" /></a><figcaption>更完整的一轮：成套页面和修改版本都保留下来，方便比较。</figcaption></figure>
</div>

等我回来，就有具体的东西可以看。我可以说“多一点颜色”“对比度再强一点”，或者“这个我喜欢，别动了”。修改版保留在旧版旁边，我可以直接比较，不用努力回忆到底改了哪里。

这个流程后来变成了 [design-lab skill](https://github.com/TheClooneyCollection/skills/tree/main/skills/design-lab)。它让实验保持私有，保留已经评审过的版本，并记录决定。现在我可以用同样的流程，为其他项目探索设计。

## 继续探索，直到方向对了

早期有一个方向是橙色 HUD。我没太喜欢。

但我还是想要科幻风格。我要求更多选择：一种像干净的星舰界面，一种复古未来主义，还有一种全息风格。它们发展成了三个很不一样的方向，最后都留下了。

<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-hud.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-hud.webp" alt="早期橙色科幻 HUD 设计稿" loading="lazy" /></a><figcaption>早期 HUD 设计稿。和上面的 Starship、Retro sci-fi、Halo 比较：反馈是继续探索科幻方向，不只是换掉橙色。</figcaption></figure>

这是 AI 的工作让我印象深刻的地方之一。它能拿出足够不同的方案，帮助我弄清楚自己到底想要什么。我不只是让它把橙色换成蓝色。

而且，我负担得起继续提要求。再试一个方向，并不意味着又要投入好几天。我们可以先试出来，再看着结果判断。

也有些想法走向了相反的结果。我一开始喜欢 Terminal，但在更完整的一轮评审后放弃了它。首页的第一印象好还不够。我们把喜欢的方案扩展到文章、时间线、系列、项目、短记和中文页面，这让我有了更多判断依据。

<figure class="theme-story-figure" style="max-width: 560px; margin-left: auto; margin-right: auto;"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-terminal.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-terminal.webp" alt="最初的 Terminal 设计稿，钴蓝色工作区页头、琥珀色点缀和文件列表式首页" loading="lazy" /></a><figcaption>第一轮设计中的 Terminal。我最初喜欢它，但评审更完整的页面后没有保留。</figcaption></figure>

还有一些更细的决定。Warm Paper 需要更强的对比度。Liquid Glass 要看起来更透明。Brutalist 需要更多颜色，然后我们又讨论了多少才算过头。眼前有具体的东西，我才能给出具体的反馈。

## 迭代仍然需要人的判断

主题选择器本身也成了一次设计练习。我和 Claude 来回讨论按钮、面板、预览，明暗模式该怎么表现，以及手机上应该怎么用。

<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-lab.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-lab.webp" alt="设计实验室中主题选择器的一次真实迭代，仍保留早期预览和 Use 的交互" loading="lazy" /></a><figcaption>实验室中较早的选择器。当时设计里仍有明确的预览和应用步骤。</figcaption></figure>

预览展示的是主题在真实首页上的样子。当我切换明暗模式时，选项也跟着页面变化。这里面也有细节：Halo 只有深色模式，所以切到浅色会进入 Starship，切回深色则回到 Halo。

接下来是最基本的选择动作。

最初，我可以先预览主题，再按 Use 应用。试过之后，我发现应用时不需要再播放一次视觉效果。我已经在看这个主题了。

然后我意识到，其实连 Preview 和 Use 都不需要。

点击一个主题就可以直接选中。给我一个快速回到打开选择器时那个主题的办法，然后让我继续试就好。

最后就成了现在这样：点击即选择，也可以恢复到打开面板时的选择。关掉面板后，保留当前选中的主题。

我喜欢这段过程，因为我一开始并不知道最后的交互会是什么。我需要亲手用它。Agents 让我们有条件把这个想法一路做下去，也处理了那些不太显眼的细节，比如手机上的列表变化时，滚动位置要保持稳定。

我们还加了可以直接打开指定主题的链接。我可以把想让别人看到的版本发过去，不必再解释该去选择器的哪里找。

实际使用网站，帮助我判断哪些地方需要修复、打磨或删掉。Agents 很快就能做出这些修改，但要把事情做好，仍然需要人参与其中。

## 好的基础会持续带来回报

我很庆幸过去的 Nicholas 在设计 [Subspace Builder](https://github.com/TheClooneyCollection/11ty-subspace-builder) 时花了很多心思。共享布局和可复用组件给了我们一个可以继续建设的基础。这一次，我们直接享受到了好处：十一种视觉选择，却不用维护十一个独立的网站。

设计稿本来就是用完可以丢掉的。正式实现建立在共享结构之上，用 CSS 外观样式和主题 tokens 来区分，所以每个主题不需要各自复制一套页面。

如果我要继续维护它，这一点很重要。给文章增加一个功能，不应该意味着要加十一遍。

我们检查的不只是好看的首屏，还有代码块、表格、图片和说明、引用、标题层级、目录、中文，以及不同类型的时间线条目。导航会一直保持可见；在宽屏上，文章目录可以留在正文旁边。到了手机上，这些又得放回正常的阅读顺序里。

## 可以挑剔的自由

在[《同时做所有事》](/zh/posts/everything-all-at-once-ai-and-intentionality/)里，我写过同时推进多个项目的奇妙感受，也写过自己的注意力如何成了限制。

这一次，那种能力用在了一个很好的地方。我可以回来看看一组设计，做出判断，再要求下一轮。我仍然断断续续花了一天，也仍然需要在意细节。

但没有 AI，我怀疑自己会不会允许自己开始这么大范围的探索。对一个个人博客来说，十一种选择听起来实在太费工夫了。

AI 把尝试的成本降到了足够低，让我终于可以认真考虑这些可能性。同一天里，我一边迭代十一种主题，一边推进另外三到五个项目。这就是我在《同时做所有事》里想表达的感受：突然之间，有这么多事情是我真的可以同时去做的。前方的可能性，感觉几乎没有尽头。
