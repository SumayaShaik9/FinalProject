
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;
-- =====================================
-- 1. USERS
-- =====================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    language_code TEXT DEFAULT 'en',
    github_id TEXT UNIQUE,
    role TEXT CHECK(role IN ('user','admin')) DEFAULT 'user',
    status TEXT CHECK(status IN ('active','suspended','deleted')) DEFAULT 'active',
    description TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- =====================================
-- 10. LANGUAGES
-- =====================================
DROP TABLE IF EXISTS languages;
CREATE TABLE languages (
    language_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 2. CONTEXTS
-- =====================================
DROP TABLE IF EXISTS contexts;
CREATE TABLE contexts (
    context_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Context translations
DROP TABLE IF EXISTS context_translations;
CREATE TABLE context_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    context_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,           -- FK to languages.code
    name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(context_id) REFERENCES contexts(context_id),
    FOREIGN KEY(language_code) REFERENCES languages(code),
    UNIQUE(context_id, language_code)
);  
-- =====================================
-- 3. IDENTITIES
-- =====================================
DROP TABLE IF EXISTS identities;
CREATE TABLE identities (
    identity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_photo TEXT,
    visibility TEXT CHECK(visibility IN ('public','private','admin-only')) DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- Identity structured names (cultural naming)
DROP TABLE IF EXISTS identity_names;
CREATE TABLE identity_names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identity_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('given', 'family', 'patronymic', 'mononym')),
    value TEXT NOT NULL,
    order_index INTEGER,
    FOREIGN KEY(identity_id) REFERENCES identities(identity_id)
);

-- Identity translations (multi-language display_name, nickname, legal_name, gender_identity)
DROP TABLE IF EXISTS identity_translations;
CREATE TABLE identity_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identity_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,           -- FK to languages.code
    display_name TEXT,
    legal_name TEXT,
    nickname TEXT,
    gender_identity TEXT,
    FOREIGN KEY(identity_id) REFERENCES identities(identity_id),
    FOREIGN KEY(language_code) REFERENCES languages(code),
    UNIQUE(identity_id, language_code)
);

-- =====================================
-- 4. IDENTITY_CONTEXTS
-- =====================================
DROP TABLE IF EXISTS identity_contexts;
CREATE TABLE identity_contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identity_id INTEGER NOT NULL,
    context_id INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(identity_id) REFERENCES identities(identity_id),
    FOREIGN KEY(context_id) REFERENCES contexts(context_id),
    UNIQUE(identity_id, context_id)
);

-- =====================================
-- 5. PROFILE_METADATA
-- =====================================
DROP TABLE IF EXISTS profile_metadata;
CREATE TABLE profile_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    context_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(context_id) REFERENCES contexts(context_id)
);

-- Profile metadata translations
DROP TABLE IF EXISTS profile_metadata_translations;
CREATE TABLE profile_metadata_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_metadata_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,           -- FK to languages.code
    bio TEXT,
    location TEXT,
    organization TEXT,
    website TEXT,
    FOREIGN KEY(profile_metadata_id) REFERENCES profile_metadata(id),
    FOREIGN KEY(language_code) REFERENCES languages(code),
    UNIQUE(profile_metadata_id, language_code)
);

-- =====================================
-- 6. SOCIAL_LINKS
-- =====================================
DROP TABLE IF EXISTS social_links;
CREATE TABLE social_links (
    link_id INTEGER PRIMARY KEY AUTOINCREMENT,
    identity_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY(identity_id) REFERENCES identities(identity_id)
);
-- Usually no translations needed

-- =====================================
-- 7. TAGS & USER_TAGS
-- =====================================
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Tag translations
DROP TABLE IF EXISTS tag_translations;
CREATE TABLE tag_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,           -- FK to languages.code
    name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(tag_id) REFERENCES tags(tag_id),
    FOREIGN KEY(language_code) REFERENCES languages(code),
    UNIQUE(tag_id, language_code)
);

DROP TABLE IF EXISTS user_tags;
CREATE TABLE user_tags (
    user_tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(tag_id) REFERENCES tags(tag_id),
    UNIQUE(user_id, tag_id)
);

-- =====================================
-- 8. AUDIT_LOGS
-- =====================================
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    context_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(target_user_id) REFERENCES users(user_id),
    FOREIGN KEY(context_id) REFERENCES contexts(context_id)
);
-- No translations needed

-- =====================================
-- 9. SESSIONS / TOKENS
-- =====================================
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
-- No translations needed

-- =====================================
-- 11. SYSTEM TRANSLATIONS
-- =====================================
DROP TABLE IF EXISTS system_translations;
CREATE TABLE system_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,         
    entity_name TEXT NOT NULL,        
    language_code TEXT NOT NULL,      
    translation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(language_code) REFERENCES languages(code),
    UNIQUE(group_name, entity_name, language_code)
);


INSERT INTO contexts (name, description, icon) VALUES
('Work', 'Professional or job-related identity', 'work'),
('School', 'Educational identity', 'school'),
('Gaming', 'Video game or online gaming identity', 'sports_esports'),
('Religious', 'Faith or spiritual community identity', 'church'),
('Family', 'Family-related identity', 'family_restroom'),
('Friends', 'Social identity with friends', 'groups'),
('Community', 'Neighborhood or civic group', 'diversity_3'),
('Sports', 'Athletic or fitness-related identity', 'sports_soccer'),
('Volunteering', 'Charity and service groups', 'volunteer_activism'),
('Health', 'Medical or wellness identity', 'health_and_safety'),
('Travel', 'Travel-related identity', 'travel_explore'),
('Music', 'Musician, band, or music lover identity', 'music_note'),
('Art', 'Artist or art-related identity', 'palette'),
('Online', 'General internet persona', 'public'),
('Professional', 'Career/professional context', 'business_center'),
('Hobby', 'Hobby or leisure identity', 'interests'),
('Personal', 'Private/personal identity', 'person'),
('Spiritual', 'Non-religious spirituality', 'self_improvement'),
('Study', 'Learning/academic identity', 'menu_book'),
('Other', 'Any other context not listed', 'more_horiz');


INSERT INTO languages (name, code) VALUES
('Mandarin Chinese', 'zh'),
('Spanish', 'es'),
('English', 'en'),
('Hindi', 'hi'),
('Arabic', 'ar'),
('Bengali', 'bn'),
('Portuguese', 'pt'),
('Russian', 'ru'),
('Japanese', 'ja'),
('Punjabi', 'pa'),
('German', 'de'),
('Javanese', 'jv'),
('Wu Chinese', 'wuu'),
('Malay/Indonesian', 'ms'),
('Telugu', 'te'),
('Vietnamese', 'vi'),
('Korean', 'ko'),
('French', 'fr'),
('Marathi', 'mr'),
('Tamil', 'ta');

INSERT INTO context_translations (context_id, language_code, name, description) VALUES
-- Arabic translations
(1, 'ar', 'العمل', 'هوية مهنية أو متعلقة بالوظيفة'),
(2, 'ar', 'المدرسة', 'هوية تعليمية'),
(3, 'ar', 'الألعاب', 'هوية ألعاب فيديو أو ألعاب على الإنترنت'),
(4, 'ar', 'الدين', 'هوية تتعلق بالمجتمع الديني أو الروحي'),
(5, 'ar', 'العائلة', 'هوية متعلقة بالعائلة'),
(6, 'ar', 'الأصدقاء', 'هوية اجتماعية مع الأصدقاء'),
(7, 'ar', 'المجتمع', 'هوية متعلقة بالجوار أو المجموعات المدنية'),
(8, 'ar', 'الرياضة', 'هوية رياضية أو متعلقة باللياقة البدنية'),
(9, 'ar', 'التطوع', 'الجمعيات الخيرية وخدمة المجتمع'),
(10, 'ar', 'الصحة', 'هوية طبية أو صحة ورفاهية'),
(11, 'ar', 'السفر', 'هوية متعلقة بالسفر'),
(12, 'ar', 'الموسيقى', 'هوية موسيقية أو محب للموسيقى'),
(13, 'ar', 'الفن', 'هوية فنية أو متعلقة بالفنون'),
(14, 'ar', 'الإنترنت', 'الشخصية العامة على الإنترنت'),
(15, 'ar', 'المهنة', 'هوية مهنية أو متعلقة بالعمل'),
(16, 'ar', 'الهواية', 'هوية متعلقة بالهوايات أو الترفيه'),
(17, 'ar', 'الشخصية', 'هوية شخصية أو خاصة'),
(18, 'ar', 'الروحانية', 'الروحانية غير الدينية'),
(19, 'ar', 'الدراسة', 'هوية تعليمية أو أكاديمية'),
(20, 'ar', 'أخرى', 'أي سياق آخر غير مدرج');



INSERT INTO tags (name, description) VALUES
('Developer', 'Software developer / engineer'),
('Frontend', 'Frontend web developer'),
('Backend', 'Backend web developer'),
('Fullstack', 'Fullstack developer'),
('Designer', 'UI/UX designer'),
('Project Manager', 'Manages projects and teams'),
('Researcher', 'Academic or industry researcher'),
('Data Scientist', 'Works with data analysis and AI'),
('Machine Learning', 'Specialist in machine learning'),
('AI', 'Artificial intelligence'),
('DevOps', 'DevOps engineer'),
('Tester', 'Software tester / QA'),
('Student', 'Student / Learner'),
('Consultant', 'Professional consultant'),
('Entrepreneur', 'Business founder or owner'),
('Content Creator', 'Creates digital content'),
('Writer', 'Professional writer / author'),
('Marketing', 'Marketing specialist'),
('SEO', 'Search engine optimization expert'),
('Analyst', 'Business or data analyst');

-- Arabic translations
INSERT INTO tag_translations (tag_id, language_code, name, description) VALUES
(1, 'ar', 'مطور', 'مطور / مهندس برمجيات'),
(2, 'ar', 'الواجهة الأمامية', 'مطور ويب للواجهة الأمامية'),
(3, 'ar', 'الواجهة الخلفية', 'مطور ويب للواجهة الخلفية'),
(4, 'ar', 'فل ستاك', 'مطور شامل Fullstack'),
(5, 'ar', 'مصمم', 'مصمم واجهات وتجربة المستخدم'),
(6, 'ar', 'مدير مشروع', 'يدير المشاريع والفرق'),
(7, 'ar', 'باحث', 'باحث أكاديمي أو صناعي'),
(8, 'ar', 'عالم بيانات', 'يعمل مع تحليل البيانات والذكاء الاصطناعي'),
(9, 'ar', 'تعلم الآلة', 'متخصص في تعلم الآلة'),
(10, 'ar', 'الذكاء الاصطناعي', 'الذكاء الاصطناعي'),
(11, 'ar', 'DevOps', 'مهندس DevOps'),
(12, 'ar', 'مختبر', 'مختبر برمجيات / ضمان الجودة'),
(13, 'ar', 'طالب', 'طالب / متعلم'),
(14, 'ar', 'استشاري', 'مستشار محترف'),
(15, 'ar', 'رائد أعمال', 'مؤسس أو مالك شركة'),
(16, 'ar', 'مُنشئ محتوى', 'ينشئ محتوى رقمي'),
(17, 'ar', 'كاتب', 'كاتب محترف / مؤلف'),
(18, 'ar', 'تسويق', 'متخصص في التسويق'),
(19, 'ar', 'تحسين محركات البحث', 'خبير تحسين محركات البحث'),
(20, 'ar', 'محلل', 'محلل أعمال أو بيانات');

INSERT INTO system_translations (group_name, entity_name, language_code, translation) VALUES
('dashboard', 'Hi', 'ar', 'مرحباً'),
('dashboard', 'Profile Overview', 'ar', 'نظرة عامة على الملف الشخصي'),
('dashboard', 'Primary Identity', 'ar', 'الهوية الرئيسية'),
('dashboard', 'Website', 'ar', 'الموقع الإلكتروني'),
('dashboard', 'Location', 'ar', 'الموقع'),
('dashboard', 'Organization', 'ar', 'المنظمة'),
('dashboard', 'Your Identities', 'ar', 'هوياتك'),
('dashboard', 'Contexts Joined', 'ar', 'السياقات المنضم إليها'),
('dashboard', 'Languages Used', 'ar', 'اللغات المستخدمة'),
('dashboard', 'Contexts', 'ar', 'السياقات'),
('dashboard', 'Identities', 'ar', 'الهويات'),
('dashboard', 'Recent Activity', 'ar', 'النشاط الأخير'),
('dashboard', 'Social Links', 'ar', 'روابط التواصل الاجتماعي'),
('dashboard', 'Tags', 'ar', 'الوسوم'),
('leftdrawer', 'Essential Links', 'ar', 'روابط أساسية'),
('leftdrawer', 'DashBoard', 'ar', 'لوحة التحكم'),
('leftdrawer', 'View DashBoard', 'ar', 'عرض لوحة التحكم'),
('leftdrawer', 'Search', 'ar', 'بحث'),
('leftdrawer', 'Find people', 'ar', 'ابحث عن أشخاص'),
('leftdrawer', 'Manage Identities', 'ar', 'إدارة الهويات'),
('leftdrawer', 'Your identity types', 'ar', 'أنواع هويتك'),
('leftdrawer', 'Manage Contexts and tags', 'ar', 'إدارة السياقات والوسوم'),
('leftdrawer', 'contexts and tags', 'ar', 'السياقات والوسوم'),
('leftdrawer', 'Account Settings', 'ar', 'إعدادات الحساب'),
('leftdrawer', 'Update your account', 'ar', 'تحديث حسابك'),
('leftdrawer', 'Logout', 'ar', 'تسجيل الخروج'),
-- Table columns
('identity', 'Display Name', 'ar', 'اسم العرض'),
('identity', 'Pronouns', 'ar', 'الضمائر'),
('identity', 'Nickname', 'ar', 'الاسم المستعار'),
('identity', 'Context', 'ar', 'السياق'),
('identity', 'Language', 'ar', 'اللغة'),
('identity', 'Primary', 'ar', 'رئيسي'),
('identity', 'Visibility', 'ar', 'الظهور'),
('identity', 'Actions', 'ar', 'الإجراءات'),

-- Stats and captions
('identity', 'Identities Used', 'ar', 'الهويات المستخدمة'),
('identity', 'Total identities', 'ar', 'إجمالي الهويات'),
('identity', 'Contexts Used', 'ar', 'السياقات المستخدمة'),
('identity', 'Total contexts', 'ar', 'إجمالي السياقات'),
('identity', 'Languages Used', 'ar', 'اللغات المستخدمة'),
('identity', 'Total languages', 'ar', 'إجمالي اللغات'),
('identity', 'Public/Private Profiles', 'ar', 'الملفات العامة/الخاصة'),
('identity', 'Public', 'ar', 'عام'),
('identity', 'Private', 'ar', 'خاص'),

-- Page title
('identity', 'Identity Management', 'ar', 'إدارة الهوية'),

--Settings page
('account_settings', 'Account Settings', 'ar', 'إعدادات الحساب'),
('account_settings', 'Update your account information', 'ar', 'تحديث معلومات حسابك'),
('account_settings', 'Basic Account Info', 'ar', 'معلومات الحساب الأساسية'),
('account_settings', 'Username', 'ar', 'اسم المستخدم'),
('account_settings', 'Email', 'ar', 'البريد الإلكتروني'),
('account_settings', 'Password', 'ar', 'كلمة المرور'),
('account_settings', 'Leave blank to keep current', 'ar', 'اتركه فارغًا للحفاظ على الحالي'),
('account_settings', 'Language Preference', 'ar', 'تفضيل اللغة'),
('account_settings', 'GitHub ID (optional)', 'ar', 'معرف GitHub (اختياري)'),
('account_settings', 'Role', 'ar', 'الدور'),
('account_settings', 'Account Status', 'ar', 'حالة الحساب'),
('account_settings', 'Cancel', 'ar', 'إلغاء'),
('account_settings', 'Save Changes', 'ar', 'حفظ التغييرات'),

-- contexts and tags
('contexts_tags', 'Add Contexts & Tags', 'ar', 'إضافة السياقات والوسوم'),
('contexts_tags', 'Contexts', 'ar', 'السياقات'),
('contexts_tags', 'Add Context', 'ar', 'إضافة سياق'),
('contexts_tags', 'Tags', 'ar', 'الوسوم'),
('contexts_tags', 'Add Tag', 'ar', 'إضافة وسم');
-- -- =====================================
-- -- 3. IDENTITIES & related tables
-- -- =====================================
-- INSERT INTO identities (user_id, profile_photo, visibility) VALUES
-- (1, 'https://i.pravatar.cc/150?img=1', 'public');

-- -- Get the last inserted identity_id
-- -- Assuming identity_id = 1 for simplicity

-- INSERT INTO identity_names (identity_id, type, value, order_index) VALUES
-- (1, 'given', 'Ahmed', 1),
-- (1, 'family', 'Al-Fulan', 2);

-- INSERT INTO identity_translations (identity_id, language_code, display_name, legal_name, nickname, gender_identity) VALUES
-- (1, 'en', 'Ahmed Al-Fulan', 'Ahmed Al-Fulan', 'Ahmad', 'Male'),
-- (1, 'ar', 'أحمد الفلان', 'أحمد الفلان', 'أحمد', 'ذكر');

-- -- =====================================
-- -- 4. IDENTITY_CONTEXTS
-- -- =====================================
-- INSERT INTO identity_contexts (identity_id, context_id, is_primary) VALUES
-- (1, 1, 1),  -- Work
-- (1, 2, 0);  -- School

-- -- =====================================
-- -- 5. PROFILE_METADATA & translations
-- -- =====================================
-- INSERT INTO profile_metadata (user_id, context_id) VALUES
-- (1, 1),  -- Work
-- (1, 2);  -- School

-- -- Assuming profile_metadata IDs = 1 (Work), 2 (School)
-- INSERT INTO profile_metadata_translations (profile_metadata_id, language_code, bio, location, organization, website) VALUES
-- (1, 'en', 'Software engineer at TechCorp', 'Doha, Qatar', 'TechCorp', 'https://techcorp.com'),
-- (1, 'ar', 'مهندس برمجيات في تك كورب', 'الدوحة، قطر', 'تك كورب', 'https://techcorp.com'),
-- (2, 'en', 'Computer Science student', 'Doha, Qatar', 'Qatar University', ''),
-- (2, 'ar', 'طالب علوم الحاسوب', 'الدوحة، قطر', 'جامعة قطر', '');

-- -- =====================================
-- -- 6. SOCIAL_LINKS
-- -- =====================================
-- INSERT INTO social_links (identity_id, platform, url) VALUES
-- (1, 'LinkedIn', 'https://linkedin.com/in/ahmed'),
-- (1, 'GitHub', 'https://github.com/ahmed'),
-- (1, 'Twitter', 'https://twitter.com/ahmed');

-- -- =====================================
-- -- 7. USER_TAGS
-- -- =====================================
-- -- Assuming tag IDs: Developer=1, Frontend=2, Backend=3
-- INSERT INTO user_tags (user_id, tag_id) VALUES
-- (1, 1),
-- (1, 3);

-- -- =====================================
-- -- 8. AUDIT_LOGS
-- -- =====================================
-- INSERT INTO audit_logs (user_id, target_user_id, action, resource, context_id, ip_address) VALUES
-- (1, 1, 'CREATE', 'Identity', 1, '127.0.0.1'),
-- (1, 1, 'UPDATE', 'Profile Metadata', 1, '127.0.0.1');

-- -- =====================================
-- -- 9. SESSIONS / TOKENS
-- -- =====================================
-- INSERT INTO sessions (user_id, token, expires_at) VALUES
-- (1, 'dummy_token_123', datetime('now', '+1 hour'));


-- -- //////////////////////////////////////////////////////////
-- -- =====================================
-- -- 1. USERS
-- -- =====================================
-- INSERT INTO users (email, username, password_hash, language_code, github_id, role, status, description)
-- VALUES
-- ('alice@example.com', 'alice', 'hashedpassword1', 'en', 'aliceGH', 'user', 'active', 'Alice is a frontend developer'),
-- ('omar@example.com', 'omar', 'hashedpassword2', 'ar', 'omarGH', 'user', 'active', 'Omar is a backend developer');

-- -- =====================================
-- -- 2. CONTEXTS
-- -- Already inserted above
-- -- =====================================

-- -- =====================================
-- -- 3. IDENTITIES
-- -- =====================================
-- INSERT INTO identities (user_id, profile_photo, visibility)
-- VALUES
-- (1, 'https://i.pravatar.cc/150?img=5', 'public'),
-- (1, 'https://i.pravatar.cc/150?img=6', 'private'),
-- (2, 'https://i.pravatar.cc/150?img=7', 'public');

-- -- =====================================
-- -- 4. IDENTITY_NAMES
-- -- =====================================
-- INSERT INTO identity_names (identity_id, type, value, order_index)
-- VALUES
-- -- Alice identities
-- (1, 'given', 'Alice', 1),
-- (1, 'family', 'Johnson', 2),
-- (2, 'given', 'Alice', 1),
-- (2, 'family', 'Smith', 2),
-- -- Omar identities
-- (3, 'given', 'Omar', 1),
-- (3, 'family', 'Hassan', 2);

-- -- =====================================
-- -- 5. IDENTITY_TRANSLATIONS
-- -- =====================================
-- INSERT INTO identity_translations (identity_id, language_code, display_name, legal_name, nickname, gender_identity)
-- VALUES
-- -- Alice identity 1
-- (1, 'en', 'Alice Johnson', 'Alice Johnson', 'Ally', 'Female'),
-- (1, 'ar', 'أليس جونسون', 'أليس جونسون', 'آلي', 'أنثى'),
-- -- Alice identity 2
-- (2, 'en', 'Alice Smith', 'Alice Smith', 'Ali', 'Female'),
-- (2, 'ar', 'أليس سميث', 'أليس سميث', 'آلي', 'أنثى'),
-- -- Omar identity
-- (3, 'en', 'Omar Hassan', 'Omar Hassan', 'Omi', 'Male'),
-- (3, 'ar', 'عمر حسن', 'عمر حسن', 'عمر', 'ذكر');

-- -- =====================================
-- -- 6. IDENTITY_CONTEXTS
-- -- =====================================
-- INSERT INTO identity_contexts (identity_id, context_id, is_primary)
-- VALUES
-- (1, 1, 1), -- Alice identity 1 -> Work
-- (2, 2, 0), -- Alice identity 2 -> School
-- (3, 1, 1); -- Omar identity -> Work

-- -- =====================================
-- -- 7. PROFILE_METADATA
-- -- =====================================
-- INSERT INTO profile_metadata (user_id, context_id)
-- VALUES
-- (1, 1),
-- (1, 2),
-- (2, 1);

-- -- =====================================
-- -- PROFILE_METADATA_TRANSLATIONS
-- -- =====================================
-- INSERT INTO profile_metadata_translations (profile_metadata_id, language_code, bio, location, organization, website)
-- VALUES
-- (1, 'en', 'Frontend Developer at Company A', 'New York', 'Company A', 'https://alice.dev'),
-- (1, 'ar', 'مطور واجهة أمامية في الشركة أ', 'نيويورك', 'شركة أ', 'https://alice.dev/ar'),
-- (2, 'en', 'Student at University X', 'Boston', 'University X', 'https://aliceuniv.edu'),
-- (2, 'ar', 'طالبة في جامعة X', 'بوسطن', 'جامعة X', 'https://aliceuniv.edu/ar'),
-- (3, 'en', 'Backend Developer at Company B', 'Cairo', 'Company B', 'https://omar.dev'),
-- (3, 'ar', 'مطور خلفية في الشركة ب', 'القاهرة', 'شركة ب', 'https://omar.dev/ar');

-- -- =====================================
-- -- 8. SOCIAL_LINKS
-- -- =====================================
-- INSERT INTO social_links (identity_id, platform, url)
-- VALUES
-- (1, 'GitHub', 'https://github.com/alice'),
-- (1, 'LinkedIn', 'https://linkedin.com/in/alice'),
-- (2, 'GitHub', 'https://github.com/alice2'),
-- (3, 'GitHub', 'https://github.com/omar'),
-- (3, 'LinkedIn', 'https://linkedin.com/in/omar');

-- -- =====================================
-- -- 9. TAGS & USER_TAGS
-- -- Already inserted above
-- -- =====================================
-- INSERT INTO user_tags (user_id, tag_id)
-- VALUES
-- (1, 1), -- Alice -> Developer
-- (1, 2), -- Alice -> Frontend
-- (2, 1), -- Omar -> Developer
-- (2, 3); -- Omar -> Backend

-- -- =====================================
-- -- 10. AUDIT_LOGS
-- -- =====================================
-- INSERT INTO audit_logs (user_id, target_user_id, action, resource, context_id, ip_address)
-- VALUES
-- (1, 2, 'view', 'profile', 1, '192.168.1.10'),
-- (2, 1, 'edit', 'profile', 1, '192.168.1.11');

-- -- =====================================
-- -- 11. SESSIONS / TOKENS
-- -- =====================================
-- INSERT INTO sessions (user_id, token, expires_at)
-- VALUES
-- (1, 'token_alice_123', '2025-12-31 23:59:59'),
-- (2, 'token_omar_456', '2025-12-31 23:59:59');

-- -- =====================================
-- -- 12. SYSTEM TRANSLATIONS
-- -- Already inserted above
-- -- =====================================

COMMIT;