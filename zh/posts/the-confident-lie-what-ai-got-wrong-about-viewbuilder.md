---
title: "自信的谎言：AI 对 @ViewBuilder 的误解"
date: 2026-04-29
tags:
  - swift
  - ios
  - swiftui
  - ai
  - swift-series
excerpt: |
  一次真实的 SwiftUI 调试记录，涉及可选视图、过度自信的 AI 建议，以及为什么 body 能继承 @ViewBuilder，而你自己的计算视图属性不能。
---

我正在 SwiftUI 里做一个卡牌组件。有些卡牌有画面边框图片，有些没有。它是一个可选资源，所以我写了下面的代码。注意，Corruption 的卡面周围没有边框：

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/confident-lie/corruption-has-no-portrait-border.jpg"
    alt="用 SwiftUI 复刻的 Slay the Spire 2 卡牌，没有画面边框"
    style="max-height: 640px; width: auto; max-width: 100%;"
  />
  <figcaption>我想整理的卡牌视图：有些卡牌有画面边框，有些没有。</figcaption>
</figure>

```swift
var portraitBorder: some View {
    if let border = card.portraitBorder {
        Image(border)
            .resizable()
            .cardAssetColor(card.rarityColor)
            .frame(width: 275, height: 210)
            .offset(x: 12.5, y: 47)
    } else {
        EmptyView()
    }
}
```

它不能工作，而且显得啰嗦。于是我请 AI 推荐一个更简洁的写法。

[[toc]]

## 它建议的修复

AI 很自信地告诉我，去掉 `else { EmptyView() }` 就行。它说 `@ViewBuilder` 会自动处理缺失的分支，而返回 `some View` 的计算属性本来就隐式带有 `@ViewBuilder`，所以下面这样可以直接用：

```swift
var portraitBorder: some View {
    if let border = card.portraitBorder {
        Image(border)
            .resizable()
            .cardAssetColor(card.rarityColor)
            .frame(width: 275, height: 210)
            .offset(x: 12.5, y: 47)
    }
}
```

简洁，符合惯用写法。但**是错的**。

编译器马上报错，于是我提出了质疑。

## 自信的谎言

AI 反而更坚持了。它再次保证，返回 `some View` 的计算属性确实会隐式获得 `@ViewBuilder`，就像 `body` 一样。去掉 `else`，它说，会工作的。

并没有。

这种失误模式值得点明：AI 说错了，真实的编译器错误已经纠正了它，它却仍然坚持原来的说法。不是因为它固执，而是它确实不知道自己不知道什么。它从一个听起来合理的规则开始推理：`body` 不需要显式写 `@ViewBuilder`，所以计算视图属性大概也不需要。然后，它用与陈述已知事实同样自信的语气，说出了这条规则。

在我反复追问后，AI 最终承认的修复办法其实很简单：

```swift
@ViewBuilder
var portraitBorder: some View {
    if let border = card.portraitBorder {
        Image(border)
            .resizable()
            .cardAssetColor(card.rarityColor)
            .frame(width: 275, height: 210)
            .offset(x: 12.5, y: 47)
    }
}
```

只加一个标注。它为什么这么重要？

## 为什么 `body` 不需要

关键区别在于，构建器标注来自哪里。

Apple 文档把 `View.body` 定义为一个带有 `@ViewBuilder` 标注的协议要求。因此，遵循协议的视图在实现 `body` 时，会从该协议要求继承结果构建器的行为。这种魔法并不附着在每一个返回 `some View` 的计算属性上，而是附着在这个特定的协议要求上。

从概念上说，SwiftUI 的 `View` 协议如下：

```swift
public protocol View {
    associatedtype Body: View
    @ViewBuilder var body: Self.Body { get }
}
```

因此，下面这样可以工作：

```swift
struct Example: View {
    var body: some View {
        if isEnabled {
            Text("Enabled")
        }
    }
}
```

而自定义计算属性没有可供继承的协议要求：

```swift
var portraitBorder: some View {
    if let border = card.portraitBorder {
        Image(border)
    }
}
```

没有 `@ViewBuilder` 时，Swift 会把这个 getter 当作普通 Swift 代码。一个没有 `else` 分支的 `if` 语句，无法在所有路径上产生值，因此会导致编译错误。

## `@ViewBuilder` 实际做了什么

`@ViewBuilder` 是一个结果构建器。结果构建器是 Swift 的一项语言特性，允许带特定标注的函数、属性、下标或闭包参数，把一组语句转换成一个结果值。

底层上，结果构建器定义了一些具有特定名称的静态方法，编译器会重写代码块来调用它们。与这里有关的方法是：

- `buildBlock(...)`，将多个子结果合成一个结果
- SwiftUI `ViewBuilder` 中的 `buildIf(_:)`，处理没有 `else` 的 `if`
- `buildEither(first:)` 和 `buildEither(second:)`，处理 `if/else` 和 `switch` 分支

所以，当你写下：

```swift
@ViewBuilder
var portraitBorder: some View {
    if let border = card.portraitBorder {
        Image(border)
    }
}
```

Swift 就不再把它当作一个在某条分支上忘记返回值的普通 getter，而会应用结果构建器转换，让 `ViewBuilder` 将这个可选的视图生成分支表示为一个具体结果。

没有 `@ViewBuilder`，这些转换都不会发生。Swift 只看到一个有时不返回值的 getter，于是拒绝编译。

## 更广泛的模式

让 SwiftUI 容器语法成立的，也是同一个机制：

```swift
VStack {
    Text("Hello")
    Text("World")
    Image("icon")
}
```

`VStack` 的尾随闭包参数标注了 `@ViewBuilder`。编译器会把子视图语句重写为一个组合结果，因此闭包中可以包含多个并列视图，却仍然返回单个 `some View`。

关键不是每个看起来像 SwiftUI 的代码块都有这种行为，而是构建器必须有来源：例如 `View.body` 这样的协议要求、你自己标注的声明，或所调用 API 已经标注的闭包参数。

## 收获

AI 建议的模式，思路上是对的，却错在一个由编译器严格约束的具体细节。没有 `else { EmptyView() }` 的 `if let`，正是我想要的惯用写法。只是对于任何非 `body` 的计算属性，都需要显式启用 `@ViewBuilder`。

规则很简单：

- `body` 从 `View` 协议继承 `@ViewBuilder`
- 其他地方如果想要结果构建器行为，就需要自己的 `@ViewBuilder`

比起 AI，更要相信编译器。两者意见不一致时，相信编译器。

写于一次真实调试之后。AI 已经被告知自己的错误，并相应更新了先验。大概吧。

## 来源

- [SwiftUI `View.body` 文档](https://developer.apple.com/documentation/swiftui/view/body-8kl5o)
- [SwiftUI `ViewBuilder` 文档](https://developer.apple.com/documentation/swiftui/viewbuilder)
- [SwiftUI `ViewBuilder.buildIf(_:)` 文档](https://developer.apple.com/documentation/swiftui/viewbuilder/buildif%28_%3A%29)
- [SE-0289：结果构建器](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0289-result-builders.md)
