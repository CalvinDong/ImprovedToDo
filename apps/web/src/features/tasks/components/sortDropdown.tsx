import { useState } from "react";
import type { SortOption, SortState } from "../types";

type SortDropdownProps<T extends string> = {
  options: readonly SortOption<T>[];
  sort: SortState<T>;
  defaultState: SortState<T>;
  onSortChange: (sort: SortState<T>) => void;
};

export default function SortDropdown<T extends string>({
  options,
  sort,
  defaultState,
  onSortChange,
}: SortDropdownProps<T>) {
  const selectedOption = options.find((option) => option.value === sort.field);
  const showDirection = selectedOption?.supportsDirection ?? false;
  const defaultSelected = sort.field === "default"

  const [open, setOpen] = useState(false);

  return (
    <div className={`flex gap-0.5 ${defaultSelected ? "" : "border-solid border-2 border-accent rounded-md"}`}>
       { !defaultSelected ?
        <button 
          className="btn btn-sm btn-ghost border border-base-300 bg-base-100 font-extrabold text-error"
          onClick={() =>
                      onSortChange(defaultState)
                    }
        >
          X
        </button> : <></>
      }
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          type="button"
          className="btn btn-sm btn-ghost border border-base-300 bg-base-100 font-medium"
        >
          Sort: {selectedOption?.label ?? "Select"}
        </button>

        <div
          tabIndex={-1}
          className="dropdown-content z-100 mt-2 w-max rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lg"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Sort by
          </div>

          <ul className="menu gap-1 p-0">
            {options.map((option) => {
              const selected = sort.field === option.value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={(e) => {
                      onSortChange({
                        field: option.value,
                        direction: sort.direction,
                      });

                      (e.currentTarget as HTMLElement).blur(); // 👈 closes dropdown
                    }}
                    className={`justify-between rounded-xl px-3 py-2 text-sm ${
                      selected ? "bg-base-200 font-semibold w-max" : ""
                    }`}
                  >
                      <span>{option.label}</span>
                      {selected && <span className="text-base-content/50">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          {showDirection && (
            <>
              <div className="my-2 border-t border-base-300" />

              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Order
              </div>

              <ul className="menu gap-1 p-0">
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      onSortChange({
                        field: sort.field,
                        direction: "asc",
                      })
                    }
                    className={`justify-between rounded-xl px-3 py-2 text-sm ${
                      sort.direction === "asc" ? "bg-base-200 font-semibold" : ""
                    }`}
                  >
                    <span>Ascending</span>
                    {sort.direction === "asc" && (
                      <span className="text-base-content/50">↑</span>
                    )}
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() =>
                      onSortChange({
                        field: sort.field,
                        direction: "desc",
                      })
                    }
                    className={`justify-between rounded-xl px-3 py-2 text-sm ${
                      sort.direction === "desc" ? "bg-base-200 font-semibold" : ""
                    }`}
                  >
                    <span>Descending</span>
                    {sort.direction === "desc" && (
                      <span className="text-base-content/50">↓</span>
                    )}
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
      { showDirection ?
        <button 
          className="btn btn-sm btn-ghost border border-base-300 bg-base-100 font-medium"
          onClick={() =>
                      onSortChange({
                        field: sort.field,
                        direction: sort.direction === "desc" ? "asc" : "desc"
                      })
                    }
        >
          {sort.direction === "asc" ? " ↑" : " ↓"}
        </button> : <></>
      }
    </div>
    
  );
}


