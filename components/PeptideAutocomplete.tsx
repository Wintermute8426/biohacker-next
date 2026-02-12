"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { PEPTIDE_LIST } from "@/lib/peptide-autocomplete-data";

interface PeptideAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function PeptideAutocomplete({
  value,
  onChange,
  placeholder = "e.g., BPC-157",
  required = false,
  className = "",
}: PeptideAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPeptides, setFilteredPeptides] = useState<string[]>(PEPTIDE_LIST);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter peptides based on input
    if (value.trim() === "") {
      setFilteredPeptides(PEPTIDE_LIST);
    } else {
      const filtered = PEPTIDE_LIST.filter((peptide) =>
        peptide.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPeptides(filtered);
    }
  }, [value]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectPeptide = (peptide: string) => {
    onChange(peptide);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          required={required}
          className={`w-full bg-black/50 border border-[#00ffaa]/30 rounded px-3 py-2 pr-8 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa] ${className}`}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9a9aa3] hover:text-[#00ffaa] transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && filteredPeptides.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-[#0a0a0a] border border-[#00ffaa]/30 rounded-lg shadow-lg">
          {filteredPeptides.map((peptide) => (
            <button
              key={peptide}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectPeptide(peptide);
              }}
              className="w-full text-left px-4 py-2 text-sm font-mono text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:text-[#00ffaa] transition-colors border-b border-white/5 last:border-b-0"
            >
              {peptide}
            </button>
          ))}
        </div>
      )}

      {isOpen && filteredPeptides.length === 0 && value.trim() !== "" && (
        <div className="absolute z-50 w-full mt-1 bg-[#0a0a0a] border border-[#00ffaa]/30 rounded-lg shadow-lg p-4">
          <p className="text-sm font-mono text-[#9a9aa3]">
            No matches found. You can still use "{value}" as a custom peptide.
          </p>
        </div>
      )}
    </div>
  );
}
