import { StageInfo, GradeInfo, SubjectInfo, Lesson, Quiz, CountryInfo, CountryCode, StageType } from '@/types';

// ==========================================
// ARAB COUNTRIES CONFIGURATION
// ==========================================
export const ARAB_COUNTRIES: CountryInfo[] = [
  {
    code: 'eg',
    name: 'جمهورية مصر العربية',
    shortName: 'مصر',
    flag: '🇪🇬',
    academicYear: '2025/2026',
    vision: 'بناء أجيال مبدعة ومتمكنة علمياً تواكب أحدث منظومات التعليم الرقمي وتطوير المناهج لوزارة التربية والتعليم المصرية.',
    mission: 'تقديم شروحات مرئية تفاعلية ومراجعات ليلة الامتحان للشهادة الإعدادية والثانوية العامة وكافة الصفوف بالمنهج المصري.',
    examHighlight: 'امتحانات الثانوية العامة والشهادة الإعدادية',
    examTagline: 'بنك أسئلة ونماذج بوكليت تفاعلية وتدريبات بنك المعرفة المصري مع تصحيح وشرح فوري.',
    demonym: 'المصرية',
    description: 'شروحات المناهج المصرية لجميع المراحل التعليمية',
    activeCurriculumsCount: 12,
  },
  {
    code: 'sa',
    name: 'المملكة العربية السعودية',
    shortName: 'السعودية',
    flag: '🇸🇦',
    academicYear: '1447/1448هـ',
    vision: 'أن نكون المرجع والوجهة التعليمية الأولى في المملكة العربية السعودية مساهمين في تحقيق مستهدفات رؤية السعودية 2030.',
    mission: 'تيسير وتبسيط المفاهيم العلمية المعقدة في المناهج السعودية عبر شروحات مرئية وحلول نموذجية تواكب متطلبات الاختبارات الوطنية.',
    examHighlight: 'اختبارات نافس والتحصيلي والقدرات',
    examTagline: 'اختبر معلوماتك في دروس ومقررات المناهج السعودية، واحصل على تصحيح فوري وشرح الحلول النموذجية.',
    demonym: 'السعودية',
    description: 'شروحات المناهج السعودية لكافة الصفوف والمسارات',
    activeCurriculumsCount: 12,
  },
  {
    code: 'ae',
    name: 'الإمارات العربية المتحدة',
    shortName: 'الإمارات',
    flag: '🇦🇪',
    academicYear: '2025/2026',
    vision: 'دعم مسيرة التعليم المبتكر ومئوية الإمارات 2071 من خلال توفير شروحات رقمية متطورة لكافة المراحل التعليمية.',
    mission: 'تقديم محتوى تعليمي مرئي متميز للمناهج الوزارية ومدارس الإمارات يركز على مهارات التفكير والابتكار.',
    examHighlight: 'اختبارات إمسات (EmSAT) والتقويم الوزاري',
    examTagline: 'تدريبات وبنوك أسئلة تفاعلية تحاكي اختبارات الإمارات القياسية إمسات وتقييمات وزارة التربية والتعليم.',
    demonym: 'الإماراتية',
    description: 'شروحات المنهاج الإماراتي لمختلف الحلقات الدراسية',
    activeCurriculumsCount: 12,
  },
  {
    code: 'kw',
    name: 'دولة الكويت',
    shortName: 'الكويت',
    flag: '🇰🇼',
    academicYear: '2025/2026',
    vision: 'الارتقاء بالمنظومة التعليمية الرقمية ومساندة أبنائنا الطلبة في دولة الكويت للتفوق الأكاديمي الشامل.',
    mission: 'توفير شروحات مبسطة واختبارات تفاعلية ومذكرات مراجعة للمناهج الكويتية للمرحلة الابتدائية والمتوسطة والثانوية.',
    examHighlight: 'امتحانات الفترة ونهاية العام للثانوية العامة',
    examTagline: 'مذكرات واختبارات تدريبية شاملة لنماذج امتحانات وزارة التربية الكويتية مع حلول نموذجية.',
    demonym: 'الكويتية',
    description: 'المناهج الدراسية الكويتية لكافة المراحل',
    activeCurriculumsCount: 12,
  },
  {
    code: 'jo',
    name: 'المملكة الأردنية الهاشمية',
    shortName: 'الأردن',
    flag: '🇯🇴',
    academicYear: '2025/2026',
    vision: 'تمكين الطالب الأردني من الوصول لأعلى درجات التميز في امتحانات الثانوية العامة (التوجيهي) وكافة الصفوف.',
    mission: 'شروحات وافية ومكثفات دراسية للمنهاج الأردني تغطي كافة المواد العلمية والأدبية.',
    examHighlight: 'امتحان شهادة الدراسة الثانوية العامة (التوجيهي)',
    examTagline: 'أسئلة سنوات سابقة وامتحانات تجريبية لشهادة التوجيهي الأردني مع الشرح التفصيلي للحل.',
    demonym: 'الأردنية',
    description: 'شروحات المنهاج الأردني والتوجيهي',
    activeCurriculumsCount: 12,
  },
  {
    code: 'qa',
    name: 'دولة قطر',
    shortName: 'قطر',
    flag: '🇶🇦',
    academicYear: '2025/2026',
    vision: 'مواكبة رؤية قطر الوطنية 2030 في تطوير مخرجات التعليم وتوفير منصة تعليمية رقمية رائدة.',
    mission: 'تيسير المناهج التعليمية لمعايير وزارة التربية والتعليم والتعليم العالي القطرية عبر شروحات نوعية.',
    examHighlight: 'اختبارات نهاية الفصل والشهادة الثانوية العامة',
    examTagline: 'نماذج اختبارات تقييمية مطابقة لمعايير التقييم التربوي الشامل في دولة قطر.',
    demonym: 'القطرية',
    description: 'المناهج القطرية لمختلف المراحل الدراسية',
    activeCurriculumsCount: 12,
  },
  {
    code: 'om',
    name: 'سلطنة عُمان',
    shortName: 'عُمان',
    flag: '🇴🇲',
    academicYear: '2025/2026',
    vision: 'المساهمة في تحقيق أولويات رؤية عُمان 2040 عبر تعزيز التعليم الإلكتروني التفاعلي وجودة التعلم.',
    mission: 'شرح المناهج العمانية لمراحل التعليم الأساسي وما بعد الأساسي واختبارات دبلوم التعليم العام.',
    examHighlight: 'امتحانات دبلوم التعليم العام والتقويم المستمر',
    examTagline: 'اختبارات تدريبية ومراجعات شاملة لشهادة دبلوم التعليم العام لوزارة التربية والتعليم العمانية.',
    demonym: 'العُمانية',
    description: 'مناهج سلطنة عمان والتعليم الأساسي',
    activeCurriculumsCount: 12,
  },
  {
    code: 'general',
    name: 'المنهج العربي الموحد (شامل)',
    shortName: 'عام',
    flag: '🌐',
    academicYear: '2025/2026',
    vision: 'منصة تعليمية عربية موحدة تجمع أفضل الشروحات العلمية لكافة الطلاب في العالم العربي.',
    mission: 'تبسيط العلوم والرياضيات واللغات من خلال أحدث الأساليب البيداغوجية والتقنيات الرقمية.',
    examHighlight: 'الاختبارات الدولية والمهارات التأسيسية',
    examTagline: 'اختبارات تقييمية في العلوم والرياضيات واللغة العربية تغطي المهارات الأساسية لكل المراحل.',
    demonym: 'العربية',
    description: 'محتوى تعليمي شامل لكافة الطلاب في الوطن العربي',
    activeCurriculumsCount: 12,
  },
];

export function getCountryInfo(code: CountryCode = 'eg'): CountryInfo {
  return ARAB_COUNTRIES.find(c => c.code === code) || ARAB_COUNTRIES[0];
}

// ==========================================
// STAGES CONFIGURATION
// ==========================================
export const STAGES: StageInfo[] = [
  {
    id: 'elementary',
    name: 'المرحلة الابتدائية',
    description: 'الصفوف من الأول إلى السادس الابتدائي',
    iconName: 'School',
    color: 'from-amber-500 to-yellow-600',
    gradesCount: 6,
    country: 'sa',
  },
  {
    id: 'middle',
    name: 'المرحلة المتوسطة',
    description: 'الصفوف من الأول إلى الثالث المتوسط',
    iconName: 'BookOpen',
    color: 'from-emerald-600 to-teal-700',
    gradesCount: 3,
    country: 'sa',
  },
  {
    id: 'secondary',
    name: 'المرحلة الثانوية (مسارات)',
    description: 'السنة الأولى المشتركة ومسارات التخصص',
    iconName: 'GraduationCap',
    color: 'from-blue-600 to-indigo-700',
    gradesCount: 3,
    country: 'sa',
  },
  {
    id: 'elementary',
    name: 'المرحلة الابتدائية',
    description: 'الصفوف من الأول إلى السادس الابتدائي • المنهج الجديد',
    iconName: 'School',
    color: 'from-amber-500 to-yellow-600',
    gradesCount: 6,
    country: 'eg',
  },
  {
    id: 'middle',
    name: 'المرحلة الإعدادية',
    description: 'صفوف أولى وتانية وتالتة إعدادي • الشهادة الإعدادية',
    iconName: 'BookOpen',
    color: 'from-emerald-600 to-teal-700',
    gradesCount: 3,
    country: 'eg',
  },
  {
    id: 'secondary',
    name: 'المرحلة الثانوية (الثانوية العامة)',
    description: 'صفوف أولى وتانية وتالتة ثانوي • النظام الجديد',
    iconName: 'GraduationCap',
    color: 'from-blue-600 to-indigo-700',
    gradesCount: 3,
    country: 'eg',
  },
];

export function getStagesForCountry(country: CountryCode = 'eg'): StageInfo[] {
  let list = STAGES.filter(s => s.country === country);
  if (list.length === 0) {
    list = STAGES.filter(s => s.country === 'sa');
  }
  return list;
}

// ==========================================
// GRADES CONFIGURATION
// ==========================================
export const GRADES: GradeInfo[] = [
  { id: 'elem-1', name: 'الصف الأول الابتدائي', stage: 'elementary', gradeNumber: 1, stageNameAr: 'الابتدائي', description: 'تأسيس القراءة والكتابة والرياضيات', iconName: 'Sparkles', country: 'sa' },
  { id: 'elem-2', name: 'الصف الثاني الابتدائي', stage: 'elementary', gradeNumber: 2, stageNameAr: 'الابتدائي', description: 'العمليات الحسابية والعلوم الأساسية', iconName: 'Star', country: 'sa' },
  { id: 'elem-3', name: 'الصف الثالث الابتدائي', stage: 'elementary', gradeNumber: 3, stageNameAr: 'الابتدائي', description: 'توسيع المدارك والقراءة التفاعلية', iconName: 'Compass', country: 'sa' },
  { id: 'elem-4', name: 'الصف الرابع الابتدائي', stage: 'elementary', gradeNumber: 4, stageNameAr: 'الابتدائي', description: 'مناهج العلوم والرياضيات والاجتماعيات', iconName: 'Award', country: 'sa' },
  { id: 'elem-5', name: 'الصف الخامس الابتدائي', stage: 'elementary', gradeNumber: 5, stageNameAr: 'الابتدائي', description: 'الكسور والعمليات المتقدمة', iconName: 'Award', country: 'sa' },
  { id: 'elem-6', name: 'الصف السادس الابتدائي', stage: 'elementary', gradeNumber: 6, stageNameAr: 'الابتدائي', description: 'التحضير للمرحلة المتوسطة ومسابقات الموهوبين', iconName: 'Award', country: 'sa' },

  { id: 'mid-1', name: 'الصف الأول المتوسط', stage: 'middle', gradeNumber: 1, stageNameAr: 'المتوسط', description: 'الجبر والدوال والعلوم العامة', iconName: 'GraduationCap', country: 'sa' },
  { id: 'mid-2', name: 'الصف الثاني المتوسط', stage: 'middle', gradeNumber: 2, stageNameAr: 'المتوسط', description: 'الأعداد النسبية والدولة الأموية وحركة المادة', iconName: 'GraduationCap', country: 'sa' },
  { id: 'mid-3', name: 'الصف الثالث المتوسط', stage: 'middle', gradeNumber: 3, stageNameAr: 'المتوسط', description: 'التحضير للاختبارات الوطنية واختبار نافس', iconName: 'Trophy', country: 'sa' },

  { id: 'sec-1', name: 'السنة الأولى المشتركة', stage: 'secondary', gradeNumber: 1, stageNameAr: 'الثانوي', description: 'مسارات الثانوي المشترك والمواد العامة', iconName: 'Atom', country: 'sa' },
  { id: 'sec-2', name: 'الصف الثاني الثانوي', stage: 'secondary', gradeNumber: 2, stageNameAr: 'الثانوي', description: 'مسار عام، صحة، حاسب، وإدارة أعمال', iconName: 'Cpu', country: 'sa' },
  { id: 'sec-3', name: 'الصف الثالث الثانوي', stage: 'secondary', gradeNumber: 3, stageNameAr: 'الثانوي', description: 'التخرج والتحضير للقدرات والتحصيلي', iconName: 'Sparkles', country: 'sa' },

  { id: 'eg-elem-1', name: 'الصف الأول الابتدائي', stage: 'elementary', gradeNumber: 1, stageNameAr: 'الابتدائي', description: 'المنهج المطور 2.0 واللغة العربية والحساب', iconName: 'Sparkles', country: 'eg' },
  { id: 'eg-elem-2', name: 'الصف الثاني الابتدائي', stage: 'elementary', gradeNumber: 2, stageNameAr: 'الابتدائي', description: 'العمليات الحسابية والقصص القرائية', iconName: 'Star', country: 'eg' },
  { id: 'eg-elem-3', name: 'الصف الثالث الابتدائي', stage: 'elementary', gradeNumber: 3, stageNameAr: 'الابتدائي', description: 'جداول الضرب وأساليب وتراكيب اللغة', iconName: 'Compass', country: 'eg' },
  { id: 'eg-elem-4', name: 'الصف الرابع الابتدائي', stage: 'elementary', gradeNumber: 4, stageNameAr: 'الابتدائي', description: 'الرياضيات والعلوم والدراسات الاجتماعية المطورة', iconName: 'Award', country: 'eg' },
  { id: 'eg-elem-5', name: 'الصف الخامس الابتدائي', stage: 'elementary', gradeNumber: 5, stageNameAr: 'الابتدائي', description: 'الرياضيات والعلوم والدراسات الاجتماعية', iconName: 'Compass', country: 'eg' },
  { id: 'eg-elem-6', name: 'الصف السادس الابتدائي', stage: 'elementary', gradeNumber: 6, stageNameAr: 'الابتدائي', description: 'الشهادة الابتدائية والمفاهيم التأسيسية', iconName: 'Award', country: 'eg' },

  { id: 'eg-mid-1', name: 'الصف الأول الإعدادي', stage: 'middle', gradeNumber: 1, stageNameAr: 'الإعدادي', description: 'الجبر والهندسة، العلوم، الدراسات الاجتماعية', iconName: 'GraduationCap', country: 'eg' },
  { id: 'eg-mid-2', name: 'الصف الثاني الإعدادي', stage: 'middle', gradeNumber: 2, stageNameAr: 'الإعدادي', description: 'الرياضيات والعلوم واللغة العربية', iconName: 'GraduationCap', country: 'eg' },
  { id: 'eg-mid-3', name: 'الصف الثالث الإعدادي (الشهادة الإعدادية)', stage: 'middle', gradeNumber: 3, stageNameAr: 'الإعدادي', description: 'المراجعات النهائية والامتحانات النموذجية', iconName: 'Trophy', country: 'eg' },

  { id: 'eg-sec-1', name: 'الصف الأول الثانوي', stage: 'secondary', gradeNumber: 1, stageNameAr: 'الثانوي', description: 'الفيزياء، الكيمياء، الأحياء، والرياضيات', iconName: 'Atom', country: 'eg' },
  { id: 'eg-sec-2', name: 'الصف الثاني الثانوي', stage: 'secondary', gradeNumber: 2, stageNameAr: 'الثانوي', description: 'الشعبة العلمية والشعبة الأدبية', iconName: 'Cpu', country: 'eg' },
  { id: 'eg-sec-3', name: 'الصف الثالث الثانوي (الثانوية العامة)', stage: 'secondary', gradeNumber: 3, stageNameAr: 'الثانوي', description: 'تجهيزات الثانوية العامة ونماذج الامتحانات الرسمية', iconName: 'Sparkles', country: 'eg' },
];

export function getGradesForCountry(country: CountryCode = 'eg', stage?: StageType) {
  let countryGrades = GRADES.filter(g => g.country === country);
  if (countryGrades.length === 0) {
    countryGrades = GRADES.filter(g => g.country === 'sa');
  }
  if (stage) {
    return countryGrades.filter(g => g.stage === stage);
  }
  return countryGrades;
}

// ==========================================
// SUBJECTS CONFIGURATION
// ==========================================
export const SUBJECTS: SubjectInfo[] = [
  { id: 'math-elem', name: 'الرياضيات', code: 'MATH', stage: 'elementary', grades: [1, 2, 3, 4, 5, 6], color: 'from-blue-600 to-indigo-700', iconName: 'Calculator', description: 'الأعداد، العمليات الحسابية، القياس، وحل المسائل', country: 'sa' },
  { id: 'social-elem', name: 'الدراسات الاجتماعية', code: 'SOC', stage: 'elementary', grades: [4, 5, 6], color: 'from-amber-600 to-yellow-700', iconName: 'Globe2', description: 'الهوية الوطنية، التاريخ، والجغرافيا', country: 'sa' },
  { id: 'science-elem', name: 'العلوم', code: 'SCI', stage: 'elementary', grades: [1, 2, 3, 4, 5, 6], color: 'from-emerald-600 to-teal-700', iconName: 'FlaskConical', description: 'المخلوقات الحية والمادة والطاقة', country: 'sa' },
  { id: 'arabic-elem', name: 'لغتي الجميلة', code: 'ARB', stage: 'elementary', grades: [1, 2, 3, 4, 5, 6], color: 'from-rose-600 to-pink-700', iconName: 'BookA', description: 'القراءة والكتابة وقواعد اللغة العربية', country: 'sa' },

  { id: 'math-mid', name: 'الرياضيات', code: 'MATH', stage: 'middle', grades: [1, 2, 3], color: 'from-blue-600 to-indigo-700', iconName: 'Calculator', description: 'الأعداد النسبية، القوى والأسس، الجبر، والهندسة', country: 'sa' },
  { id: 'social-mid', name: 'الدراسات الاجتماعية', code: 'SOC', stage: 'middle', grades: [1, 2, 3], color: 'from-amber-600 to-yellow-700', iconName: 'Globe2', description: 'التاريخ والجغرافيا والدراسات الاجتماعية', country: 'sa' },
  { id: 'science-mid', name: 'العلوم', code: 'SCI', stage: 'middle', grades: [1, 2, 3], color: 'from-emerald-600 to-teal-700', iconName: 'FlaskConical', description: 'طبيعة المادة، القوى، والحركة', country: 'sa' },
  { id: 'arabic-mid', name: 'لغتي الخالدة', code: 'ARB', stage: 'middle', grades: [1, 2, 3], color: 'from-rose-600 to-pink-700', iconName: 'BookA', description: 'النحو والصرف والبلاغة', country: 'sa' },

  { id: 'physics-sec', name: 'الفيزياء', code: 'PHYS', stage: 'secondary', grades: [1, 2, 3], color: 'from-sky-600 to-blue-800', iconName: 'Atom', description: 'حركة الكواكب والجاذبية، الميكانيكا، والكهرباء', country: 'sa' },
  { id: 'bio-sec', name: 'الأحياء', code: 'BIO', stage: 'secondary', grades: [1, 2, 3], color: 'from-emerald-600 to-green-700', iconName: 'Dna', description: 'خصائص شوكيات الجلد، الحيوانات اللافقارية، والخلية', country: 'sa' },
  { id: 'chem-sec', name: 'الكيمياء', code: 'CHEM', stage: 'secondary', grades: [1, 2, 3], color: 'from-teal-600 to-emerald-800', iconName: 'FlaskConical', description: 'المادة وتغيراتها والحسابات الكيميائية', country: 'sa' },
  { id: 'math-sec', name: 'الرياضيات (مسارات)', code: 'MATH', stage: 'secondary', grades: [1, 2, 3], color: 'from-blue-600 to-indigo-700', iconName: 'Calculator', description: 'الدوال، المصفوفات، والتفاضل والتكامل', country: 'sa' },

  { id: 'eg-math-mid', name: 'الجبر والهندسة', code: 'MATH', stage: 'middle', grades: [1, 2, 3], color: 'from-blue-600 to-indigo-700', iconName: 'Calculator', description: 'الجبر والإحصاء، الهندسة المستوية والتحليلية وحساب المثلثات', country: 'eg' },
  { id: 'eg-science-mid', name: 'العلوم العامة', code: 'SCI', stage: 'middle', grades: [1, 2, 3], color: 'from-emerald-600 to-teal-700', iconName: 'FlaskConical', description: 'المادة وتركيبها، التفاعلات الكيميائية، والوراثة والكون', country: 'eg' },
  { id: 'eg-social-mid', name: 'الدراسات الاجتماعية', code: 'SOC', stage: 'middle', grades: [1, 2, 3], color: 'from-amber-600 to-yellow-700', iconName: 'Globe2', description: 'جغرافيا العالم وتاريخ مصر عبر العصور', country: 'eg' },
  { id: 'eg-arabic-mid', name: 'اللغة العربية والنحو', code: 'ARB', stage: 'middle', grades: [1, 2, 3], color: 'from-rose-600 to-pink-700', iconName: 'BookA', description: 'النصوص والقراءة وقواعد النحو والإعراب', country: 'eg' },
  { id: 'eg-physics-sec', name: 'الفيزياء (ثانوية عامة)', code: 'PHYS', stage: 'secondary', grades: [1, 2, 3], color: 'from-sky-600 to-blue-800', iconName: 'Atom', description: 'التيار الكهربي وقانون أوم، الكهرومغناطيسية، والفيزياء الحديثة', country: 'eg' },
  { id: 'eg-chem-sec', name: 'الكيمياء (ثانوية عامة)', code: 'CHEM', stage: 'secondary', grades: [1, 2, 3], color: 'from-teal-600 to-emerald-800', iconName: 'FlaskConical', description: 'العناصر الانتقالية، التحليل الكيميائي، والاتزان والكيمياء العضوية', country: 'eg' },
  { id: 'eg-bio-sec', name: 'الأحياء (ثانوية عامة)', code: 'BIO', stage: 'secondary', grades: [1, 2, 3], color: 'from-emerald-600 to-green-700', iconName: 'Dna', description: 'الدعامة والحركة، التنسيق الهرموني، التكاثر، والبيولوجيا الجزيئية', country: 'eg' },
];

export function getSubjectsForCountry(country: CountryCode = 'eg', stage?: StageType, gradeNumber?: number) {
  let list = SUBJECTS.filter(s => s.country === country);
  if (list.length === 0) {
    list = SUBJECTS.filter(s => s.country === 'sa');
  }
  if (stage) {
    list = list.filter(s => s.stage === stage);
  }
  if (gradeNumber) {
    list = list.filter(s => s.grades.includes(gradeNumber));
  }
  return list;
}

// ==========================================
// INITIAL LESSONS (Accurately classified from channel videos)
// ==========================================
export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'yt_hHAHtNUyHPM',
    title: 'الدولة الأموية وأبرز خلفائها | الدراسات الاجتماعية ثاني متوسط | الفصل الأول 1448هـ',
    description: 'شرح مبسط لدرس الدولة الأموية وأبرز خلفائها (41–132هـ) في مادة الدراسات الاجتماعية للصف الثاني المتوسط.',
    country: 'sa',
    stage: 'middle',
    gradeNumber: 2,
    subjectId: 'social-mid',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'الدولة الأموية وأبرز خلفائها',
    youtubeId: 'hHAHtNUyHPM',
    youtubeUrl: 'https://www.youtube.com/watch?v=hHAHtNUyHPM',
    thumbnailUrl: 'https://i.ytimg.com/vi/hHAHtNUyHPM/hqdefault.jpg',
    duration: '18:40',
    viewsCount: 1250,
    likesCount: 110,
    createdAt: '2026-08-26T22:17:01Z',
  },
  {
    id: 'yt_LewEczZm3d0',
    title: 'شكل الأرض | الدراسات الاجتماعية أول متوسط | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح مبسط وممتع لدرس شكل الأرض في مادة الدراسات الاجتماعية للصف الأول المتوسط.',
    country: 'sa',
    stage: 'middle',
    gradeNumber: 1,
    subjectId: 'social-mid',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'شكل الأرض',
    youtubeId: 'LewEczZm3d0',
    youtubeUrl: 'https://www.youtube.com/watch?v=LewEczZm3d0',
    thumbnailUrl: 'https://i.ytimg.com/vi/LewEczZm3d0/hqdefault.jpg',
    duration: '14:20',
    viewsCount: 980,
    likesCount: 85,
    createdAt: '2026-08-26T22:08:57Z',
  },
  {
    id: 'yt_1NMuD5zFscc',
    title: 'الهوية الوطنية | الدراسات الاجتماعية رابع ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح مميز لدرس الهوية الوطنية في مادة الدراسات الاجتماعية للصف الرابع الابتدائي.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 4,
    subjectId: 'social-elem',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'الهوية الوطنية',
    youtubeId: '1NMuD5zFscc',
    youtubeUrl: 'https://www.youtube.com/watch?v=1NMuD5zFscc',
    thumbnailUrl: 'https://i.ytimg.com/vi/1NMuD5zFscc/hqdefault.jpg',
    duration: '12:15',
    viewsCount: 1420,
    likesCount: 130,
    createdAt: '2026-08-26T22:04:01Z',
  },
  {
    id: 'yt_GqkYZwyn858',
    title: 'المصطلحات التاريخية | الدراسات الاجتماعية سادس ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح متكامل لدرس المصطلحات التاريخية في مادة الدراسات الاجتماعية للصف السادس الابتدائي.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 6,
    subjectId: 'social-elem',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'المصطلحات التاريخية',
    youtubeId: 'GqkYZwyn858',
    youtubeUrl: 'https://www.youtube.com/watch?v=GqkYZwyn858',
    thumbnailUrl: 'https://i.ytimg.com/vi/GqkYZwyn858/hqdefault.jpg',
    duration: '11:50',
    viewsCount: 890,
    likesCount: 75,
    createdAt: '2026-08-26T21:58:50Z',
  },
  {
    id: 'yt_ouPS7iHOioo',
    title: 'مفهوم التاريخ | الدراسات الاجتماعية سادس ابتدائي | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح درس مفهوم التاريخ في مادة الدراسات الاجتماعية للصف السادس الابتدائي، الفصل الدراسي الأول.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 6,
    subjectId: 'social-elem',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'مفهوم التاريخ',
    youtubeId: 'ouPS7iHOioo',
    youtubeUrl: 'https://www.youtube.com/watch?v=ouPS7iHOioo',
    thumbnailUrl: 'https://i.ytimg.com/vi/ouPS7iHOioo/hqdefault.jpg',
    duration: '13:10',
    viewsCount: 1100,
    likesCount: 92,
    createdAt: '2026-08-26T21:53:52Z',
  },
  {
    id: 'yt_muSwE2f2IyE',
    title: 'مقارنة الأعداد النسبية وترتيبها | رياضيات الصف الثاني المتوسط | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'مقارنة الأعداد النسبية وترتيبها بطريقة سهلة وتدريبات تطبيقية لطلاب الثاني المتوسط.',
    country: 'sa',
    stage: 'middle',
    gradeNumber: 2,
    subjectId: 'math-mid',
    subjectName: 'الرياضيات',
    term: 1,
    unitTitle: 'مقارنة الأعداد النسبية وترتيبها',
    youtubeId: 'muSwE2f2IyE',
    youtubeUrl: 'https://www.youtube.com/watch?v=muSwE2f2IyE',
    thumbnailUrl: 'https://i.ytimg.com/vi/muSwE2f2IyE/hqdefault.jpg',
    duration: '22:15',
    viewsCount: 2100,
    likesCount: 180,
    createdAt: '2026-08-26T21:43:02Z',
  },
  {
    id: 'yt_3_F4JdAFR9o',
    title: 'التصنيف وفق أكثر من خاصية | رياضيات الصف الأول الابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح مبسط للأطفال لدرس التصنيف وفق أكثر من خاصية في مادة الرياضيات للصف الأول الابتدائي.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 1,
    subjectId: 'math-elem',
    subjectName: 'الرياضيات',
    term: 1,
    unitTitle: 'التصنيف وفق أكثر من خاصية',
    youtubeId: '3_F4JdAFR9o',
    youtubeUrl: 'https://www.youtube.com/watch?v=3_F4JdAFR9o',
    thumbnailUrl: 'https://i.ytimg.com/vi/3_F4JdAFR9o/hqdefault.jpg',
    duration: '09:45',
    viewsCount: 760,
    likesCount: 65,
    createdAt: '2026-08-26T21:16:19Z',
  },
  {
    id: 'yt_Zbm42P9eyAY',
    title: 'القوى والأسس | رياضيات الصف الأول المتوسط | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'الدرس الثاني في رياضيات أول متوسط: التعرف على علامات القوى والأسس وحساب القيم الرياضية.',
    country: 'sa',
    stage: 'middle',
    gradeNumber: 1,
    subjectId: 'math-mid',
    subjectName: 'الرياضيات',
    term: 1,
    unitTitle: 'القوى والأسس',
    youtubeId: 'Zbm42P9eyAY',
    youtubeUrl: 'https://www.youtube.com/watch?v=Zbm42P9eyAY',
    thumbnailUrl: 'https://i.ytimg.com/vi/Zbm42P9eyAY/hqdefault.jpg',
    duration: '20:30',
    viewsCount: 1850,
    likesCount: 160,
    createdAt: '2026-08-26T21:01:15Z',
  },
  {
    id: 'yt_JAY8nTvfM3Y',
    title: 'القيمة المنزلية ضمن الملايين | رياضيات رابع ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح القيمة المنزلية ضمن الملايين في مادة الرياضيات للصف الرابع الابتدائي.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 4,
    subjectId: 'math-elem',
    subjectName: 'الرياضيات',
    term: 1,
    unitTitle: 'القيمة المنزلية ضمن الملايين',
    youtubeId: 'JAY8nTvfM3Y',
    youtubeUrl: 'https://www.youtube.com/watch?v=JAY8nTvfM3Y',
    thumbnailUrl: 'https://i.ytimg.com/vi/JAY8nTvfM3Y/hqdefault.jpg',
    duration: '16:40',
    viewsCount: 1320,
    likesCount: 115,
    createdAt: '2026-08-26T20:17:53Z',
  },
  {
    id: 'yt_3FcbGYFT9GY',
    title: 'العوامل الأولية | رياضيات سادس ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح درس العوامل الأولية وطرق التحليل الرياضي للصف السادس الابتدائي.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 6,
    subjectId: 'math-elem',
    subjectName: 'الرياضيات',
    term: 1,
    unitTitle: 'العوامل الأولية',
    youtubeId: '3FcbGYFT9GY',
    youtubeUrl: 'https://www.youtube.com/watch?v=3FcbGYFT9GY',
    thumbnailUrl: 'https://i.ytimg.com/vi/3FcbGYFT9GY/hqdefault.jpg',
    duration: '18:10',
    viewsCount: 1480,
    likesCount: 125,
    createdAt: '2026-08-26T19:44:17Z',
  },
  {
    id: 'yt_ynmTekWC13I',
    title: 'شرح الدراسات الاجتماعية | الصف الرابع الابتدائي | الفصل الأول 1448هـ | الدرس الأول',
    description: 'الدرس الأول في مادة الدراسات الاجتماعية للصف الرابع الابتدائي.',
    country: 'sa',
    stage: 'elementary',
    gradeNumber: 4,
    subjectId: 'social-elem',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'شرح الدراسات الاجتماعية',
    youtubeId: 'ynmTekWC13I',
    youtubeUrl: 'https://www.youtube.com/watch?v=ynmTekWC13I',
    thumbnailUrl: 'https://i.ytimg.com/vi/ynmTekWC13I/hqdefault.jpg',
    duration: '14:50',
    viewsCount: 950,
    likesCount: 80,
    createdAt: '2026-08-25T11:12:55Z',
  },
  {
    id: 'yt_lKUy2pZ1vls',
    title: 'شرح المجموعة الشمسية | الدراسات الاجتماعية الصف الأول المتوسط | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح كواكب المجموعة الشمسية وحركاتها في مادة الدراسات الاجتماعية للأول المتوسط.',
    country: 'sa',
    stage: 'middle',
    gradeNumber: 1,
    subjectId: 'social-mid',
    subjectName: 'الدراسات الاجتماعية',
    term: 1,
    unitTitle: 'شرح المجموعة الشمسية',
    youtubeId: 'lKUy2pZ1vls',
    youtubeUrl: 'https://www.youtube.com/watch?v=lKUy2pZ1vls',
    thumbnailUrl: 'https://i.ytimg.com/vi/lKUy2pZ1vls/hqdefault.jpg',
    duration: '19:20',
    viewsCount: 1180,
    likesCount: 95,
    createdAt: '2026-08-25T11:08:28Z',
  },
  {
    id: 'yt_kugCtC47aZo',
    title: 'شرح حركة الكواكب والجاذبية | فيزياء الصف الثاني الثانوي مسارات | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح قوانين كبلر وحركة الكواكب والجاذبية الكونية في فيزياء الصف الثاني الثانوي مسارات.',
    country: 'sa',
    stage: 'secondary',
    gradeNumber: 2,
    subjectId: 'physics-sec',
    subjectName: 'الفيزياء',
    term: 1,
    unitTitle: 'شرح حركة الكواكب والجاذبية',
    youtubeId: 'kugCtC47aZo',
    youtubeUrl: 'https://www.youtube.com/watch?v=kugCtC47aZo',
    thumbnailUrl: 'https://i.ytimg.com/vi/kugCtC47aZo/hqdefault.jpg',
    duration: '26:15',
    viewsCount: 3100,
    likesCount: 290,
    createdAt: '2026-08-25T10:59:47Z',
  },
  {
    id: 'yt_nSko5mgJXTc',
    title: 'شرح الأعداد النسبية | رياضيات الصف الثاني المتوسط | الفصل الأول 1448هـ | الدرس الأول',
    description: 'الدرس الأول في مادة الرياضيات للصف الثاني المتوسط: مفهوم الأعداد النسبية وكتابتها بالصورة العشرية.',
    country: 'sa',
    stage: 'middle',
    gradeNumber: 2,
    subjectId: 'math-mid',
    subjectName: 'الرياضيات',
    term: 1,
    unitTitle: 'شرح الأعداد النسبية',
    youtubeId: 'nSko5mgJXTc',
    youtubeUrl: 'https://www.youtube.com/watch?v=nSko5mgJXTc',
    thumbnailUrl: 'https://i.ytimg.com/vi/nSko5mgJXTc/hqdefault.jpg',
    duration: '21:00',
    viewsCount: 2400,
    likesCount: 210,
    createdAt: '2026-08-25T09:48:37Z',
  },
  {
    id: 'yt_Oinlpk_k1BU',
    title: 'شرح خصائص شوكيات الجلد | أحياء الصف الثاني الثانوي مسارات | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح بيولوجي مفصل لخصائص شوكيات الجلد وتنوعها لطلاب الصف الثاني الثانوي مسارات.',
    country: 'sa',
    stage: 'secondary',
    gradeNumber: 2,
    subjectId: 'bio-sec',
    subjectName: 'الأحياء',
    term: 1,
    unitTitle: 'شرح خصائص شوكيات الجلد',
    youtubeId: 'Oinlpk_k1BU',
    youtubeUrl: 'https://www.youtube.com/watch?v=Oinlpk_k1BU',
    thumbnailUrl: 'https://i.ytimg.com/vi/Oinlpk_k1BU/hqdefault.jpg',
    duration: '23:45',
    viewsCount: 1650,
    likesCount: 140,
    createdAt: '2026-08-25T09:34:13Z',
  },
];

// ==========================================
// STANDALONE QUIZZES
// ==========================================
export const STANDALONE_QUIZZES: Quiz[] = [];

export const FAQS = [
  {
    question: 'هل منصة الهَدَّاف تغطي كافة المناهج العربية؟',
    answer: 'نعم، تدعم منصة الهَدَّاف المناهج الرسمية في المملكة العربية السعودية، جمهورية مصر العربية، الإمارات، الكويت، الأردن، وكافة الدول العربية.'
  },
  {
    question: 'كيف يتم ربط حسابي بالمنهج الخاص ببلدي؟',
    answer: 'عند إنشاء حسابك على المنصة تختار دولتك ومرحلتك الدراسية، ليتم توجيهك تلقائياً وبشكل مباشر لكافة مقررات ودروس واختبارات بلدك.'
  },
  {
    question: 'هل الشروحات والملخصات مجانية؟',
    answer: 'نعم، تقدم منصة الهَدَّاف كافة شروحات الفيديو والملخصات والاختبارات التفاعلية مجاناً لجميع الطلاب والمعلمين.'
  },
  {
    question: 'كيف يتم إضافة وتعديل المناهج والدروس؟',
    answer: 'يمتلك المشرف صلاحية الوصول للوحة التحكم الشاملة لجميع المناهج العربية لإضافة وتعديل ومزامنة الدروس والاختبارات بمرونة تامة.'
  }
];