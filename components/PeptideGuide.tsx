"use client";

import { useState } from "react";
import { ChevronDown, Droplet, Calendar, Clock, Snowflake, Target, Dna, AlertTriangle } from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export default function PeptideGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>("reconstitution");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const sections: GuideSection[] = [
    {
      id: "reconstitution",
      title: "Reconstitution & Dilution",
      icon: Droplet,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Basic Process</h4>
            <ol className="space-y-2 font-mono text-xs text-[#e0e0e5] list-decimal list-inside">
              <li>Remove peptide vial cap and alcohol swab the rubber stopper</li>
              <li>Draw bacteriostatic water (BAC) with insulin syringe</li>
              <li>Inject BAC water slowly down the side of the vial (NOT directly onto powder)</li>
              <li>Let it dissolve naturally - do not shake (gentle swirl is OK)</li>
              <li>Label vial with peptide name, concentration, and date mixed</li>
            </ol>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Common Dilution Ratios</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#00ffaa]/20">
                    <th className="py-2 px-3 text-left font-mono text-[10px] text-[#00ffaa]">Peptide Amount</th>
                    <th className="py-2 px-3 text-left font-mono text-[10px] text-[#00ffaa]">BAC Water</th>
                    <th className="py-2 px-3 text-left font-mono text-[10px] text-[#00ffaa]">Final Concentration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">5mg</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">2ml</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">2.5mg/ml (250mcg per 0.1ml)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">10mg</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">2ml</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">5mg/ml (500mcg per 0.1ml)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">5mg</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">1ml</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">5mg/ml (500mcg per 0.1ml)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded border border-amber-400/40 bg-amber-400/5 p-3">
            <p className="font-mono text-[10px] text-amber-400">
              <span className="font-semibold">PRO TIP:</span> More water = easier to measure precise doses. Less water = fewer injections per vial.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "dosing",
      title: "Dosing Schedules",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Common Patterns</h4>
            <div className="space-y-3">
              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Daily (QD)</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">Once per day, same time each day</p>
                <p className="font-mono text-[10px] text-[#9a9aa3]">
                  Best for: BPC-157, TB-500, GHK-Cu, most healing peptides
                </p>
              </div>

              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Twice Daily (BID)</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">Morning and evening (12 hours apart)</p>
                <p className="font-mono text-[10px] text-[#9a9aa3]">
                  Best for: Ipamorelin, CJC-1295 (no DAC), growth hormone secretagogues
                </p>
              </div>

              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Every Other Day (EOD)</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">Skip a day between doses</p>
                <p className="font-mono text-[10px] text-[#9a9aa3]">
                  Best for: High-dose TB-500, maintenance protocols
                </p>
              </div>

              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Weekly</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">Once per week (e.g., Mondays)</p>
                <p className="font-mono text-[10px] text-[#9a9aa3]">
                  Best for: CJC-1295 with DAC, Thymosin Alpha-1
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Timing Tips</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Morning doses:</span> Empty stomach, 30 min before breakfast</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Evening doses:</span> 2+ hours after last meal, before bed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Growth hormone peptides:</span> Avoid food/carbs for 1 hour after injection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Consistency matters:</span> Set phone alarms, build into daily routine</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "cycle-timing",
      title: "Cycle Timing",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Standard Cycle Lengths</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#00ffaa]/20">
                    <th className="py-2 px-3 text-left font-mono text-[10px] text-[#00ffaa]">Duration</th>
                    <th className="py-2 px-3 text-left font-mono text-[10px] text-[#00ffaa]">Best For</th>
                    <th className="py-2 px-3 text-left font-mono text-[10px] text-[#00ffaa]">Break After</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">4 weeks</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">Acute injury, short protocols</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#9a9aa3]">2-4 weeks</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">8 weeks</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">Most healing peptides (standard)</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#9a9aa3]">4-8 weeks</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">12 weeks</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">GH secretagogues, body comp</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#9a9aa3]">8-12 weeks</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-[#00ffaa]">10 days</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#e0e0e5]">Epitalon (short intensive)</td>
                    <td className="py-2 px-3 font-mono text-xs text-[#9a9aa3]">3-6 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Why Take Breaks?</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Receptor sensitivity:</span> Prevents downregulation and maintains effectiveness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Cost efficiency:</span> Many benefits continue after stopping (collagen synthesis, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Safety:</span> Allows body to return to baseline, reduces unknown long-term risks</span>
              </li>
            </ul>
          </div>

          <div className="rounded border border-[#22d3ee]/40 bg-[#22d3ee]/5 p-3">
            <p className="font-mono text-[10px] text-[#22d3ee]">
              <span className="font-semibold">RULE OF THUMB:</span> Take a break equal to at least half your cycle length. Example: 8-week cycle = 4+ week break.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "storage",
      title: "Storage & Handling",
      icon: Snowflake,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Unmixed (Lyophilized Powder)</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Freezer (-20°C):</span> 1-2 years</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Fridge (2-8°C):</span> 3-6 months</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Room temp:</span> Not recommended (degrades quickly)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Mixed (Reconstituted)</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Fridge (2-8°C):</span> 2-4 weeks (most peptides)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Do NOT freeze:</span> Reconstituted peptides lose potency if frozen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Light protection:</span> Keep in original vial or wrap in foil (some peptides photosensitive)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Travel Tips</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Ice packs:</span> Use insulated bag with ice packs (not direct contact)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Cooler bags:</span> Small insulin cooler bags work perfectly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Short trips:</span> Reconstituted peptides can handle 12-24h at room temp if unavoidable</span>
              </li>
            </ul>
          </div>

          <div className="rounded border border-amber-400/40 bg-amber-400/5 p-3">
            <p className="font-mono text-[10px] text-amber-400">
              <span className="font-semibold">IMPORTANT:</span> Always label vials with name, concentration, and reconstitution date. Discard if cloudy, discolored, or past expiration.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "injection",
      title: "Injection Technique",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Subcutaneous (SubQ) Basics</h4>
            <p className="font-mono text-xs text-[#e0e0e5] mb-3">
              Most peptides are injected subcutaneously (under the skin, into fat layer). NOT intramuscular.
            </p>
            <ol className="space-y-2 font-mono text-xs text-[#e0e0e5] list-decimal list-inside">
              <li>Wash hands thoroughly</li>
              <li>Alcohol swab injection site (let dry 30 seconds)</li>
              <li>Pinch skin to create a fold</li>
              <li>Insert needle at 45° angle (or 90° if more fat)</li>
              <li>Inject slowly (5-10 seconds)</li>
              <li>Remove needle, apply gentle pressure (don't rub)</li>
              <li>Dispose of needle in sharps container</li>
            </ol>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Best Injection Sites</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Abdomen</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  2+ inches from belly button. Most common site, easy to reach, good absorption.
                </p>
              </div>
              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Thigh</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Front or outer thigh. Good for self-injection, rotate sides.
                </p>
              </div>
              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Upper Arm</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Back of arm (tricep area). Harder to reach alone.
                </p>
              </div>
              <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-3">
                <h5 className="font-mono text-xs font-semibold text-[#00ffaa] mb-1">Love Handles</h5>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Side of waist. Good fat layer, comfortable angle.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Equipment</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Insulin syringes:</span> 0.3ml or 0.5ml with 29-31G needle (8mm length)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Alcohol swabs:</span> Pre-packaged sterile swabs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Sharps container:</span> Never reuse needles, proper disposal</span>
              </li>
            </ul>
          </div>

          <div className="rounded border border-[#22d3ee]/40 bg-[#22d3ee]/5 p-3">
            <p className="font-mono text-[10px] text-[#22d3ee]">
              <span className="font-semibold">ROTATION IS KEY:</span> Never inject the same spot twice in a row. Rotate through 4-6 different sites to prevent scar tissue buildup.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "peptides-101",
      title: "Common Peptides 101",
      icon: Dna,
      content: (
        <div className="space-y-3">
          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">BPC-157</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Healing injuries (tendons, ligaments, muscles, gut)
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 250-500mcg daily or twice daily
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 4-8 weeks
            </p>
          </div>

          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">TB-500 (Thymosin Beta-4)</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Tissue repair, inflammation, flexibility
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 2-2.5mg twice weekly (loading), then 2mg weekly (maintenance)
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 4-8 weeks
            </p>
          </div>

          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">Ipamorelin + CJC-1295</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Growth hormone release, sleep, recovery, body composition
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 200-300mcg each, twice daily (morning/night)
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 8-12 weeks
            </p>
          </div>

          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">GHK-Cu (Copper Peptide)</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Skin, hair, wound healing, anti-aging
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 1-3mg daily
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 4-12 weeks
            </p>
          </div>

          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">Epitalon</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Longevity, telomere health, circadian rhythm
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 5-10mg daily
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 10-20 days (short intensive), repeat 1-2x/year
            </p>
          </div>

          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">Thymosin Alpha-1</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Immune function, chronic infections, autoimmune support
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 1.6mg 2-3x weekly
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 4-12 weeks
            </p>
          </div>

          <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-3">
            <h5 className="font-mono text-sm font-semibold text-[#00ffaa] mb-1">Selank / Semax</h5>
            <p className="font-mono text-[10px] text-[#e0e0e5] mb-2">
              <span className="font-semibold">Purpose:</span> Cognitive enhancement, anxiety reduction, focus
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-1">
              <span className="font-semibold">Dose:</span> 300-600mcg daily (often intranasal)
            </p>
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="font-semibold">Duration:</span> 2-4 weeks
            </p>
          </div>
        </div>
      )
    },
    {
      id: "safety",
      title: "Safety & Side Effects",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">General Safety</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Start low:</span> Begin with lower doses to assess tolerance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Source matters:</span> Use reputable suppliers with third-party testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Medical oversight:</span> Work with knowledgeable healthcare provider when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ffaa] mt-0.5">•</span>
                <span><span className="font-semibold">Blood work:</span> Get baseline labs before starting, monitor during long cycles</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Common Side Effects</h4>
            <div className="space-y-2">
              <div className="rounded border border-amber-400/20 bg-amber-400/5 p-3">
                <p className="font-mono text-xs font-semibold text-amber-400 mb-1">Injection Site Reactions</p>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Redness, itching, mild swelling. Usually resolves in 24-48h. Rotate sites to minimize.
                </p>
              </div>

              <div className="rounded border border-amber-400/20 bg-amber-400/5 p-3">
                <p className="font-mono text-xs font-semibold text-amber-400 mb-1">Headaches / Flushing</p>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Common with GH secretagogues initially. Often resolves after first week. Stay hydrated.
                </p>
              </div>

              <div className="rounded border border-amber-400/20 bg-amber-400/5 p-3">
                <p className="font-mono text-xs font-semibold text-amber-400 mb-1">Water Retention</p>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Mild bloating with GH peptides. Usually temporary, improves after 2-3 weeks.
                </p>
              </div>

              <div className="rounded border border-amber-400/20 bg-amber-400/5 p-3">
                <p className="font-mono text-xs font-semibold text-amber-400 mb-1">Increased Hunger</p>
                <p className="font-mono text-[10px] text-[#e0e0e5]">
                  Ghrelin mimetics (Ipamorelin, GHRP-6) can increase appetite. Dose before bed if problematic.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">When to Stop</h4>
            <div className="rounded border border-red-400/40 bg-red-400/5 p-4">
              <p className="font-mono text-xs font-semibold text-red-400 mb-3">
                DISCONTINUE IMMEDIATELY if you experience:
              </p>
              <ul className="space-y-2 font-mono text-[10px] text-red-300">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Severe allergic reaction (difficulty breathing, hives, swelling)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Persistent severe headaches or vision changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Chest pain, rapid heart rate, or palpitations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Joint pain or carpal tunnel symptoms (GH peptides)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Any unusual or concerning symptoms</span>
                </li>
              </ul>
              <p className="mt-3 font-mono text-[10px] text-red-400">
                Seek medical attention if symptoms are severe.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-sm font-semibold text-[#00ffaa] mb-2">Contraindications</h4>
            <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⚠️</span>
                <span><span className="font-semibold">Cancer history:</span> Avoid GH peptides (can promote cell growth)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⚠️</span>
                <span><span className="font-semibold">Pregnancy/breastfeeding:</span> Insufficient safety data, avoid all peptides</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⚠️</span>
                <span><span className="font-semibold">Active infection:</span> Consult doctor before starting immune peptides</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⚠️</span>
                <span><span className="font-semibold">Diabetes:</span> GH peptides can affect blood sugar, monitor closely</span>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />

          <div>
            <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
              PEPTIDE GUIDE
            </h1>
            <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
              Essential knowledge for safe and effective peptide use
            </p>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xGUIDE</span>
        </div>

        {/* Guide Sections */}
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className={`deck-panel deck-card-bg deck-border-thick rounded-xl border-2 transition-all ${
                  isExpanded
                    ? "border-[#00ffaa]/40 shadow-[0_0_12px_rgba(0,255,170,0.2)]"
                    : "border-[#00ffaa]/20"
                }`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#00ffaa]/5"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isExpanded ? "text-[#00ffaa]" : "text-[#9a9aa3]"}`} />
                    <h3 className="font-mono text-sm font-semibold text-[#f5f5f7]">
                      {section.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-[#00ffaa] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[#00ffaa]/20 p-4">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="rounded border border-amber-400/40 bg-amber-400/5 p-4">
          <p className="font-mono text-[10px] text-amber-400 leading-relaxed">
            <span className="font-semibold">DISCLAIMER:</span> This guide is for educational purposes only. It is not medical advice.
            Consult with a qualified healthcare provider before starting any peptide protocol. Individual responses vary.
            Use peptides at your own risk and ensure compliance with local regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
