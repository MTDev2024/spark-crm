import { cn } from "@/lib/utils";

/**
 * <select> natif habillé comme les champs de saisie.
 * Choix volontaire : le select natif est accessible et très bien géré sur mobile.
 */
export function NativeSelect({
  className,
  options,
  ...props
}: Omit<React.ComponentProps<"select">, "children"> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={props.name}
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Transforme un dictionnaire { valeur: libellé } en options pour NativeSelect. */
export function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
