import React from 'react';
import { Filter, X, Printer, FileSpreadsheet } from 'lucide-react';

export default function ExportReportsModal({
  isOpen,
  setIsOpen,
  exportPeriod,
  setExportPeriod,
  exportDepartment,
  setExportDepartment,
  departments = [],
  handleExportPdf,
  handleExportExcel
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden relative z-10 animate-in zoom-in-95 duration-150 border border-zinc-200 shadow-2xl">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <Filter className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-sm font-bold text-zinc-950">
                تصفية وتصدير الكشوفات
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                تحديد المعايير المعتمدة لكشف الرواتب
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق النافذة"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="export-period" className="text-xs font-semibold text-zinc-700 block">
              الفترة الزمنية
            </label>
            <select
              id="export-period"
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value)}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none shadow-2xs transition-all cursor-pointer"
            >
              <option value="current_month">الشهر الحالي (أكتوبر)</option>
              <option value="last_month">الشهر الماضي (سبتمبر)</option>
              <option value="all_time">كافة السجلات التاريخية</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="export-department" className="text-xs font-semibold text-zinc-700 block">
              القسم / الإدارة
            </label>
            <select
              id="export-department"
              value={exportDepartment}
              onChange={(e) => setExportDepartment(e.target.value)}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-lg px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none shadow-2xs transition-all cursor-pointer"
            >
              <option value="all">كافة الأقسام بالشركة</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/70 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              handleExportPdf(exportPeriod, exportDepartment);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>تصدير كشف PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              handleExportExcel(exportPeriod, exportDepartment);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-700" strokeWidth={1.75} />
            <span>InstaPay (Excel)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
