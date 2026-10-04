---
title: 本地化格式化器：Slay The Spire 2 研究笔记
date: 2026-04-25
---

这篇笔记最初来自我的 [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire/) 仓库，这是一个集中存放 Slay The Spire 2 相关内容的 monorepo。

转发到这里，是因为编程 agent 只用几分钟就能做完这些研究，并给出详细文档，这件事让我**惊叹**，惊叹，惊叹 🪨🪨🪨。

> 基于反编译的 `v0.103.2` 源代码所做的初步记录。

本文记录卡牌本地化中的 `diff()` 等格式化器函数，是如何被解析和应用的。

[[toc]]

## 目的

卡牌本地化字符串可以包含这样的 SmartFormat 表达式：

```json
"ABRASIVE.description": "Gain {DexterityPower:diff()} [gold]Dexterity[/gold].\nGain {ThornsPower:diff()} [gold]Thorns[/gold]."
```

其中的 `diff()` 不是卡牌类上的方法，也没有定义在 JSON 里。它是游戏的本地化管理器注册的一个 SmartFormat 格式化器。

## 格式化器注册

`LocManager.LoadLocFormatters()` 创建游戏使用的 `SmartFormatter`，并注册多个自定义格式化器：

```csharp
_smartFormatter.AddExtensions(
    listFormatter,
    new PluralLocalizationFormatter(),
    new ConditionalFormatter(),
    new ChooseFormatter(),
    new SubStringFormatter(),
    new IsMatchFormatter(),
    new LocaleNumberFormatter(),
    new DefaultFormatter(),
    new AbsoluteValueFormatter(),
    new EnergyIconsFormatter(),
    new StarIconsFormatter(),
    new HighlightDifferencesFormatter(),
    new HighlightDifferencesInverseFormatter(),
    new PercentMoreFormatter(),
    new PercentLessFormatter(),
    new ShowIfUpgradedFormatter());
```

相关源文件：

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization/LocManager.cs`

## `diff()` 格式化器

`diff()` 由 `HighlightDifferencesFormatter` 提供。

这个格式化器声明的 SmartFormat 名称是 `diff`：

```csharp
public string Name
{
    get
    {
        return "diff";
    }
    set
    {
        throw new NotImplementedException();
    }
}
```

它只处理 `DynamicVar` 实例类型的值：

```csharp
public bool TryEvaluateFormat(IFormattingInfo formattingInfo)
{
    if (!(formattingInfo.CurrentValue is DynamicVar dynamicVar))
    {
        return false;
    }
    formattingInfo.Write(dynamicVar.ToHighlightedString(inverse: false));
    return true;
}
```

相关源文件：

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization.Formatters/HighlightDifferencesFormatter.cs`

还有一个名为 `inverseDiff` 的反向版本，由 `HighlightDifferencesInverseFormatter` 实现，调用的是 `ToHighlightedString(inverse: true)`。

## 动态变量高亮

`DynamicVar.ToHighlightedString()` 将当前预览值与附魔后的值进行比较，除非这个变量刚刚升级：

```csharp
public string ToHighlightedString(bool inverse)
{
    int value = (int)PreviewValue;
    int value2 = (int)EnchantedValue;
    return StsTextUtilities.HighlightChangeText(
        baseComparison: WasJustUpgraded ? 1 : ((!inverse) ? value.CompareTo(value2) : value2.CompareTo(value)),
        text: value.ToString(CultureInfo.InvariantCulture));
}
```

高亮本身由 `StsTextUtilities.HighlightChangeText()` 处理：

```csharp
public static string HighlightChangeText(string text, int baseComparison)
{
    StringBuilder stringBuilder = new StringBuilder(text);
    if (baseComparison == 0)
    {
        return stringBuilder.ToString();
    }
    string text2 = ((baseComparison > 0) ? "green" : "red");
    stringBuilder.Insert(0, "[" + text2 + "]");
    stringBuilder.Append("[/" + text2 + "]");
    return stringBuilder.ToString();
}
```

因此：

- 比较结果为 `0` 时，渲染普通文本
- 比较结果 `> 0` 时，用 `[green]...[/green]` 包住数值
- 比较结果 `< 0` 时，用 `[red]...[/red]` 包住数值
- `WasJustUpgraded == true` 时，强制使用绿色高亮

相关源文件：

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization.DynamicVars/DynamicVar.cs`
- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.TextEffects/StsTextUtilities.cs`

## 卡牌描述的代码路径

卡牌描述由 `CardModel.GetDescriptionForPile()` 格式化。

该方法会：

1. 创建卡牌描述的 `LocString`。
2. 将卡牌全部动态变量添加到这个 `LocString`。
3. 添加额外的格式化变量，例如升级状态、战斗状态、目标状态和图标路径。
4. 调用 `description.GetFormattedText()`。

相关片段：

```csharp
LocString description = Description;
DynamicVars.AddTo(description);
AddExtraArgsToDescription(description);
...
span[index] = description.GetFormattedText();
```

`LocString.GetFormattedText()` 将工作交给：

```csharp
return LocManager.Instance.SmartFormat(this, _variables);
```

相关源文件：

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Models/CardModel.cs`
- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization/LocString.cs`

## 实例：Abrasive

`Abrasive` 卡牌定义了两个标准动态变量：

```csharp
protected override IEnumerable<DynamicVar> CanonicalVars => new global::_003C_003Ez__ReadOnlyArray<DynamicVar>(new DynamicVar[2]
{
    new PowerVar<ThornsPower>(4m),
    new PowerVar<DexterityPower>(1m)
});
```

`PowerVar<T>` 用 `typeof(T).Name` 为自己命名，因此这些变量的名称为：

- `ThornsPower`
- `DexterityPower`

相关源文件：

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Models.Cards/Abrasive.cs`
- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization.DynamicVars/PowerVar.cs`

原始本地化字符串引用了这些变量名：

```json
"ABRASIVE.description": "Gain {DexterityPower:diff()} [gold]Dexterity[/gold].\nGain {ThornsPower:diff()} [gold]Thorns[/gold]."
```

### 正常显示

在升级预览或战斗修正生效之前：

| 变量 | BaseValue | EnchantedValue | PreviewValue | WasJustUpgraded |
| --- | ---: | ---: | ---: | --- |
| `DexterityPower` | 1 | 1 | 1 | `false` |
| `ThornsPower` | 4 | 4 | 4 | `false` |

两次 `diff()` 比较的结果都是 `0`，因此两个数值都不带颜色：

```text
Gain 1 [gold]Dexterity[/gold].
Gain 4 [gold]Thorns[/gold].
```

### 升级预览

`Abrasive.OnUpgrade()` 只升级 `ThornsPower`：

```csharp
protected override void OnUpgrade()
{
    base.DynamicVars["ThornsPower"].UpgradeValueBy(2m);
}
```

升级预览时：

| 变量 | BaseValue | EnchantedValue | PreviewValue | WasJustUpgraded |
| --- | ---: | ---: | ---: | --- |
| `DexterityPower` | 1 | 1 | 1 | `false` |
| `ThornsPower` | 6 | 6 | 6 | `true` |

`DexterityPower:diff()` 仍然渲染普通的 `1`。

`ThornsPower:diff()` 调用 `ToHighlightedString(false)`。由于 `WasJustUpgraded` 为 true，格式化器强制使用正的比较结果，将数值渲染为绿色：

```text
Gain 1 [gold]Dexterity[/gold].
Gain [green]6[/green] [gold]Thorns[/gold].
```

## 战斗预览说明

`diff()` 不只用于升级预览。

`PowerVar<T>.UpdateCardPreview()` 可以通过全局钩子更新 `PreviewValue`：

```csharp
base.PreviewValue = Hook.ModifyPowerAmountGiven(
    card.CombatState,
    ModelDb.Power<T>(),
    card.Owner.Creature,
    base.BaseValue,
    target,
    card,
    out IEnumerable<AbstractModel> _);
```

当卡牌处于适用的预览上下文时，`CardModel.UpdateDynamicVarPreview()` 会为每个动态变量调用 `UpdateCardPreview()`。

这意味着 `diff()` 也能高亮实时战斗修正后的数值，而不只是升级后的数值。
