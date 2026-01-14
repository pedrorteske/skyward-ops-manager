import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
import { countries, Country } from '@/data/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'BR',
  placeholder = 'Telefone',
  id,
  className,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );

  // Parse initial value to extract country code and phone number
  React.useEffect(() => {
    if (value) {
      // Try to find a matching dial code in the value
      for (const country of countries) {
        if (value.startsWith(country.dialCode)) {
          setSelectedCountry(country);
          break;
        }
      }
    }
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    
    // Update the phone value with new country code
    const phoneWithoutCode = getPhoneWithoutCode(value);
    onChange(`${country.dialCode} ${phoneWithoutCode}`);
  };

  const getPhoneWithoutCode = (phone: string): string => {
    // Remove any existing dial code
    let cleanPhone = phone.trim();
    for (const country of countries) {
      if (cleanPhone.startsWith(country.dialCode)) {
        cleanPhone = cleanPhone.slice(country.dialCode.length).trim();
        break;
      }
    }
    return cleanPhone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    // Only store the number part, we'll combine with code on display/submit
    onChange(`${selectedCountry.dialCode} ${phoneNumber}`);
  };

  const displayPhoneNumber = React.useMemo(() => {
    return getPhoneWithoutCode(value);
  }, [value]);

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between px-2 font-normal"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm text-muted-foreground">
                {selectedCountry.dialCode}
              </span>
            </span>
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 z-50" align="start">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandList>
              <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode}`}
                    onSelect={() => handleCountrySelect(country)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCountry.code === country.code
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className="text-lg mr-2">{country.flag}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {country.dialCode}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={displayPhoneNumber}
        onChange={handlePhoneChange}
        className="flex-1"
      />
    </div>
  );
}
