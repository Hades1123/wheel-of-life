"use client";
import { useState, useRef } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface Category {
  id: string;
  name: string;
  value: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Sức khỏe", value: 70 },
  { id: "2", name: "Sự nghiệp", value: 60 },
  { id: "3", name: "Tài chính", value: 80 },
  { id: "4", name: "Gia đình", value: 75 },
  { id: "5", name: "Bạn bè", value: 65 },
  { id: "6", name: "Tình yêu", value: 50 },
  { id: "7", name: "Giáo dục", value: 70 },
  { id: "8", name: "Giải trí", value: 80 },
];

const WheelChart = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

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
      const imgWidth = 280;
      const imgHeight = 280;
      const x = (297 - imgWidth) / 2;
      const y = (210 - imgHeight) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Chi tiết các khía cạnh:", 20, 20);
      pdf.setFontSize(12);
      let textY = 35;
      categories.forEach((cat) => {
        pdf.text(`${cat.name}: ${cat.value}/100`, 25, textY);
        textY += 10;
      });
      pdf.save(`wheel-of-life-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Có lỗi khi export PDF!");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: `Khía cạnh ${categories.length + 1}`,
      value: 50,
    };
    setCategories([...categories, newCategory]);
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length <= 3) {
      alert("Phải có ít nhất 3 khía cạnh!");
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleUpdateValue = (id: string, value: number) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, value: Math.max(0, Math.min(100, value)) } : c,
      ),
    );
  };

  const handleUpdateName = (id: string, name: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const chartData = categories.map((c) => ({
    category: c.name,
    value: c.value,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center p-8 min-h-screen">
      {/* Chart Section */}
      <div className="w-full max-w-lg">
        <div ref={chartRef} className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Wheel of Life
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExporting ? (
                  "Đang export..."
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    PNG
                  </>
                )}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExporting ? (
                  "Đang export..."
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    PDF
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="aspect-square">
            <ResponsiveRadar
              data={chartData}
              keys={["value"]}
              indexBy="category"
              maxValue={100}
              margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              curve="linearClosed"
              borderWidth={2}
              borderColor={{ from: "color" }}
              gridLevels={5}
              gridShape="circular"
              gridLabelOffset={20}
              enableDots={true}
              dotSize={8}
              dotColor={{ theme: "background" }}
              dotBorderWidth={2}
              dotBorderColor={{ from: "color" }}
              enableDotLabel={true}
              dotLabel="value"
              dotLabelYOffset={-12}
              colors={{ scheme: "nivo" }}
              fillOpacity={0.3}
              blendMode="multiply"
              animate={true}
              motionConfig="gentle"
              theme={{
                grid: {
                  line: {
                    stroke: "#e5e7eb",
                    strokeWidth: 1,
                  },
                },
                axis: {
                  ticks: {
                    text: {
                      fontSize: 14,
                      fill: "#374151",
                      fontWeight: 500,
                    },
                  },
                },
                dots: {
                  text: {
                    fontSize: 12,
                    fill: "#374151",
                    fontWeight: 600,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Khía cạnh ({categories.length})
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isEditing
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isEditing ? "Xong" : "Chỉnh sửa"}
            </button>
          </div>

          <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-50 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) =>
                        handleUpdateName(category.id, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="flex-1 font-semibold text-gray-700">
                      {category.name}
                    </span>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveCategory(category.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="Xóa khía cạnh"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Điểm số</span>
                    <span className="font-bold text-blue-600">
                      {category.value}/100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={category.value}
                    onChange={(e) =>
                      handleUpdateValue(category.id, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={category.value}
                    onChange={(e) =>
                      handleUpdateValue(
                        category.id,
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {isEditing && (
            <button
              onClick={handleAddCategory}
              className="w-full mt-4 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Thêm khía cạnh mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WheelChart;
