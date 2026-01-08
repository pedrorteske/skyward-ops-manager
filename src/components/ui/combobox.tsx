import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  allowCustomValue?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar ou digitar...",
  emptyText = "Nenhum resultado encontrado.",
  className,
  allowCustomValue = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Check if the value is a custom value (not in options)
  const selectedOption = options.find((option) => option.value === value);
  const isCustomValue = value && !selectedOption;
  
  // Display value: if it's a custom value, show the value itself, otherwise show the label
  const displayValue = isCustomValue ? value : selectedOption?.label;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue === value ? "" : optionValue);
    setInputValue("");
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (allowCustomValue && e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      // Check if input matches an existing option
      const matchingOption = options.find(
        (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
      );
      if (matchingOption) {
        onValueChange(matchingOption.value);
      } else {
        // Use the input as custom value
        onValueChange(inputValue.trim());
      }
      setInputValue("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border border-border z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <CommandList>
            {filteredOptions.length === 0 && !allowCustomValue && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {filteredOptions.length === 0 && allowCustomValue && inputValue.trim() && (
              <CommandEmpty>
                <span className="text-muted-foreground">Pressione Enter para usar: </span>
                <span className="font-medium">{inputValue}</span>
              </CommandEmpty>
            )}
            {filteredOptions.length === 0 && allowCustomValue && !inputValue.trim() && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
