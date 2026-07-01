export function splitBonusText(bonus: string | undefined): { label: string | undefined; text: string } {
  const separatorIndex = bonus?.indexOf(":") ?? -1;

  return {
    label: separatorIndex >= 0 ? bonus?.slice(0, separatorIndex + 1) : bonus,
    text: separatorIndex >= 0 ? bonus?.slice(separatorIndex + 1).trimStart() ?? "" : ""
  };
}
