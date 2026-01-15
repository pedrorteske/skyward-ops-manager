import * as React from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
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
import { countries, getCountryByCode } from "@/data/countries";

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Selecione o país",
  id,
  className,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  // Find country by name or code
  const selectedCountry = React.useMemo(() => {
    if (!value) return null;
    // Try to find by name first
    const byName = countries.find(
      (c) => c.name.toLowerCase() === value.toLowerCase()
    );
    if (byName) return byName;
    // Try by code
    return getCountryByCode(value);
  }, [value]);

  const handleSelect = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    if (country) {
      onChange(country.name);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selectedCountry && "text-muted-foreground",
            className
          )}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{placeholder}</span>
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-50 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>País não encontrado.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => handleSelect(country.code)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountry?.code === country.code
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
