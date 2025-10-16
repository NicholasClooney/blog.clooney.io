import { useEffect, useState } from "react";
import { useStdout } from "ink";

const DEFAULT_COLUMNS = 80;
const DEFAULT_ROWS = 24;

export interface StdoutDimensions {
  columns: number;
  rows: number;
}

export const useStdoutDimensions = (): StdoutDimensions => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<StdoutDimensions>({
    columns: stdout?.columns ?? DEFAULT_COLUMNS,
    rows: stdout?.rows ?? DEFAULT_ROWS,
  });

  useEffect(() => {
    if (!stdout) {
      return;
    }

    const handleResize = () => {
      setDimensions({
        columns: stdout.columns,
        rows: stdout.rows,
      });
    };

    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  return dimensions;
};
