---
title: "复习 SwiftUI 状态管理、async/await 和常见模式"
date: 2026-06-17
time: "14:30"
tags:
  - swift
  - ios
  - swiftui
  - observation
  - concurrency
  - mvvm
  - swift-series
excerpt: "一份面向 2026 年真实代码库的 SwiftUI 实用复习：iOS 17 之前的状态管理、现代 @Observable、作为默认选择的 async/await，以及网络请求、导航和错误处理的常用模式。"
---

每次隔了一阵子重新回到 SwiftUI，我都希望有一页内容，让我迅速捡起日常真正会用到的框架知识。不必是面面俱到的参考手册，只要是一套能上手的理解：2026 年大家常用什么，旧属性包装器究竟在做什么，以及打开真实代码库时，我希望随手可用的模式。

这篇就是那一页。

[[toc]]

## 值得常温习的 Swift 基础

在进入 SwiftUI 细节之前，有几个语言特性几乎出现在你读到的每个文件里。都不冷门，但很容易生疏。

可选值无处不在。`if let`、`guard let`、`??` 和可选链做的事情相近，但在函数内部，我默认用 `guard let`，让失败情况提前退出，正常路径不用增加缩进。

结构体和类在 SwiftUI 中承担不同含义。视图是结构体，每次变化时复制，所以视图 body 显得轻量。ViewModel 是类，按引用共享，因此其中的状态能跨渲染保留。结构体不支持继承，类支持。

闭包经常作为尾随参数出现。容易踩的坑是异步闭包或逃逸闭包持有 `self`，所以 `[weak self]` 捕获列表对我来说已经是习惯，而不是每次临时决定。

协议让代码库保持可测试。藏在协议背后的网络层，在测试里可以替换为 mock，无需改动其他部分。我会优先考虑协议加具体类型，然后才考虑继承。

`Codable`，准确说是 `Decodable` 和 `Encodable`，是处理 JSON 的主力。值得记住的是 `CodingKeys`，因为 JSON 字段名与 Swift 属性名不一致的情况非常常见。

## 2026 年的状态管理

MVVM 并没有过时，但它不再是唯一默认的思考方式。趋势是状态优先：先想数据，再想视图，把小而独立的状态和逻辑模块组合起来，而不是把所有东西都塞进 ViewModel。

实际工作中，代码库会告诉你自己属于哪个时代。

- 目标为 iOS 17+ 的项目倾向于使用 `@Observable`，把旧的 `ObservableObject` 机制收进一个宏，让视图通过 `@State` 和 `@Environment` 观察模型对象。
- 目标为 iOS 15 和 16 的项目仍使用 `ObservableObject` 搭配 `@Published`，再通过 `@StateObject`、`@ObservedObject` 和 `@EnvironmentObject` 观察。
- 结构清晰的 ViewModel、服务层负责真实网络请求、视图尽量只负责展示，这种 MVVM 仍是实际代码最常见的形态，也是多数面试官和队友预期看到的样子。

2026 年现代 MVVM 的 ViewModel，是一个状态明确的 `@Observable` 类，通过协议注入服务，除非确有需要，否则不用 Combine 管道。视图自然绑定，保持简洁。

## 重温 iOS 17 之前的属性包装器

如果你最近一直用 `@Observable` 和 `@State`，旧包装器在思路上并没有什么不同，只是底层接线方式不同。记住三个就够。

### `@StateObject`

这是*拥有对象*的包装器。视图创建模型，并在自身生命周期内持有它。在 `@Observable` 的世界里，这正是 `@State var vm = MyViewModel()` 做的事。

```swift
struct EventListView: View {
    @StateObject private var vm = EventListViewModel()
    // vm is created here, lives as long as this view does
}
```

### `@ObservedObject`

这是*接收对象*的包装器。视图不拥有对象，只观察由上层创建并传入的对象。

```swift
struct EventDetailView: View {
    @ObservedObject var vm: EventDetailViewModel
    // vm is passed in, owned by parent
}
```

经典的坑是，本该用 `@StateObject` 的地方用了 `@ObservedObject`。父视图重新渲染时，你以为一直持有的对象被重新创建，状态就悄悄消失了。

### `@EnvironmentObject`

这是通过环境注入的包装器。父视图用 `.environmentObject(...)` 注入一次对象，任意后代视图都可以按类型取出它，无需沿视图树逐层传递。忘记注入，得到的是运行时崩溃，而不是编译错误。

```swift
// Root
ContentView()
    .environmentObject(AppState())

// Any descendant, no explicit passing needed
struct SomeDeepView: View {
    @EnvironmentObject var appState: AppState
}
```

新旧对应关系很清楚，记在脑中并不难。

| 旧方式（`ObservableObject`） | 新方式（`@Observable`） |
|---|---|
| `@StateObject var vm = VM()` | `@State var vm = VM()` |
| `@ObservedObject var vm: VM` | 普通的 `var vm: VM`，由外部传入 |
| `@EnvironmentObject var x: X` | `@Environment(X.self) var x` |

## async/await 是默认选择

现在处理异步工作，答案就是 async/await。Combine 仍然存在，旧代码库里也会看到，但我不会首先选它。

视图层的两个入口含义不同。`.task` 修饰符用于与视图生命周期绑定的数据加载：视图出现时运行，视图消失时取消。

```swift
.task {
    await vm.loadEvents()
}
```

普通的 `Task { }` 则适合由用户动作触发的异步工作，比如点击按钮。它不绑定视图生命周期，这正是用途所在。

```swift
Button("Refresh") {
    Task {
        await vm.reload()
    }
}
```

`@MainActor` 让你不用再担心 UI 更新落在哪个线程。给 ViewModel 加上标注就行，无需手动调用 `DispatchQueue.main.async`，也不会出现意外。

```swift
@MainActor
class EventViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            events = try await service.fetchEvents()
        } catch {
            // handle
        }
    }
}
```

可能失败的异步操作，标准签名是 `async throws`。网络请求就是最明显的例子。

```swift
func fetchEvents() async throws -> [Event] {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode([Event].self, from: data)
}
```

旧代码库里仍会看到 Combine，通常用于 `@Published` 管道、搜索防抖或组合多个 publisher。你不一定需要能从零写出来，但需要认得。

```swift
$searchText
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .sink { [weak self] query in self?.search(query) }
    .store(in: &cancellables)
```

现代的对应写法是 `.task(id: searchText)`，配合 `try await Task.sleep` 做防抖。需要注意，对 `Task.sleep` 使用 `try?` 会吞掉取消错误，也就破坏了使用 `.task` 的意义。

## 常见 SwiftUI 模式

下面这些日常结构，几乎每个界面都会遇到。

### 网络请求

用一个 `@MainActor` ViewModel 明确管理加载、错误和数据状态，再配上视图的 `.task` 修饰符，就是朴素而正确的做法。

```swift
@MainActor
class EventsViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false
    @Published var error: Error?

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            events = try await APIService.shared.fetchEvents()
        } catch {
            self.error = error
        }
    }
}
```

### 使用 `NavigationStack` 导航

`NavigationStack` 取代 `NavigationView`，同时支持声明式和编程式导航。声明式写法把 `NavigationLink(value:)` 与 `.navigationDestination(for:)` 配对使用。

```swift
NavigationStack {
    List(events) { event in
        NavigationLink(event.title, value: event)
    }
    .navigationDestination(for: Event.self) { event in
        EventDetailView(event: event)
    }
    .navigationTitle("Events")
}
```

编程式导航则持有一个 `NavigationPath`，任何能访问这个绑定的地方都可以 push 或 pop。

```swift
@State var path = NavigationPath()

NavigationStack(path: $path) {
    // ...
    Button("Open") { path.append(someEvent) }
}
```

### 视图中的错误处理

有三种值得记住的形式，按上下文选择。

```swift
// 1. Inline conditional (simplest)
if let error = vm.error {
    Text(error.localizedDescription).foregroundStyle(.red)
}

// 2. Alert
.alert("Error", isPresented: $vm.showError) {
    Button("OK", role: .cancel) {}
} message: {
    Text(vm.errorMessage)
}

// 3. Custom error enum for user-facing messages
enum AppError: LocalizedError {
    case networkFailure, notFound, unauthorized
    var errorDescription: String? {
        switch self {
        case .networkFailure: return "Network error. Please try again."
        case .notFound: return "Item not found."
        case .unauthorized: return "Session expired."
        }
    }
}
```

反模式是在视图里直接显示 alert，每次都重复写错误到提示文案的映射。把映射集中到 ViewModel，视图就能保持简洁。

### 更清晰的加载状态

`isLoading` 加可选 `error`、再加可选 `data` 的形式能工作，却也能表达本不可能出现的状态。用一个枚举则能穷尽情况，迫使视图处理每一种状态。

```swift
enum ViewState<T> {
    case idle, loading, success(T), failure(Error)
}

@Published var state: ViewState<[Event]> = .idle
```

这样的设计，会让代码审阅或面试交流轻松不少。它说明你会先考虑状态的形态，而不是一上来就到处散布布尔值。

这就是我的实用知识集。并不穷尽所有内容，但足够让我走进一个 SwiftUI 代码库，读起来不再发怵。
