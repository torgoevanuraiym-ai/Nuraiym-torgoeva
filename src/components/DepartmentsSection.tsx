import React from 'react';
import { DepartmentId } from '../types';
import { Video, CalendarCheck, Palette, FileText, Share2, ArrowRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface DepartmentsSectionProps {
  onSelectDepartment: (deptId: DepartmentId) => void;
  lang: Language;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  onSelectDepartment,
  lang,
}) => {
  const t = TRANSLATIONS[lang].departments;

  const getIcon = (id: string) => {
    switch (id) {
      case 'media_smm':
        return <Video className="w-5 h-5 text-emerald-600" />;
      case 'event_mgmt':
        return <CalendarCheck className="w-5 h-5 text-emerald-600" />;
      case 'art_culture':
        return <Palette className="w-5 h-5 text-emerald-600" />;
      case 'projects_grants':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'pr_outreach':
        return <Share2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Video className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <section id="departments" className="py-16 sm:py-24 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-700 uppercase mb-2">
            {t.sectionNum}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 font-display tracking-tight text-balance">
            {t.heading}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            {t.subheading}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.items.map((dept, idx) => (
            <div
              key={dept.id}
              className={`bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                idx === 0 ? 'lg:col-span-2 bg-gradient-to-br from-white to-emerald-50/40' : ''
              }`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    {getIcon(dept.id)}
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                    {dept.quota}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-display group-hover:text-emerald-700 transition-colors">
                  {dept.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {dept.fullDesc}
                </p>

                {/* Positions list */}
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    {t.mainRoles}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.roles.map((role) => (
                      <span
                        key={role}
                        className="text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    {t.skillsNeeded}
                  </div>
                  <div className="text-xs text-stone-500">
                    {dept.skills.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-stone-100">
                <button
                  onClick={() => onSelectDepartment(dept.id as DepartmentId)}
                  className="w-full inline-flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 py-2 group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>{t.applyToDept}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
