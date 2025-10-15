import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";

export type SelectItem<Value> = {
  label: string;
  value: Value;
  key?: string;
};

export interface SelectableListProps<Value> {
  items: SelectItem<Value>[];
  isActive: boolean;
  onSelect: (item: SelectItem<Value>) => void | Promise<void>;
  itemKeyPrefix: string;
  emptyPlaceholder?: React.ReactNode;
  renderItem?: (item: SelectItem<Value>, isSelected: boolean) => React.ReactNode;
  pointerColumnWidth?: number;
}

export const SelectableList = <Value,>({
  items,
  isActive,
  onSelect,
  itemKeyPrefix,
  emptyPlaceholder,
  renderItem,
  pointerColumnWidth = 2,
}: SelectableListProps<Value>) => {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    setHighlightIndex((current) => {
      if (items.length === 0) {
        return 0;
      }

      return Math.min(current, items.length - 1);
    });
  }, [items]);

  useEffect(() => {
    if (items.length === 0) {
      setHighlightIndex(0);
    }
  }, [items.length]);

  useInput(
    (input, key) => {
      if (!isActive || items.length === 0) {
        return;
      }

      if (key.upArrow || input === "k") {
        setHighlightIndex((current) => {
          if (current === 0) {
            return items.length - 1;
          }

          return current - 1;
        });
        return;
      }

      if (key.downArrow || input === "j") {
        setHighlightIndex((current) => (current + 1) % items.length);
        return;
      }

      if (key.return) {
        const item = items[highlightIndex];
        if (item) {
          void onSelect(item);
        }
      }
    },
    { isActive }
  );

  if (items.length === 0) {
    return emptyPlaceholder ? <>{emptyPlaceholder}</> : null;
  }

  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const isSelected = index === highlightIndex;
        const pointerColor = isSelected ? "cyan" : "gray";
        return (
          <Box key={item.key ?? `${itemKeyPrefix}-${index}`} flexDirection="row">
            <Box width={pointerColumnWidth}>
              <Text color={pointerColor}>{isSelected ? "›" : " "}</Text>
            </Box>
            <Box flexGrow={1}>
              {renderItem ? (
                renderItem(item, isSelected)
              ) : (
                <Text color={isSelected ? "cyan" : undefined}>{item.label}</Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
