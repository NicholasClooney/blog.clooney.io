---
title: "与 Claude 和 Codex 一起构建 ProjectDawn：深入记录 AI 辅助 iOS 开发"
date: 2026-03-19
tags:
  - ai
  - ai-assisted
  - ios
  - swift
  - swiftui
  - tuist
  - workflow
---

我最近在做一款叫 ProjectDawn 的 iOS 习惯记录应用。不是因为 App Store 还缺一个习惯追踪器，而是我想有一个真正属于自己、而且开源的个人项目，也想通过它公开回答一个问题：把 AI 当成主要合作者，开发一款真正模块化的原生 iOS 应用，是什么感觉？

这篇文章既是个人日志，也是技术复盘。它涵盖我使用的工具、让我意外的地方、AI 失手的地方，以及这个过程如何改变了我对创造东西的理解。

[[toc]]

## ProjectDawn 是什么？

| 总览 | 展开的习惯托盘 |
|---|---|
| <img alt="ProjectDawn 主时间线，显示已记录的习惯与底部收起的托盘" src="/assets/images/posts/building-project-dawn/overview.png" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;" /> | <img alt="ProjectDawn 习惯库，以展开的底部面板覆盖在时间线上" src="/assets/images/posts/building-project-dawn/expanded-sheet.png" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;" /> |

ProjectDawn 是一款每日习惯记录应用，有一个简单而明确的前提：**在时间线上，就代表发生过。** 没有提醒，没有连续打卡，没有游戏化。只有一条记录当天的纵向时间线，以及一个可以把习惯拖上去的托盘。记录习惯，就是一个具体的动作：拖动，放下，完成。

时间线按十五分钟一格吸附。每个放上去的习惯都会成为一个实例，拖动底边可以调整时长。左右滑动切换日期。习惯托盘收起时是屏幕底部常驻的一条，需要时可以展开成完整的习惯库。

这是一款范围集中的小应用，但托盘与时间线之间的交互意外地细腻，因此很适合拿来测试 AI 辅助开发。

## 技术栈

### Claude + Codex：分工合作

<img
  alt="构建 ProjectDawn 时，Claude 与 Codex 在 tmux 会话中并排工作"
  src="/assets/images/posts/building-project-dawn/claude-and-codex.png"
/>

整个项目中，我使用了两种不同的 AI 工具。分工是随着各自的使用感受，自然形成的。

**Claude** 是我的规划者。它更慢，有时慢得很明显，但思考细致，会权衡取舍、提出澄清问题，也能给出我真正可以推敲的设计决策。需要 PRD、架构方案或 bug 分析时，我会找 Claude。它消耗我 Pro 套餐 token 的速度很快，但输出质量值得。

**Codex（ChatGPT）** 是我的执行者。它快得多，很擅长把清晰的规格变成可运行代码，也特别擅长那些原本很枯燥的机械实现工作。Claude 完成阶段计划后，就由 Codex 实现。

我最终形成的理解是：Claude 像在白板上画架构的资深工程师，Codex 像打开 IDE 把方案落地的开发者。在这套工作流里，两者无法互相替代，组合起来也确实比单独使用任何一个更强。

### Mise + Tuist：从设计上模块化

项目用 [Tuist](https://tuist.io/) 把应用拆成独立模块，用 [mise](https://mise.jdx.dev/) 管理工具链版本。每个功能都在 `Modules/` 下拥有自己的模块：

```
Modules/
  Data/          <- SwiftData models (Habit, HabitInstance)
  DayView/       <- the main day scaffold and navigation
  Timeline/      <- the scrollable time grid
  HabitTray/     <- the expandable bottom sheet
  Interaction/   <- shared drag coordinator and helpers
```

应用 target 本身只是一层薄壳：连接入口、注入 SwiftData 容器，再把所有 UI 交给功能模块。

这种结构的回报是，我可以只重建、测试和迭代一个模块，而不碰其他部分。Claude 生成阶段计划时，也能清楚对应到模块边界。某处出问题时，影响范围同样受控。

### 文档放在仓库里

一个很有回报的工作流决定是：所有设计文档都放在仓库的 `Docs/` 下。

```
Docs/
  PRD.md
  plan.md
  Implementation Plans/
    Phase3-Timeline.md
    Phase4-HabitTray.md
    Phase5-DragAndDrop.md
    Phase6-HabitInstancesOnTimeline.md
  bug-analysis-*.md
  bug-report-*.md
  future-ideas.md
```

实际原因很简单，Claude 和 Codex 都能直接读写这些文件。我通常在 tmux 会话中分屏，一个窗格是 Claude，另一个是 Codex。Claude 完成阶段计划，就写入 `Docs/Implementation Plans/`，Codex 从那里读取。出现 bug 时，Claude 把分析写到 `Docs/bug-analysis-<slug>.md`，Codex 直接参考，不用我重新解释问题。

这也意味着设计历史与代码一起受版本控制，可以追溯。六个月后，我读 `Phase4-HabitTray.md`，仍能准确理解托盘架构为什么长这样、考虑过哪些替代方案、明确推迟了哪些内容。这些不是单靠提交消息就能知道的。

更广的原则是：把文档放在仓库里，能让代理跨会话、跨工具协作，建立一份不随上下文窗口重置而丢失的共同依据，也让多个代理或不同类型代理之间的分工保持连续。如果你在用 AI 做稍微复杂的事，值得早早配好这一点。

## 我的工作流，一步一步看

整个项目中，我个人的偏好是：始终审阅 AI 的工作，尤其是设计阶段。AI 起草，我批准。完整流程如下。

**1. 与 Claude 和 Codex 一起发散、澄清。**
写代码之前，我会和两者一起把想法说出来。这个应用到底做什么？用户是谁？核心交互应该是什么感觉？在两者之间来回讨论，很快就能发现不同角度，也能把模糊想法压缩成可定义的东西。这一阶段的产物，是 MVP 的一组粗略用户故事和行为。

**2. UI 草图与组件决策。**
Claude 和 Codex 都能直接在聊天界面里生成粗略 UI 草图，方便快速验证布局。更重要的是，这时我会确定原生组件的选择：哪些 SwiftUI 基础组件该用，哪些该避开。ProjectDawn 就是在这里决定用常驻 `.sheet` 作为习惯托盘的，后来才知道，这也悄悄埋下了一个坑。

<img
  alt="ProjectDawn 界面与交互草图，展示默认、拖动和放置后的状态"
  src="/assets/images/posts/building-project-dawn/ui-ux.png"
/>

**3. PRD。**
概念验证后，我请 Claude 写正式的产品需求文档。我仔细阅读，指出错误或遗漏，反复调整，直到它准确反映我想做的东西。这份文档成为后续所有工作的指引。

**4. 总体计划。**
PRD 进一步变成分阶段的总体计划。Claude 编写，我逐阶段审阅，检查顺序是否合理，功能依赖是否考虑周全。它保存在 `Docs/plan.md`。

**5. 各阶段实现计划。**
每个阶段开始实现前，我请 Claude 写详细计划：模块设计、文件布局、关键决策、考虑过又否定的替代方案，以及常常用来给 Codex 划定边界的起步代码片段。我审阅每一份，再放入 `Docs/Implementation Plans/`。Codex 实际依据的就是这些文档。

**6. Codex 实现。**
有了清楚的实现计划，Codex 就负责主要实现工作。计划足够具体，很少跑偏。即使跑偏，有计划作参照，也容易看出它在哪里偏离了原意。

**7. 审阅。**
根据要检查的内容，审阅有几种方式：自己读 diff、运行项目感受交互，或请 Claude 对照实现计划审阅产物。复杂或风险较高的阶段，我会三种都做。

### 结构引导质量

围绕 AI 生成代码，最重要的配置之一就是结构，它会极大影响最终质量。

这个个人项目的门槛，我有意设得低一些。但对生产级项目，我会配置检查器、格式化工具和自动化，例如用 [SwiftFormat](https://github.com/nicklockwood/SwiftFormat) 和 [SwiftLint](https://github.com/realm/SwiftLint) 约束风格与惯用法，配好 CI/CD 流程，再用 [Danger](https://danger.systems/) 强制检查测试覆盖率、标出未记录的变更。这些约束到位后，AI 的输出也必须通过。代码更一致，不是因为你客气地提出要求，而是工具自动执行标准。

关键认识是：如果希望 AI 生成的代码达到某个标准，就让工具能够强制执行它，别只靠肉眼。

## 真正做成、也让我惊艳的部分

最让我意外的设计与实现，是习惯托盘和时间线之间的拖拽协调，而且它能干净地跨越两个独立模块。Claude 出色地写出了一份技术设计文档，说明组件如何交互，并用具体代码支撑思路。

用户从托盘拖出一个胶囊状习惯项时，手势始于 `HabitTray`，但放置目标，也就是时间格网，位于 `Timeline`。这是两个编译为独立静态框架的模块，没有直接依赖。应用需要实时把“一个习惯正在被拖动，目前悬停在第 34 格”这样的信息从一侧传到另一侧。

解决方案是在 `Interaction` 模块中共享一个 `HabitDragCoordinator`。它是一个 `@Observable` 类，`HabitTray` 和 `Timeline` 都能读取，由应用根部注入环境。

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Modules/Interaction/Sources/HabitDragCoordinator.swift" %}

长按手势开始时，`HabitTrayView` 调用 `coordinator.begin(habit:at:)`，手指移动时调用 `coordinator.move(to:)`。层级上位于两者之上的 `DayView` 观察 `dragCoordinator.dragLocation`，把屏幕坐标转换成时间线格位：

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Modules/DayView/Sources/DayView.swift#L48-L63" %}

结果是：从托盘拖动习惯项时，时间线上的格子实时高亮，每次切换格位都有触觉吸附反馈。手指松开后，`DayView` 读取悬停格位，计算准确时间戳，再向 SwiftData 插入一个 `HabitInstance`。托盘不知道时间线，时间线也不知道托盘，`DayView` 则协调这些协调器。

这些连接逻辑，我一行都没写。Claude 设计架构，Codex 实现。第一次运行就能工作，触觉反馈、高亮和放置的感觉都对，那一刻真的让人看着屏幕想：_AI 确实每天都在变聪明。_

## 一路学到的东西

### Claude 很会规划，但确实慢

我说 Claude 是规划者，意思是它真的能产出设计文档。下面是它为习惯托盘编写的第 4 阶段计划，涵盖模块边界、`presentationDetents` 的选择、布局常量，以及每项选择的理由：

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Docs/Implementation%20Plans/Phase4-HabitTray.md" %}

这份文档塑造了 Codex 的实现方式。写下来也意味着，实际结果偏离计划时，我有依据可以回看。而且它就在仓库里，未来某次 Claude 会话即使没有背景，也能读完立刻理解理由，不需要我重新说明。

但慢也是真的。有些时候，我只能等 Claude 完成一轮规划，没法继续前进。这不至于让我放弃，认真思考本就需要时间，但需要知道，这不是一种“每秒六十帧式氛围编程”的工作流。

<video controls muted playsinline preload="metadata" aria-label="屏幕录像：Claude 花了很长时间思考 ProjectDawn 的实现细节" style="width: 100%; height: auto;"><source src="/assets/images/posts/building-project-dawn/claude-thinking-a-lot.mp4" type="video/mp4" />你的浏览器不支持 video 标签。</video>

<p class="tc"><em>Claude 慢慢思考中。</em></p>

### 坑 1：GCD 陷阱

最早需要我介入的地方之一，是并发处理。Claude 用 `DispatchQueue.main.async` 生成了一些定时逻辑，这是旧式 Grand Central Dispatch 模式，现代 Swift 代码大多已经转向其他方式。它能用，但放在其余地方都使用 `async/await` 和 `Task.sleep` 的代码库里，显得不协调。

严格说这不是*错误*选择，GCD 并没有坏，但它*不一致*。这种事人类审阅者很容易一眼发现，因为风格明显不对。AI 没有这种直觉。我发现后指出来，让 Codex 用 `Task.sleep` 重写。这只花了两分钟，但前提是我一直在留意。

它说明了一个我不断想到的事实：**AI 会选择第一个看起来可行的方案，不一定是最符合惯用法的方案。** 流程里需要有人知道，在具体语境下，“对”应该是什么样。

### 坑 2：把 Sheet 吃掉的 Alert

<video controls autoplay loop muted playsinline preload="metadata" aria-label="屏幕录像：习惯托盘 sheet 显示时，ProjectDawn 时间线中的删除确认 bug" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"><source src="/assets/images/posts/building-project-dawn/bug.mp4" type="video/mp4" />你的浏览器不支持 video 标签。</video>

<p class="tc"><em>现场演示：alert 把 sheet 吃掉了！</em></p>

这个问题更戏剧化。

应用通过 `.sheet(isPresented: .constant(true))` 把习惯托盘作为常驻 sheet 展示，时间线位于它下面。后来我添加了从时间线删除习惯实例的功能：长按，确认，完成。

实际发生的是：长按时间线上的习惯项，整个托盘消失，第一次尝试时，确认对话框也自动关闭了。

Claude 写的 bug 分析把经过解释得很清楚：

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Docs/bug-analysis-timeline-instance-delete.md" %}

简而言之，UIKit 有一条规则：一个视图控制器如果已经呈现另一个视图控制器，就不能再呈现新的模态界面。确认对话框试图从 sheet 下方的时间线层弹出时，UIKit 通过关闭 sheet 来解决冲突。`.contextMenu` 修饰符又让情况更糟，它会主动拉回 sheet，以便“窥视”下方内容。

Claude 规划删除功能时没有预料到这一点，而我在审阅计划时也没足够留意。Claude 孤立地设计了这个交互，没有想到从时间线发起的界面呈现，会如何与同一个父视图控制器呈现的 sheet 相互影响。这是很细微的 UIKit 行为，需要真实的 iOS 经验才知道。

修复涉及重新安排由哪一层拥有确认对话框，这次教训的代价稍大一些。

顺便说一句，Codex 尝试了几次，都没做出正确修复。Claude 第一次就给出了出色分析，其建议解决了问题。这类 bug 正是 Claude 较慢但更系统的推理真正占优势的地方。

### 更深的教训：AI 不会考虑组件之间的相互作用

sheet/alert 问题只是一个更广泛现象的例子，整个项目中我都注意到了：**AI 会孤立地规划功能，却不会模拟它们如何彼此作用。**

Claude 为第 4 阶段托盘、第 5 阶段拖放、第 6 阶段时间线实例，都写了很好的计划。每份计划内部都自洽，却没有任何一份模拟：从第 6 阶段代码呈现对话框，会如何影响第 4 阶段的 sheet 架构。

这并不意外。AI 只能针对上下文窗口里的内容推理，它没有一套持续运行的 UIKit 呈现栈心智模拟，也不会随着新功能不断累积而更新它。

两点收获：

**第一，**我们仍在早期。AI 已有的能力很令人印象深刻。它设计了模块化、多 target 的 Tuist 工作区，写出了跨模块边界、能正常工作的拖拽协调器，也产出了我愿意拿到真正代码审阅中分享的架构文档。但它缺少经验丰富的工程师从亲历故障中积累的直觉。

**第二，**它会变得更好。UIKit 呈现冲突及类似陷阱，越多出现在训练数据中，比如 bug 报告、Stack Overflow 回答、这样的工程博客，未来模型就越能预先想到它们。我相信，再过几年，这类跨功能交互问题，会成为 AI 在规划时主动指出的事。

目前，规划审阅中仍需要有真正发布过 iOS 应用的人参与。

## 哪种 AI 代码可以接受？

我一直碰到一个问题：我有多信任 AI 生成的代码？答案会不会随代码用途而改变？

我开始用一个粗略的分层体系理解它：

**第 1 层：纯 UI。** 布局、颜色 token、间距、动画。这一层我几乎完全信任 AI 输出。如果按钮宽了 2 点，或者动画曲线略有偏差，我能从视觉上发现，五秒钟修好。故障只影响外观。

**第 2 层：UI 交互与手势。** 拖拽行为、sheet 呈现、触觉反馈、状态转换。需要更多审阅。sheet/alert 的 bug 就在这一层。故障影响的不只是外观，而是行为；行为 bug 往往只有运行时按特定顺序操作才会出现，很难单凭静态计划推理出来。

**第 3 层：业务逻辑。** 数据模型决策、持久化、同步、状态管理。这一层的所有内容，我都想理解。AI 可以起草，但我会认真阅读，自己考虑边界情况。

**第 4 层：安全、认证、支付、隐私。** 这是我最谨慎的地方。不是因为 AI 无能，而是这里的故障后果严重，又不明显，甚至需要领域知识才知道该问什么问题。

这种分层并不是在判断 AI 能否写出语法正确的代码，而是在判断：评估输出需要多少领域经验，以及输出若存在细微错误，后果会有多糟。

更底层还有一个偏哲学的想法：AI 目前是工具箱里最新的工具，它加速人类的工作。但要做什么、用起来该是什么感觉、一个架构决策三年后是否仍站得住脚、某个 bug 只是外观问题还是灾难，这些判断仍属于人。想做出体现自己愿景与标准的东西，方向盘后面仍然需要人。AI 让车更快，不是让驾驶者过时。

## 最大收获：先做 POC，再做工程

这个项目带来的思路变化，是我不断回想的一点。

过去，开始一个新项目、想把它“好好做”时，我会立刻想到模块边界、协议、依赖注入、SOLID 原则，以及所有好工程的标志。然后花很长时间搭结构，却还没证明*自己在做的东西*到底是不是想做的。

有 AI 帮忙，可以走更快的路：**先做一个粗糙、随时可丢弃的概念验证。** 证明交互模型可行，证明把习惯拖到时间线上、看它吸附的感觉确实好。必要时把整个东西写在一个文件里，快速迭代，把它当成一次性原型。然后，如果概念证明了自己值得存在，再提炼成工程上完善的项目。

AI 非常擅长快速生成第一版。所有东西放在一个视图文件里，它并不在意。一个下午就能做出交互原型。在决定任何架构之前，你就能体验产品、观察真实数据流、感受手势、遭遇故障。

以后做东西，我都会采用这个方法。先用快速的 POC 级代码搞清楚体验。证明成立后，再引入模块、协议、测试 target。别提前。

## 最后的想法

ProjectDawn 仍在早期，版本是 v0.1+，核心的拖拽记录流程已经可用，也还有一些粗糙之处。但开发过程已经改变了我对 AI 辅助开发的理解。

Claude 负责规划和批判性思考，Codex 负责实现和速度，两者组合比单独使用更有用。Tuist 的模块化结构让 AI 输出更容易审阅。文档放在仓库里，让代理真正能跨会话、跨工具协作。而失败，包括 GCD 的不一致、sheet/alert 冲突，比成功更有启发，因为它们准确揭示了人工把关仍然重要的地方。

如果你想做一个原生应用，正在犹豫要不要让 AI 参与：可以，去做吧。只是别松开方向盘。
