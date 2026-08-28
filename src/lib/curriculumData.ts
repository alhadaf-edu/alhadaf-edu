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

export function getSubjectsForCountry(country: CountryCode = 'eg', stage?: StageType) {
  let list = SUBJECTS.filter(s => s.country === country);
  if (list.length === 0) {
    list = SUBJECTS.filter(s => s.country === 'sa');
  }
  if (stage) {
    return list.filter(s => s.stage === stage);
  }
  return list;
}

// ==========================================
// INITIAL LESSONS (Empty list for manual additions)
// ==========================================
export const INITIAL_LESSONS: Lesson[] = [];

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