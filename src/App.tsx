import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Download, 
  Undo, 
  Layers, 
  Layout, 
  Copy, 
  Check, 
  Info, 
  Palette, 
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  Settings,
  Type,
  MousePointer,
  HelpCircle,
  Code
} from 'lucide-react';

import { ImageAdjustments, LayoutType, WebsiteSettings } from './types';
import { PHOTO_PRESETS, INITIAL_ADJUSTMENTS, INITIAL_WEBSITE_SETTINGS } from './presets';
import { SplitSlider } from './components/SplitSlider';
import { WebsiteMockup } from './components/WebsiteMockup';

export default function App() {
  // Preset and Adjustments State
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(INITIAL_ADJUSTMENTS);
  const [activePreset, setActivePreset] = useState<string>('original');
  const [zoom, setZoom] = useState<number>(100);
  
  // Custom Material Color Palette Swatches (inspired by the designer's scene)
  const [extractedPalette] = useState([
    { name: 'Sage Olive', hex: '#8a9fa6', description: 'Muted workspace slate' },
    { name: 'Warm Terrazzo', hex: '#c66a59', description: 'Terracotta sketch ink' },
    { name: 'Soft Linen', hex: '#dfcaa7', description: 'Raw canvas texture' },
    { name: 'Moss Shadow', hex: '#4e5c50', description: 'Botanic deep green' },
    { name: 'Matte Charcoal', hex: '#282a2a', description: 'High contrast paint frame' },
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Layout and Workspace mode state
  const [activeTab, setActiveTab] = useState<'editor' | 'mockup'>('editor');
  const [selectedMockup, setSelectedMockup] = useState<LayoutType>('hero');
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(INITIAL_WEBSITE_SETTINGS);

  // High quality Unsplash samples representation
  const [sampleImages] = useState([
    {
      id: 'materials_green',
      name: 'Curated Materials Flat-lay',
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
      desc: 'Hands arranging slate tiles, stone, and green fabrics'
    },
    {
      id: 'designer_sketch',
      name: 'Interior Architecture Desk',
      url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=1200',
      desc: 'Bespoke design drafts, ceramic samples, and plans'
    },
    {
      id: 'bright_atelier',
      name: 'Bright Creative Workspace',
      url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=1200',
      desc: 'Sunny, minimalist studio atmosphere next to drafting materials'
    }
  ]);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(sampleImages[0].url);
  
  // Custom File upload trigger elements refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // UI state for showing download progress or code generation confirmation
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showInspirationalTip, setShowInspirationalTip] = useState<boolean>(true);

  // Apply a specific preset
  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const selected = PHOTO_PRESETS.find(p => p.id === presetId);
    if (selected) {
      setAdjustments({
        ...INITIAL_ADJUSTMENTS,
        ...selected.adjustments,
      });
    }
  };

  // Adjust custom single slider parameter
  const handleSliderChange = (param: keyof ImageAdjustments, value: number) => {
    setActivePreset('custom');
    setAdjustments(prev => ({
      ...prev,
      [param]: value,
    }));
  };

  // Reset all values back to normal
  const handleResetAdjustments = () => {
    setAdjustments(INITIAL_ADJUSTMENTS);
    setActivePreset('original');
    setZoom(100);
  };

  // Drag and Drop Files handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please drop or upload an image file (PNG, JPG, WEBP).');
      return;
    }
    
    // File reading to base64 so CORS doesn't taint canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setCurrentImageSrc(event.target.result);
        setUploadError(null);
        // Reset corrections on new image upload
        applyPreset('original');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Hex color clipboard utility, also sets layout accent color
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setWebsiteSettings(prev => ({ ...prev, accentColor: hex }));
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // HTML5 Image processing trigger function (preserves quality)
  const downloadTouchedUpImage = () => {
    setDownloading(true);
    
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = currentImageSrc;
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setDownloading(false);
        return;
      }

      // Configure high resolution scale match
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Apply standard filters
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur / 2}px)`;
      ctx.drawImage(image, 0, 0);

      // Apply manual composite exposure overlay
      if (adjustments.exposure !== 100) {
        const isLighten = adjustments.exposure > 100;
        ctx.save();
        ctx.globalCompositeOperation = isLighten ? 'screen' : 'multiply';
        ctx.fillStyle = isLighten ? '#ffffff' : '#000000';
        ctx.globalAlpha = Math.abs(adjustments.exposure - 100) / 200;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Apply color temp warmth overlay
      if (adjustments.warmth !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = adjustments.warmth > 0 ? '#ff8c00' : '#00bfff';
        ctx.globalAlpha = Math.abs(adjustments.warmth) / 250;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Apply artistic vignette overlay
      if (adjustments.vignette > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.15,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.72
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, `rgba(0, 0, 0, ${adjustments.vignette / 120})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      try {
        const link = document.createElement('a');
        link.download = 'studio_pop_touched_up.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("CORS tainted canvas restricted downloading directly. Opening in new tab instead.", err);
        // Fail gracefully by rendering a link or offering fallback
        alert("Due to security policy, direct download is blocked on external sample images. Simply take a screenshot, OR upload your own photo locally to download the high-res file flawlessly!");
      } finally {
        setDownloading(false);
      }
    };

    image.onerror = () => {
      setDownloading(false);
      alert("Error processing the image asset for download.");
    };
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased">
      {/* Upper Navigation Bar */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-[#8a9fa6] to-neutral-800 rounded-lg text-neutral-900 shadow-inner">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight uppercase font-sans">STUDIO POP</h1>
                <span className="text-[10px] bg-neutral-850 px-2 py-0.5 rounded text-[#8a9fa6] font-mono select-none">v1.2</span>
              </div>
              <p className="text-xs text-neutral-400">Atmospheric image customizer & responsive website blueprint compiler</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex rounded-lg bg-neutral-900 p-1 border border-neutral-800 text-xs w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all duration-150 ${activeTab === 'editor' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                id="tab-editor"
              >
                <Sliders size={13} />
                <span>Interactive Photo Lab</span>
              </button>
              <button
                onClick={() => setActiveTab('mockup')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all duration-150 ${activeTab === 'mockup' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                id="tab-mockup"
              >
                <Layout size={13} />
                <span>Live Website Simulator</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand Sidebar Workspace Controls (Adjustments, Presets, Palette) (4 cols of 12) */}
        <section className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Section A: Upload / Drop Zone (Let users touch up their EXACT attached photo or anything else!) */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-150 ${dragActive ? 'border-[#8a9fa6] bg-[#8a9fa6]/5 scale-[0.99]' : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-700/80'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-2.5 rounded-full bg-neutral-800 text-neutral-400">
                <Upload size={18} className="text-[#8a9fa6]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">Drag & drop your custom image to touch up</p>
                <p className="text-[10px] text-neutral-400 mt-1">Accepts PNG, JPG (e.g. your interior workspace photo) or click to browse</p>
              </div>
            </div>
            {uploadError && (
              <p className="text-xs text-red-400 mt-2 font-medium">{uploadError}</p>
            )}
          </div>

          {/* Tab 1: Editor Sidebar Workspace Controllers */}
          {activeTab === 'editor' ? (
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-850 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9fa6]">Artistic Presets</h3>
                <button
                  onClick={handleResetAdjustments}
                  className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-850 transition-colors"
                  title="Reset adjustments"
                >
                  <RefreshCw size={12} />
                </button>
              </div>

              {/* Artistic Presets Selection Cards */}
              <div className="grid grid-cols-2 gap-2" id="artistic-presets">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all duration-100 ${activePreset === preset.id ? 'border-white bg-white/5 text-white' : 'border-neutral-800/80 bg-neutral-950/40 text-neutral-400 hover:border-neutral-750 hover:bg-neutral-850/60 hover:text-neutral-200'}`}
                  >
                    <span className="text-xs font-semibold tracking-wide block">{preset.name}</span>
                    <span className="text-[9px] text-neutral-500 font-light leading-tight block truncate w-full">{preset.description}</span>
                  </button>
                ))}
              </div>

              <hr className="border-neutral-850/60" />

              {/* Fine Grained Tonal Correction sliders */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9fa6]">Tonal Enhancements</h3>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Brightness</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={adjustments.brightness}
                    onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Contrast</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={adjustments.contrast}
                    onChange={(e) => handleSliderChange('contrast', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Exposure */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Exposure Overlay</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.exposure}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={adjustments.exposure}
                    onChange={(e) => handleSliderChange('exposure', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation / Grayscale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Saturation</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="170"
                    value={adjustments.saturation}
                    onChange={(e) => handleSliderChange('saturation', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Warmth / Color Temp (Cast tinting overlay) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Color Temperature</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.warmth > 0 ? `+${adjustments.warmth} Warm` : adjustments.warmth < 0 ? `${adjustments.warmth} Cool` : 'Neutral'}</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={adjustments.warmth}
                    onChange={(e) => handleSliderChange('warmth', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Vignette */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Vignette Shadow</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adjustments.vignette}
                    onChange={(e) => handleSliderChange('vignette', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Soft Focus blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">Soft Dreamy Focus</span>
                    <span className="font-mono text-neutral-500 text-[10px]">{adjustments.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={adjustments.blur}
                    onChange={(e) => handleSliderChange('blur', Number(e.target.value))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Landing Page Customize Form */
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-850 space-y-5 shadow-xl">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-[#8a9fa6]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9fa6]">Landing Page Settings</h3>
              </div>

              {/* Layout select standard switcher */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 label-heading">Website Blueprint Layout</label>
                <div className="grid grid-cols-3 gap-1 bg-neutral-950 rounded-lg p-1 border border-neutral-800 text-xs">
                  <button
                    onClick={() => setSelectedMockup('hero')}
                    className={`px-2 py-1.5 rounded font-medium ${selectedMockup === 'hero' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Hero Banner
                  </button>
                  <button
                    onClick={() => setSelectedMockup('split')}
                    className={`px-2 py-1.5 rounded font-medium ${selectedMockup === 'split' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Split Split
                  </button>
                  <button
                    onClick={() => setSelectedMockup('showcase')}
                    className={`px-2 py-1.5 rounded font-medium ${selectedMockup === 'showcase' ? 'bg-neutral-850 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Bento Card
                  </button>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Heading Wording</label>
                <input
                  type="text"
                  value={websiteSettings.heading}
                  onChange={(e) => setWebsiteSettings(prev => ({ ...prev, heading: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8a9fa6] transition-colors"
                  placeholder="Heading text..."
                />
              </div>

              {/* Subheading text */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Subheading Description</label>
                <textarea
                  rows={3}
                  value={websiteSettings.subheading}
                  onChange={(e) => setWebsiteSettings(prev => ({ ...prev, subheading: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8a9fa6] transition-colors resize-none leading-relaxed"
                  placeholder="Subheading text..."
                />
              </div>

              {/* Button text */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Call-to-Action Blueprint</label>
                <input
                  type="text"
                  value={websiteSettings.ctaText}
                  onChange={(e) => setWebsiteSettings(prev => ({ ...prev, ctaText: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8a9fa6] transition-colors"
                />
              </div>

              {/* Typography Font pairing selectors */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Type size={10} className="text-[#8a9fa6]" />
                  <span>Typography Vibe</span>
                </label>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <button
                    onClick={() => setWebsiteSettings(prev => ({ ...prev, fontStyle: 'editorial' }))}
                    className={`p-2 rounded text-left border flex items-center justify-between ${websiteSettings.fontStyle === 'editorial' ? 'border-[#8a9fa6] bg-[#8a9fa6]/5 text-white' : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-850 text-neutral-400'}`}
                  >
                    <span className="font-serif">Playfair (Luxury Editorial)</span>
                    <span className="text-[9px] font-mono opacity-55">Serif</span>
                  </button>
                  <button
                    onClick={() => setWebsiteSettings(prev => ({ ...prev, fontStyle: 'sans' }))}
                    className={`p-2 rounded text-left border flex items-center justify-between ${websiteSettings.fontStyle === 'sans' ? 'border-[#8a9fa6] bg-[#8a9fa6]/5 text-white' : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-850 text-neutral-400'}`}
                  >
                    <span className="font-sans">Space Grotesk (Architectural Sans)</span>
                    <span className="text-[9px] font-mono opacity-55">Sans</span>
                  </button>
                  <button
                    onClick={() => setWebsiteSettings(prev => ({ ...prev, fontStyle: 'mono' }))}
                    className={`p-2 rounded text-left border flex items-center justify-between ${websiteSettings.fontStyle === 'mono' ? 'border-[#8a9fa6] bg-[#8a9fa6]/5 text-white' : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-850 text-neutral-400'}`}
                  >
                    <span className="font-mono">JetBrains Mono (Draftsman Tech)</span>
                    <span className="text-[9px] font-mono opacity-55">Mono</span>
                  </button>
                </div>
              </div>

              {/* Overlay shading control */}
              {selectedMockup === 'hero' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-400">
                    <span>Dark Tint Shadow Overlay</span>
                    <span className="font-mono text-[#8a9fa6]">{websiteSettings.overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="85"
                    value={websiteSettings.overlayOpacity}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, overlayOpacity: Number(e.target.value) }))}
                    className="w-full accent-[#8a9fa6] h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Section C: Extracted Material Swatches - Dual Purpose: Info and Accent colors (4 cols) */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-850 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-[#8a9fa6]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9fa6]">Material Swatch Extractor</h3>
            </div>
            
            <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
              Identified moodboard values extracted from the artist's canvas. Click a swatch color to copy it to clipboard <strong className="text-neutral-300">and lock it as your landing page's main theme accent!</strong>
            </p>

            <div className="space-y-2">
              {extractedPalette.map((swatch, i) => (
                <button
                  key={i}
                  onClick={() => handleCopyHex(swatch.hex)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl bg-neutral-950 hover:bg-neutral-850/40 border border-neutral-800 text-left transition-all group ${websiteSettings.accentColor === swatch.hex ? 'border-[#8a9fa6]' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-8 h-8 rounded-lg shadow-inner block shrink-0 border border-neutral-800/80 group-hover:scale-105 transition-transform" 
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">{swatch.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono tracking-wider">{swatch.hex}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-neutral-500 font-sans italic opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                      {swatch.description}
                    </span>
                    {copiedHex === swatch.hex ? (
                      <span className="p-1 rounded bg-green-950 text-green-400 text-[10px] font-semibold border border-green-800 px-1.5">Copied</span>
                    ) : (
                      <span className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white">
                        <Copy size={11} />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Hand Workspace Viewboard Content (8 cols of 12) */}
        <section className="col-span-1 lg:col-span-8 space-y-6">
          
          {activeTab === 'editor' ? (
            /* TAB 1 CONTENT: Photo Lab Split Comparison stage */
            <div className="space-y-6">
              
              {/* Photo View Box */}
              <div className="relative">
                <SplitSlider
                  imageSrc={currentImageSrc}
                  adjustments={adjustments}
                  zoom={zoom}
                  className="h-[460px] sm:h-[520px] shadow-2xl"
                />
              </div>

              {/* Viewboard Control Bar Below Slider */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* 1. Zoom Slider Controller */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="text-xs text-neutral-400 font-mono">Zoom</span>
                  <button 
                    onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                    className="p-1.5 rounded bg-neutral-950 border border-neutral-850 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer select-none"
                  >
                    <Minimize2 size={11} />
                  </button>
                  <input
                    type="range"
                    min="50"
                    max="220"
                    step="5"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="accent-[#8a9fa6] h-1 w-28 bg-neutral-850 rounded"
                  />
                  <button 
                    onClick={() => setZoom(prev => Math.min(220, prev + 25))}
                    className="p-1.5 rounded bg-neutral-950 border border-neutral-850 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer select-none"
                  >
                    <Maximize2 size={11} />
                  </button>
                  <span className="text-xs font-mono text-neutral-500 w-12 text-right">{zoom}%</span>
                </div>

                {/* 2. Photo Utilities / Direct Download */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={handleResetAdjustments}
                    disabled={activePreset === 'original' && adjustments === INITIAL_ADJUSTMENTS}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-850 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reset Corrections
                  </button>
                  <button
                    onClick={downloadTouchedUpImage}
                    disabled={downloading}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-100 flex items-center gap-1.5 transition-all duration-100 active:scale-95 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Download size={13} className={downloading ? 'animate-bounce' : ''} />
                    <span>{downloading ? 'Processing Image...' : 'Export Touched-up Photo'}</span>
                  </button>
                </div>
              </div>

              {/* Sample Library Switcher (to test design concepts) */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-4">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-[#8a9fa6]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a9fa6]">Sample Asset Library</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sampleImages.map((samp) => (
                    <button
                      key={samp.id}
                      onClick={() => {
                        setCurrentImageSrc(samp.url);
                        // Make adjustments pop with beautiful styles
                        applyPreset('editorial_sage');
                      }}
                      className={`relative rounded-xl overflow-hidden text-left h-24 border cursor-pointer group transition-all duration-150 ${currentImageSrc === samp.url ? 'border-[#8a9fa6] ring-1 ring-[#8a9fa6]' : 'border-neutral-800 hover:border-neutral-700'}`}
                    >
                      <img
                        src={samp.url}
                        alt={samp.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-neutral-950/70 p-3 flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-white block truncate">{samp.name}</span>
                        <span className="text-[8px] text-neutral-400 font-light block truncate leading-tight mt-0.5">{samp.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspirational tip banner about their "Beautiful is Hard" painting */}
              {showInspirationalTip && (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-850/80 text-neutral-300 relative overflow-hidden flex items-start gap-3">
                  <div className="p-2 rounded bg-[#8a9fa6]/10 text-[#8a9fa6] shrink-0 mt-0.5">
                    <Info size={14} />
                  </div>
                  <div className="text-xs space-y-1 pr-6">
                    <strong className="text-neutral-100 font-semibold leading-relaxed block">Artisan Note: "Beautiful is Hard"</strong>
                    <p className="text-neutral-400 font-light leading-relaxed">
                      We've extracted a dedicated editorial layout inspired by the original scene. Use the <strong className="text-neutral-300">"Sage Editorial"</strong> preset or push the <strong className="text-neutral-300">Vignette</strong> and <strong className="text-neutral-300">Color Temp</strong> sliders to perfectly highlight the rustic details of sample tiles and wooden textures. Switch tabs to the <strong className="text-neutral-300">Live Website Simulator</strong> once you're ready to see how it performs on active design structures!
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowInspirationalTip(false)}
                    className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300 text-xs"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2 CONTENT: Layout Simulator page with Live Mockups (8 cols of 12) */
            <div className="space-y-6">
              
              {/* Dynamic Interactive website simulation block */}
              <WebsiteMockup
                imageSrc={currentImageSrc}
                adjustments={adjustments}
                settings={websiteSettings}
                layout={selectedMockup}
              />

              {/* Quick instructions guide box */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-850/70 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-400 font-light leading-relaxed">
                <div>
                  <h4 className="font-semibold text-neutral-200 flex items-center gap-1.5 mb-2 uppercase tracking-wide text-[10px]">
                    <MousePointer size={12} className="text-[#8a9fa6]" />
                    <span>Layout Simulation Strategy</span>
                  </h4>
                  <p>
                    Adjust headings and CTA texts in the Left Sidebar to test copy variations in real-time. By utilizing CSS-level filters inside the frame, layout updates execute at 60 frames per second without latency.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-200 flex items-center gap-1.5 mb-2 uppercase tracking-wide text-[10px]">
                    <Code size={12} className="text-[#8a9fa6]" />
                    <span>Clean Code Delivery</span>
                  </h4>
                  <p>
                    The code generator dynamically parses your modifications (brightness ratios, temperature overlays, vignetting matrices, custom font weights) and builds optimized JSX + Tailwind code blocks ready to be copy-pasted directly into any responsive project structure.
                  </p>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* Modern Compact Site Footer */}
      <footer className="border-t border-neutral-900 select-none py-6 mt-12 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3 font-mono">
          <span>&copy; {new Date().getFullYear()} Studio Pop Image Refiner. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Layouts: 100% Responsive Grid</span>
            <span className="text-[#8a9fa6]">•</span>
            <span>Accents: Custom Material Swatch Matching</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
