---
title: Localization Formatters - Slay The Spire 2 Research Note
date: 2026-04-25
---

Originally from my [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire/) repo which is the monorepo hosting everything Slay The Spire 2 related things.

Reposting it here because I am **AMAZED** amazed amazed 🪨🪨🪨 by how well coding agents can do these
research in minutes and give you a detailed documentation.

> Initial notes from decompiled `v0.103.2` sources.

This document records how card localization formatter functions such as `diff()` are resolved and applied.

[[toc]]

## Purpose

Card localization strings can contain SmartFormat expressions such as:

```json
"ABRASIVE.description": "Gain {DexterityPower:diff()} [gold]Dexterity[/gold].\nGain {ThornsPower:diff()} [gold]Thorns[/gold]."
```

The `diff()` part is not a method on the card class and is not defined in the JSON. It is a SmartFormat formatter registered by the game's localization manager.

## Formatter Registration

`LocManager.LoadLocFormatters()` creates the game's `SmartFormatter` and registers several custom formatters:

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

Relevant source:

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization/LocManager.cs`

## `diff()` Formatter

`diff()` is provided by `HighlightDifferencesFormatter`.

The formatter advertises the SmartFormat name `diff`:

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

It only handles values that are `DynamicVar` instances:

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

Relevant source:

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization.Formatters/HighlightDifferencesFormatter.cs`

There is also an inverse version named `inverseDiff`, implemented by `HighlightDifferencesInverseFormatter`, which calls `ToHighlightedString(inverse: true)`.

## Dynamic Variable Highlighting

`DynamicVar.ToHighlightedString()` compares the current preview value against the enchanted value, unless the variable was just upgraded:

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

The highlighting itself is handled by `StsTextUtilities.HighlightChangeText()`:

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

Therefore:

- comparison `0` renders plain text
- comparison `> 0` wraps the value in `[green]...[/green]`
- comparison `< 0` wraps the value in `[red]...[/red]`
- `WasJustUpgraded == true` forces green highlighting

Relevant sources:

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization.DynamicVars/DynamicVar.cs`
- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.TextEffects/StsTextUtilities.cs`

## Card Description Code Path

Card descriptions are formatted by `CardModel.GetDescriptionForPile()`.

The method:

1. Creates the card description `LocString`.
2. Adds all card dynamic variables to that `LocString`.
3. Adds extra formatting variables such as upgrade state, combat state, target state, and icon paths.
4. Calls `description.GetFormattedText()`.

Relevant excerpt:

```csharp
LocString description = Description;
DynamicVars.AddTo(description);
AddExtraArgsToDescription(description);
...
span[index] = description.GetFormattedText();
```

`LocString.GetFormattedText()` delegates to:

```csharp
return LocManager.Instance.SmartFormat(this, _variables);
```

Relevant sources:

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Models/CardModel.cs`
- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization/LocString.cs`

## Worked Example: Abrasive

The `Abrasive` card defines two canonical dynamic variables:

```csharp
protected override IEnumerable<DynamicVar> CanonicalVars => new global::_003C_003Ez__ReadOnlyArray<DynamicVar>(new DynamicVar[2]
{
    new PowerVar<ThornsPower>(4m),
    new PowerVar<DexterityPower>(1m)
});
```

`PowerVar<T>` names itself with `typeof(T).Name`, so these variables are named:

- `ThornsPower`
- `DexterityPower`

Relevant sources:

- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Models.Cards/Abrasive.cs`
- `Lab/decompiled/v0.103.2/MegaCrit.Sts2.Core.Localization.DynamicVars/PowerVar.cs`

The raw localization string references those variable names:

```json
"ABRASIVE.description": "Gain {DexterityPower:diff()} [gold]Dexterity[/gold].\nGain {ThornsPower:diff()} [gold]Thorns[/gold]."
```

### Normal display

Before upgrade preview or combat modifiers:

| Variable | BaseValue | EnchantedValue | PreviewValue | WasJustUpgraded |
| --- | ---: | ---: | ---: | --- |
| `DexterityPower` | 1 | 1 | 1 | `false` |
| `ThornsPower` | 4 | 4 | 4 | `false` |

Both `diff()` comparisons are `0`, so both values render without color:

```text
Gain 1 [gold]Dexterity[/gold].
Gain 4 [gold]Thorns[/gold].
```

### Upgrade preview

`Abrasive.OnUpgrade()` upgrades only `ThornsPower`:

```csharp
protected override void OnUpgrade()
{
    base.DynamicVars["ThornsPower"].UpgradeValueBy(2m);
}
```

For the upgrade preview:

| Variable | BaseValue | EnchantedValue | PreviewValue | WasJustUpgraded |
| --- | ---: | ---: | ---: | --- |
| `DexterityPower` | 1 | 1 | 1 | `false` |
| `ThornsPower` | 6 | 6 | 6 | `true` |

`DexterityPower:diff()` still renders plain `1`.

`ThornsPower:diff()` calls `ToHighlightedString(false)`. Because `WasJustUpgraded` is true, the formatter forces a positive comparison and renders the value green:

```text
Gain 1 [gold]Dexterity[/gold].
Gain [green]6[/green] [gold]Thorns[/gold].
```

## Combat Preview Notes

`diff()` is not only for upgrade previews.

`PowerVar<T>.UpdateCardPreview()` can update `PreviewValue` through global hooks:

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

`CardModel.UpdateDynamicVarPreview()` calls `UpdateCardPreview()` for each dynamic variable when the card is in an applicable preview context.

This means `diff()` can also highlight live combat-modified values, not just upgraded values.
