"use client";
import { useState, useRef, useMemo } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface Category {
  id: string;
  name: string;
  icon: string;
  value: number;
  color: string;
}

const COLORS = [
  "#ef4444", // Red - Sức khỏe
  "#f97316", // Orange - Phát triển bản thân
  "#22c55e", // Green - Mối quan hệ
  "#a855f7", // Purple - Tài chính
  "#3b82f6", // Blue - Sự nghiệp
  "#14b8a6", // Teal - Giải trí
  "#fb923c", // Orange - Chia sẻ
  "#374151", // Dark gray - Tâm linh
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Sức khỏe", icon: "❤️", value: 7, color: COLORS[0] },
  { id: "2", name: "Phát triển bản thân", icon: "🧠", value: 5, color: COLORS[1] },
  { id: "3", name: "Mối quan hệ", icon: "👥", value: 6, color: COLORS[2] },
  { id: "4", name: "Tài chính", icon: "💰", value: 5, color: COLORS[3] },
  { id: "5", name: "Sự nghiệp", icon: "💼", value: 5, color: COLORS[4] },
  { id: "6", name: "Giải trí", icon: "🎮", value: 9, color: COLORS[5] },
  { id: "7", name: "Chia sẻ", icon: "🤝", value: 5, color: COLORS[6] },
  { id: "8", name: "Tâm linh", icon: "🧘", value: 4, color: COLORS[7] },
];

const WheelChart = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const averageScore = useMemo(() => {
    const sum = categories.reduce((acc, cat) => acc + cat.value, 0);
    return (sum / categories.length).toFixed(1);
  }, [categories]);

  const handleValueChange = (id: string, value: number) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, value: Math.max(0, Math.min(10, value)) } : c,
      ),
    );
  };

  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `wheel-of-life-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting PNG:", error);
      alert("Có lỗi khi export PNG!");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 200;
      const imgHeight = 200;
      const x = (297 - imgWidth) / 2;
      const y = (210 - imgHeight) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`wheel-of-life-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Có lỗi khi export PDF!");
    } finally {
      setIsExporting(false);
    }
  };

  // Generate wheel segments
  const renderWheel = () => {
    const centerX = 200;
    const centerY = 200;

    const segments = categories.map((category, index) => {
      const startAngle = (index * 45 - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * 45 - 90) * (Math.PI / 180);
      const value = category.value / 10;
      const innerRadius = 80;
      const outerRadius = 170;

      // Background segment (full)
      const x1 = centerX + innerRadius * Math.cos(startAngle);
      const y1 = centerY + innerRadius * Math.sin(startAngle);
      const x2 = centerX + outerRadius * Math.cos(startAngle);
      const y2 = centerY + outerRadius * Math.sin(startAngle);
      const x3 = centerX + outerRadius * Math.cos(endAngle);
      const y3 = centerY + outerRadius * Math.sin(endAngle);
      const x4 = centerX + innerRadius * Math.cos(endAngle);
      const y4 = centerY + innerRadius * Math.sin(endAngle);

      const bgPath = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`;

      // Value segment (filled)
      const valueOuterRadius = innerRadius + (outerRadius - innerRadius) * value;
      const vx1 = centerX + innerRadius * Math.cos(startAngle);
      const vy1 = centerY + innerRadius * Math.sin(startAngle);
      const vx2 = centerX + valueOuterRadius * Math.cos(startAngle);
      const vy2 = centerY + valueOuterRadius * Math.sin(startAngle);
      const vx3 = centerX + valueOuterRadius * Math.cos(endAngle);
      const vy3 = centerY + valueOuterRadius * Math.sin(endAngle);
      const vx4 = centerX + innerRadius * Math.cos(endAngle);
      const vy4 = centerY + innerRadius * Math.sin(endAngle);

      const valuePath = `M ${vx1} ${vy1} L ${vx2} ${vy2} A ${valueOuterRadius} ${valueOuterRadius} 0 0 1 ${vx3} ${vy3} L ${vx4} ${vy4} A ${innerRadius} ${innerRadius} 0 0 0 ${vx1} ${vy1}`;

      // Label position
      const midAngle = (startAngle + endAngle) / 2;
      const labelRadius = outerRadius + 35;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      // Number position
      const numberRadius = outerRadius + 18;
      const numberX = centerX + numberRadius * Math.cos(midAngle);
      const numberY = centerY + numberRadius * Math.sin(midAngle);

      return (
        <g key={category.id}>
          {/* Background segment */}
          <path d={bgPath} fill={category.color} fillOpacity="0.2" />
          {/* Value segment */}
          <path d={valuePath} fill={category.color} />
          {/* Number circle */}
          <circle cx={numberX} cy={numberY} r="12" fill={category.color} />
          <text
            x={numberX}
            y={numberY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            {String(index + 1).padStart(2, "0")}
          </text>
          {/* Label */}
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#374151"
            fontSize="14"
            fontWeight="500"
          >
            {category.icon} {category.name}
          </text>
        </g>
      );
    });

    return segments;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-center justify-center p-8 min-h-screen bg-gray-50">
      {/* Wheel Section */}
      <div className="w-full max-w-2xl">
        <div ref={chartRef} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Wheel of Life</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExporting ? "..." : "📷 PNG"}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExporting ? "..." : "📄 PDF"}
              </button>
            </div>
          </div>

          {/* SVG Wheel */}
          <svg viewBox="0 0 400 400" className="w-full aspect-square">
            {/* Wheel segments */}
            {renderWheel()}
            {/* Center circle */}
            <circle cx="200" cy="200" r="60" fill="white" stroke="#e5e7eb" strokeWidth="2" />
            {/* Average score */}
            <text x="200" y="192" textAnchor="middle" fill="#374151" fontSize="14" fontWeight="500">
              Điểm TB
            </text>
            <text x="200" y="215" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="bold">
              {averageScore}
            </text>
          </svg>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Điều chỉnh giá trị
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="bg-gray-50 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  {/* Number circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: category.color }}
                  >
                    {index + 1}
                  </div>
                  {/* Icon and name */}
                  <span className="flex-1 font-semibold text-gray-700">
                    {category.icon} {category.name}
                  </span>
                  {/* Value */}
                  <span
                    className="font-bold text-lg w-8 text-center"
                    style={{ color: category.color }}
                  >
                    {category.value}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={category.value}
                  onChange={(e) =>
                    handleValueChange(category.id, parseInt(e.target.value))
                  }
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${(category.value / 10) * 100}%, #e5e7eb ${(category.value / 10) * 100}%, #e5e7eb 100%)`,
                    accentColor: category.color,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelChart;
