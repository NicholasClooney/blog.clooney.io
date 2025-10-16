import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useInput, useStdout } from "ink";

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
  reservedRows?: number;
  minViewportRows?: number;
}

export const SelectableList = <Value,>({
  items,
  isActive,
  onSelect,
  itemKeyPrefix,
  emptyPlaceholder,
  renderItem,
  pointerColumnWidth = 2,
  reservedRows = 0,
  minViewportRows = 3,
}: SelectableListProps<Value>) => {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const { stdout } = useStdout();
  const [rows, setRows] = useState(stdout?.rows ?? 24);

  useEffect(() => {
    if (!stdout) {
      return;
    }

    const handleResize = () => {
      setRows(stdout.rows);
    };

    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  const viewportRows = useMemo(() => {
    const availableRows = rows - reservedRows;
    if (availableRows <= 0) {
      return Math.max(1, minViewportRows);
    }

    if (availableRows < minViewportRows) {
      return Math.max(1, availableRows);
    }

    return availableRows;
  }, [minViewportRows, reservedRows, rows]);

  useEffect(() => {
    if (items.length === 0) {
      setHighlightIndex(0);
      setWindowStart(0);
      return;
    }

    setHighlightIndex((current) => {
      if (current >= items.length) {
        return items.length - 1;
      }
      return current;
    });
  }, [items]);

  useEffect(() => {
    const maxStart = Math.max(0, items.length - viewportRows);
    setWindowStart((current) => {
      if (current > maxStart) {
        return maxStart;
      }
      if (current < 0) {
        return 0;
      }
      return current;
    });
  }, [items.length, viewportRows]);

  useEffect(() => {
    if (highlightIndex < windowStart) {
      setWindowStart(highlightIndex);
      return;
    }

    const windowEnd = windowStart + viewportRows;
    if (highlightIndex >= windowEnd) {
      setWindowStart(Math.max(0, highlightIndex - viewportRows + 1));
    }
  }, [highlightIndex, viewportRows, windowStart]);

  const visibleItems = useMemo(() => {
    if (items.length === 0) {
      return [];
    }
    const endIndex = Math.min(items.length, windowStart + viewportRows);
    return items.slice(windowStart, endIndex);
  }, [items, viewportRows, windowStart]);

  useInput(
    (input, key) => {
      if (!isActive || items.length === 0) {
        return;
      }

      if (key.upArrow || input === "k") {
        setHighlightIndex((current) => {
          if (items.length === 0) {
            return current;
          }

          if (current <= 0) {
            return items.length - 1;
          }

          return current - 1;
        });
        return;
      }

      if (key.downArrow || input === "j") {
        setHighlightIndex((current) => {
          if (items.length === 0) {
            return current;
          }

          if (current >= items.length - 1) {
            return 0;
          }

          return current + 1;
        });
        return;
      }

      if (key.pageUp) {
        setHighlightIndex((current) => {
          if (items.length === 0) {
            return current;
          }
          return Math.max(0, current - viewportRows);
        });
        return;
      }

      if (key.pageDown) {
        setHighlightIndex((current) => {
          if (items.length === 0) {
            return current;
          }
          return Math.min(items.length - 1, current + viewportRows);
        });
        return;
      }

      if (key.home) {
        setHighlightIndex(0);
        return;
      }

      if (key.end) {
        setHighlightIndex(items.length - 1);
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

  const fillerRows = Math.max(0, viewportRows - visibleItems.length);

  return (
    <Box flexDirection="column">
      {visibleItems.map((item, index) => {
        const absoluteIndex = windowStart + index;
        const isSelected = absoluteIndex === highlightIndex;
        const pointerColor = isSelected ? "cyan" : "gray";
        return (
          <Box
            key={item.key ?? `${itemKeyPrefix}-${absoluteIndex}`}
            flexDirection="row"
          >
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
      {fillerRows > 0
        ? Array.from({ length: fillerRows }).map((_, fillerIndex) => (
            <Text key={`filler-${fillerIndex}`}> </Text>
          ))
        : null}
    </Box>
  );
};
