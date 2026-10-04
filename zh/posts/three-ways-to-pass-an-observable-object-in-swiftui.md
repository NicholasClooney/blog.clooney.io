---
title: "在 SwiftUI 中传递 @Observable 对象的三种方式"
date: 2026-04-25
tags:
  - swift
  - ios
  - swiftui
  - observation
  - swift-series
excerpt: |
  环境注入、直接通过初始化器传递和 @Binding 都能共享 SwiftUI 状态，但它们在所有权、耦合程度和接口范围上表达了不同的含义。
---

环境注入、直接初始化和 `@Binding`，是在 SwiftUI 中向子视图传递 `@Observable` 对象或其一部分的三种不同方式。表面上它们很像，但在所有权、耦合程度和接口范围上的语义有明显区别。

[[toc]]

## 1. `.environment` / `@Environment`

将对象注入视图树，让任何后代视图按类型取出它。

```swift
// Parent
ContentView()
    .environment(state)

// Child (anywhere in the subtree)
@Environment(AppState.self) var state
```

对象会隐式地沿整个视图层级传递。任何后代都可以选择使用它，不必经过中间视图层层转交。

- 子视图拿到**同一个引用**，修改在各处都可见
- 没有初始化器参数，调用处看不见这个依赖
- 忘记注入时，会在运行时崩溃，而不是编译时报错

> 最适合整个应用或子树共享的状态：认证会话、导航模型、用户偏好、主题。

## 2. 直接初始化：`Subview(state: state)`

通过子视图的初始化器传入对象，将其保存为普通存储属性。

```swift
// Child
struct Subview: View {
    let state: AppState

    var body: some View {
        Text(state.title)
    }
}

// Parent
Subview(state: state)
```

由于 `@Observable` 对象是类，子视图持有的是同一实例的引用。子视图做出的修改会自动反映到父视图，不需要 `@Binding`。

- 依赖明确，在调用处就能看见
- 编译期安全，由类型系统强制保证
- 最容易理解，也最容易单独做单元测试

> 最适合紧密关联的父子视图：多写一个参数，换来一目了然的关系，是值得的。

## 3. `@Binding`

传递针对单个属性投影出的绑定，而不是整个对象。

```swift
// Parent: @Bindable lets you project $ bindings from @Observable
@Bindable var state: AppState

NameField(name: $state.username)

// Child
struct NameField: View {
    @Binding var name: String

    var body: some View {
        TextField("Username", text: $name)
    }
}
```

子视图获得的是与某个具体值的双向连接，不需要知道父级模型的类型。写入会自动传回数据源。

- 接口范围最小，子视图只看到自己需要的内容
- 组件可以在不同模型类型之间复用
- 父视图一侧需要 `@Bindable`，才能从 `@Observable` 对象生成 `$` 投影
- 对于值类型，这也是合适的模式，因为 `@Observable` 仅支持类

> 最适合不应依赖特定模型类型的可复用或通用子视图，也适合基本值类型。

## 速查

| 模式 | 语法 | 传递内容 | 耦合情况 |
|---|---|---|---|
| `.environment` | `@Environment(T.self)` | 整个对象，隐式传递 | 任意深度，缺失时在运行时崩溃 |
| 直接初始化 | `let state: T` | 整个对象，显式传递 | 编译期安全，与父级模型关联更紧密 |
| `@Binding` | `@Binding var x: T` | 单个属性，双向连接 | 可复用，需要父级使用 `@Bindable` |

核心区别在于：环境注入和直接初始化都会以引用语义传递*整个对象*，并允许完整的修改操作。`@Binding` 传递的是*针对某个属性投影出的绑定*：读写范围有限，也不包含对象引用。想做可复用的组件时，选择 `@Binding`；可以接受与特定模型耦合时，就选择另外两种。
