import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { MapPin, Search, Loader2, Check, X } from 'lucide-react';
import { addressService, AddressDto, GeocodeResultDto } from '@/services/addressService';

interface AddressAutocompleteInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: AddressDto) => void;
  selectedAddress?: AddressDto | null;
  required?: boolean;
}

export function AddressAutocompleteInput({
  label,
  placeholder = 'Search address or city...',
  value,
  onChange,
  onAddressSelect,
  selectedAddress,
  required = false,
}: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodeResultDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await addressService.searchAddresses(text);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.warn('Search suggestions error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (item: GeocodeResultDto) => {
    const fullText = item.displayName || item.line1 || value;
    onChange(fullText);

    const addressDto: AddressDto = {
      line1: item.line1 || fullText,
      city: item.city || 'City',
      state: item.state || 'State',
      country: item.country || 'Country',
      postalCode: item.postalCode,
      latitude: item.latitude,
      longitude: item.longitude,
      formattedAddress: fullText,
    };

    if (onAddressSelect) {
      onAddressSelect(addressDto);
    }

    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold uppercase text-navy-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          ) : (
            <MapPin className="h-4 w-4 text-navy-400" />
          )}
        </div>

        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className="pl-9 pr-8"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Selected Coordinates Tag */}
      {selectedAddress && selectedAddress.latitude && selectedAddress.longitude && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <Check className="h-3 w-3 text-emerald-600 flex-shrink-0" />
          <span className="truncate">
            Geocoded: <strong>{selectedAddress.city || selectedAddress.line1}</strong> ({selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)})
          </span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-navy-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-navy-50">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(item)}
              className="p-3 hover:bg-primary-50/60 cursor-pointer transition-colors flex items-start gap-2.5 text-left"
            >
              <MapPin className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-navy-900 truncate">
                  {item.line1 || item.city || item.displayName}
                </div>
                <div className="text-[11px] text-navy-500 truncate">
                  {item.displayName}
                </div>
                <div className="text-[10px] font-mono text-navy-400 mt-0.5">
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
