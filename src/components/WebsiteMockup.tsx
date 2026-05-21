import React, { useState } from 'react';
import { ImageAdjustments, LayoutType, WebsiteSettings } from '../types';
import { Copy, Check, ExternalLink, Monitor, RefreshCw, LayoutTemplate } from 'lucide-react';

interface WebsiteMockupProps {
  imageSrc: string;
  adjustments: ImageAdjustments;
  settings: WebsiteSettings;
  layout: LayoutType;
}

export const WebsiteMockup: React.FC<WebsiteMockupProps> = ({
  imageSrc,
  adjustments,
  settings,
  layout,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Generate CSS filter equivalent for layout implementation
  const filterString = [
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    `blur(${adjustments.blur / 2}px)`,
  ].join(' ');

  const getWarmthOverlayStyle = () => {
    const intensity = Math.abs(adjustments.warmth) / 250;
    if (adjustments.warmth === 0) return { display: 'none' };
    return {
      backgroundColor: adjustments.warmth > 0 ? '#ff8c00' : '#00bfff',
      opacity: intensity,
      mixBlendMode: 'color' as const,
    };
  };

  const getVignetteOverlayStyle = () => {
    const opacity = adjustments.vignette / 120;
    if (adjustments.vignette === 0) return { display: 'none' };
    return {
      background: `radial-gradient(circle, transparent 40%, rgba(0, 0, 0, ${opacity}) 100%)`,
    };
  };

  const getExposureOverlayStyle = () => {
    const value = adjustments.exposure - 100;
    if (value === 0) return { display: 'none' };
    return {
      backgroundColor: value > 0 ? '#ffffff' : '#000000',
      opacity: Math.abs(value) / 200,
      mixBlendMode: value > 0 ? ('screen' as const) : ('multiply' as const),
    };
  };

  const fontClasses = {
    editorial: "font-serif tracking-tight",
    sans: "font-sans font-medium tracking-tight",
    mono: "font-mono text-sm tracking-normal",
  };

  const fontStyleLabel = {
    editorial: "Playfair Display (Editorial Serif)",
    sans: "Space Grotesk (Modern Sans-Serif)",
    mono: "JetBrains Mono (Technical Minimalist)",
  };

  // Generate raw Tailwind + HTML/React code snippet for export
  const getCodeSnippet = () => {
    const warmthMarkup = adjustments.warmth !== 0 
      ? `\n      {/* Warmth overlay */}\n      <div className="absolute inset-0 pointer-events-none mix-blend-color" style={{ backgroundColor: '${adjustments.warmth > 0 ? '#ff8c00' : '#00bfff'}', opacity: ${Math.round((Math.abs(adjustments.warmth)/250)*100)/100} }} />`
      : '';
    const exposureMarkup = adjustments.exposure !== 100
      ? `\n      {/* Exposure overlay */}\n      <div className="absolute inset-0 pointer-events-none mix-blend-${adjustments.exposure > 100 ? 'screen' : 'multiply'}" style={{ backgroundColor: '${adjustments.exposure > 100 ? '#ffffff' : '#000000'}', opacity: ${Math.round((Math.abs(adjustments.exposure - 100)/200)*100)/100} }} />`
      : '';
    const vignetteMarkup = adjustments.vignette !== 0
      ? `\n      {/* Vignette overlay */}\n      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, transparent 40%, rgba(0, 0, 0, ${Math.round((adjustments.vignette/120)*100)/100}) 100%)' }} />`
      : '';
    const opacityOverlay = `\n      {/* Dark overlay */}\n      <div className="absolute inset-0 bg-black" style={{ opacity: ${settings.overlayOpacity / 100} }} />`;

    if (layout === 'hero') {
      return `// React + Tailwind CSS code for responsive Hero Section
import React from 'react';

export default function EditorialHero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[500px] bg-neutral-950 overflow-hidden flex items-center justify-center p-6 sm:p-12">
      {/* 1. Touched-up Image Background */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="your_touched_up_image.jpg"
          alt="Refined Background"
          className="w-full h-full object-cover"
          style={{ filter: '${filterString}' }}
        />${warmthMarkup}${exposureMarkup}${vignetteMarkup}${opacityOverlay}
      </div>

      {/* 2. Content Overlays */}
      <div className="relative z-10 max-w-4xl text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-${settings.fontStyle === 'editorial' ? 'serif' : settings.fontStyle === 'mono' ? 'mono' : 'sans'} tracking-tight leading-[1.1] mb-6">
          ${settings.heading}
        </h1>
        <p className="text-neutral-200 text-base sm:text-lg md:text-xl max-w-2xl font-sans mb-8 leading-relaxed font-light">
          ${settings.subheading}
        </p>
        <button 
          className="px-8 py-3.5 rounded-sm text-sm font-medium tracking-wide bg-white text-neutral-900 hover:bg-neutral-100 transition-colors shadow-lg active:scale-95 duration-100"
          style={{ borderLeft: '3px solid ${settings.accentColor}' }}
        >
          ${settings.ctaText}
        </button>
      </div>
    </section>
  );
}`;
    } else if (layout === 'split') {
      return `// React + Tailwind CSS code for responsive modern Split Card
import React from 'react';

export default function DesignModuleSplit() {
  return (
    <section className="w-full py-16 px-6 sm:px-12 bg-neutral-50 text-neutral-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Left Side: Editorial Image Canvas */}
        <div className="md:col-span-7 relative h-[450px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/50">
          <img
            src="your_touched_up_image.jpg"
            alt="Interior Concept"
            className="w-full h-full object-cover"
            style={{ filter: '${filterString}' }}
          />${warmthMarkup}${exposureMarkup}${vignetteMarkup}
        </div>

        {/* Right Side: Narrative and Action */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-0.5 w-8" style={{ backgroundColor: '${settings.accentColor}' }} />
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono">Bespoke Design Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl text-neutral-900 font-${settings.fontStyle === 'editorial' ? 'serif' : settings.fontStyle === 'sans' ? 'sans' : 'mono'} tracking-tight leading-snug mb-5">
            ${settings.heading}
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6 font-light">
            ${settings.subheading}
          </p>
          <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200/60 mb-6 font-mono text-xs text-neutral-500 space-y-2">
            <div><strong>Location:</strong> Creative Arts Studio</div>
            <div><strong>Tone Blueprint:</strong> Sage Greens / Warm Linens / Matte Charcoal</div>
            <div><strong>Philosophy:</strong> ${settings.heading.split('.')[0] || 'Aesthetic Permanence'}</div>
          </div>
          <button 
            className="self-start px-7 py-3 rounded-full text-xs uppercase tracking-widest font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-all duration-150 shadow-md active:scale-95"
            style={{ backgroundColor: '${settings.accentColor}' }}
          >
            ${settings.ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}`;
    } else {
      return `// React + Tailwind CSS code for Case Study Showcase Card
import React from 'react';

export default function CaseStudyCard() {
  return (
    <section className="w-full py-12 px-6 bg-neutral-900 text-white">
      <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-950/40 p-4 border border-neutral-800/80 overflow-hidden">
        {/* Main interactive showcase card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Visual Frame */}
          <div className="md:col-span-2 relative h-[380px] rounded-2xl overflow-hidden shadow-inner group">
            <img
              src="your_touched_up_image.jpg"
              alt="Design Process"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: '${filterString}' }}
            />${warmthMarkup}${exposureMarkup}${vignetteMarkup}
          </div>

          {/* Project Details Panel */}
          <div className="flex flex-col justify-between p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800/30">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '${settings.accentColor}' }} />
                <span className="text-[10px] font-mono tracking-widest text-[#8a9fa6] uppercase">In Production</span>
              </div>
              <h3 className="text-xl font-${settings.fontStyle === 'editorial' ? 'serif' : settings.fontStyle === 'sans' ? 'sans' : 'mono'} text-white leading-tight mb-3">
                ${settings.heading.split('.')[0] || 'Active Showcase'}
              </h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                ${settings.subheading.substring(0, 110)}...
              </p>
            </div>

            <div className="border-t border-neutral-800/80 pt-4 mt-4 space-y-2 text-[11px] font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Medium</span>
                <span className="text-neutral-200">Mixed Swatches</span>
              </div>
              <div className="flex justify-between">
                <span>Curation</span>
                <span className="text-neutral-200">Hand-Picked</span>
              </div>
              <div className="flex justify-between">
                <span>Accent</span>
                <span style={{ color: '${settings.accentColor}' }}>${settings.accentColor}</span>
              </div>
            </div>

            <button 
              className="w-full mt-4 py-2.5 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-150 hover:bg-neutral-750 border border-neutral-750 transition-colors"
            >
              ${settings.ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Workspace Container */}
      <div className="border border-neutral-200/80 rounded-2xl shadow-xl overflow-hidden bg-white">
        
        {/* Mock Browser Header */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-neutral-400 font-mono ml-4 bg-white px-3 py-1 rounded-md border border-neutral-200 flex items-center gap-1 max-w-sm overflow-hidden select-none">
              <Monitor size={10} className="text-neutral-500" />
              <span>https://yourstudiowebsite.com/showcase</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <LayoutTemplate size={12} className="text-[#8a9fa6]" />
            <span className="capitalize font-mono">{layout} Layout View</span>
          </div>
        </div>

        {/* Live Simulation Board */}
        <div className="relative">
          {layout === 'hero' && (
            <div className="relative w-full h-[480px] bg-neutral-950 flex items-center justify-center p-6 sm:p-12 overflow-hidden transition-all duration-300">
              {/* Processed background image */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={imageSrc}
                  alt="Processed View Background"
                  className="w-full h-full object-cover"
                  style={{ filter: filterString }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Adjustments Overlays */}
                <div className="absolute inset-0 pointer-events-none" style={getWarmthOverlayStyle()} />
                <div className="absolute inset-0 pointer-events-none" style={getExposureOverlayStyle()} />
                <div className="absolute inset-0 pointer-events-none" style={getVignetteOverlayStyle()} />
                
                {/* Custom Overlay Opacity specified in website settings */}
                <div className="absolute inset-0 bg-neutral-950 transition-all duration-150" style={{ opacity: settings.overlayOpacity / 100 }} />
              </div>

              {/* Dynamic Content */}
              <div className="relative z-10 max-w-2xl text-center flex flex-col items-center">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl text-white leading-tight font-light mb-4 text-balance ${fontClasses[settings.fontStyle]}`}>
                  {settings.heading}
                </h1>
                <p className="text-neutral-300 text-xs sm:text-sm max-w-md font-sans mb-6 font-light leading-relaxed">
                  {settings.subheading}
                </p>
                <button 
                  className="px-6 py-2.5 rounded-sm text-xs font-semibold tracking-wider uppercase bg-white text-neutral-900 hover:bg-neutral-100 shadow-xl transition-all duration-150"
                  style={{ borderLeft: `3px solid ${settings.accentColor}` }}
                >
                  {settings.ctaText}
                </button>
              </div>
            </div>
          )}

          {layout === 'split' && (
            <div className="w-full py-12 px-6 sm:px-10 bg-neutral-50 text-neutral-900 transition-all duration-300">
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left Side: Photo Frame */}
                <div className="md:col-span-7 relative h-[380px] rounded-2xl overflow-hidden shadow-xl border border-neutral-200">
                  <img
                    src={imageSrc}
                    alt="Processed View Split"
                    className="w-full h-full object-cover"
                    style={{ filter: filterString }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 pointer-events-none" style={getWarmthOverlayStyle()} />
                  <div className="absolute inset-0 pointer-events-none" style={getExposureOverlayStyle()} />
                  <div className="absolute inset-0 pointer-events-none" style={getVignetteOverlayStyle()} />
                </div>

                {/* Right Side: Editorial Info */}
                <div className="md:col-span-5 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="h-0.5 w-6" style={{ backgroundColor: settings.accentColor }} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-400">Design Studio Portfolio</span>
                  </div>
                  <h3 className={`text-2xl text-neutral-900 leading-snug mb-4 ${fontClasses[settings.fontStyle]}`}>
                    {settings.heading}
                  </h3>
                  <p className="text-neutral-600 text-xs leading-relaxed mb-5 font-light">
                    {settings.subheading}
                  </p>
                  
                  {/* Studio Spec Fact Box */}
                  <div className="p-3.5 rounded-lg bg-neutral-100 border border-neutral-200/50 mb-5 text-[10px] font-mono text-neutral-500 space-y-1">
                    <div><strong>Project:</strong> Art Curation & Materials</div>
                    <div><strong>Color Blueprint:</strong> Sage Grass / Linens / Warm Wood</div>
                    <div><strong>Concept Studio:</strong> Beautiful Is Hard Co.</div>
                  </div>

                  <button 
                    className="self-start px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md active:scale-95 duration-700 hover:brightness-105"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    {settings.ctaText}
                  </button>
                </div>
              </div>
            </div>
          )}

          {layout === 'showcase' && (
            <div className="w-full py-12 px-6 bg-neutral-900 text-white transition-all duration-300">
              <div className="max-w-3xl mx-auto rounded-3xl bg-neutral-950/40 p-4 border border-neutral-800/50 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Photo Visual Grid Item */}
                  <div className="md:col-span-8 relative h-[320px] rounded-xl overflow-hidden shadow-lg border border-neutral-800/30">
                    <img
                      src={imageSrc}
                      alt="Processed View Showcase"
                      className="w-full h-full object-cover"
                      style={{ filter: filterString }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 pointer-events-none" style={getWarmthOverlayStyle()} />
                    <div className="absolute inset-0 pointer-events-none" style={getExposureOverlayStyle()} />
                    <div className="absolute inset-0 pointer-events-none" style={getVignetteOverlayStyle()} />
                  </div>

                  {/* Metadata Specification box */}
                  <div className="md:col-span-4 flex flex-col justify-between p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/40">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.accentColor }} />
                        <span className="text-[9px] font-mono tracking-widest text-[#8a9fa6] uppercase font-bold">In Focus</span>
                      </div>
                      <h4 className={`text-lg text-white leading-tight mb-2 ${fontClasses[settings.fontStyle]}`}>
                        {settings.heading.split('.')[0] || 'Studio Mood'}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                        {settings.subheading.substring(0, 95)}...
                      </p>
                    </div>

                    <div className="border-t border-neutral-850 pt-3 mt-3 space-y-1.5 text-[10px] font-mono text-neutral-400">
                      <div className="flex justify-between">
                        <span>Layout Group</span>
                        <span className="text-white">Case Study Board</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accent Ink</span>
                        <span style={{ color: settings.accentColor }}>{settings.accentColor}</span>
                      </div>
                    </div>

                    <button 
                      className="w-full mt-3 py-2 rounded-md text-[10px] font-bold tracking-wider uppercase text-white bg-neutral-800 hover:bg-neutral-750 transition-colors border border-neutral-700/80"
                    >
                      {settings.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Export Drawer */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#8a9fa6]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 font-mono">React Integration Code</span>
            <span className="text-xs text-neutral-500">Copy this pre-packaged snippet to drop into your code</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-xs font-semibold text-neutral-100 hover:text-white transition-all duration-100 hover:scale-[1.02]"
            id="btn-copy-code"
          >
            {copied ? (
              <>
                <Check size={12} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="text-xs font-mono text-neutral-300 max-h-56 overflow-y-auto p-4 bg-neutral-950 rounded-lg border border-neutral-800/80 leading-relaxed scrollbar-thin scrollbar-thumb-neutral-800">
            <code>{getCodeSnippet()}</code>
          </pre>
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none rounded-b-lg" />
        </div>
      </div>
    </div>
  );
};
