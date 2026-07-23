import {
  isEnergyValue,
  isMoodValue,
  normalizeTags,
  type LifeRecord,
  type ReflectionFeedback,
  type ReflectionSource,
  type ReflectionStatus,
} from '@/domain/records/records.types';
import {
  createDefaultSettings,
  isTheme,
  USER_SETTINGS_DEFAULT_THEME,
  USER_SETTINGS_MAX_EXPECTANCY,
  USER_SETTINGS_MIN_BIRTH_YEAR,
  USER_SETTINGS_MIN_EXPECTANCY,
  type UserSettings,
} from '@/domain/settings/settings.types';

export const DATA_MANAGEMENT_BACKUP_FORMAT = 'life-progress-rpg-backup-v1';
export const DATA_MANAGEMENT_SCHEMA_VERSION = 1;

export interface DataManagementBackup {
  format: typeof DATA_MANAGEMENT_BACKUP_FORMAT;
  schemaVersion: number;
  sourceUserId: string;
  exportedAt: string;
  appVersion?: string;
  settings: UserSettings;
  records: LifeRecord[];
}

export interface DataManagementImportPreview {
  recordCount: number;
  dateFrom: string | undefined;
  dateTo: string | undefined;
  schemaVersion: number;
  sourceUserId: string;
}

export interface DataManagementImportParseSuccess {
  ok: true;
  value: DataManagementBackup;
  preview: DataManagementImportPreview;
  warnings: string[];
}

export interface DataManagementImportParseFailure {
  ok: false;
  errors: string[];
}

export type DataManagementImportParseResult = DataManagementImportParseSuccess | DataManagementImportParseFailure;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isReflectionSource = (value: unknown): value is ReflectionSource =>
  value === 'rules' || value === 'ai' || value === 'none';

const isReflectionStatus = (value: unknown): value is ReflectionStatus =>
  value === 'not_requested' || value === 'pending' || value === 'completed' || value === 'failed';

const isReflectionFeedback = (value: unknown): value is ReflectionFeedback =>
  value === 'helpful' || value === 'not_helpful' || value === 'inaccurate';

const toIsoString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString();
};

const parseString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
};

const normalizeBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

const parseSettings = (input: unknown, targetUserId: string): { value?: UserSettings; errors: string[]; warnings: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!isObjectRecord(input)) {
    return { errors: ['设置必须是对象。'], warnings: [] };
  }

  const source = createDefaultSettings(targetUserId);

  const birthdayYearRaw = typeof input.birthdayYear === 'number' ? input.birthdayYear : NaN;
  const lifeExpectancyRaw = typeof input.lifeExpectancy === 'number' ? input.lifeExpectancy : NaN;
  if (!Number.isInteger(birthdayYearRaw)) {
    return { errors: ['设置中出生年份不是整数。'], warnings };
  }
  if (!Number.isInteger(lifeExpectancyRaw)) {
    return { errors: ['设置中预期寿命不是整数。'], warnings };
  }
  if (birthdayYearRaw < USER_SETTINGS_MIN_BIRTH_YEAR || birthdayYearRaw > new Date().getFullYear()) {
    return { errors: ['设置中的出生年份超出合法范围。'], warnings };
  }
  if (lifeExpectancyRaw < USER_SETTINGS_MIN_EXPECTANCY || lifeExpectancyRaw > USER_SETTINGS_MAX_EXPECTANCY) {
    return { errors: ['设置中的预期寿命超出合法范围。'], warnings };
  }

  const themeRaw = input.theme;
  const theme = isTheme(themeRaw) ? themeRaw : USER_SETTINGS_DEFAULT_THEME;
  if (!isTheme(themeRaw)) {
    warnings.push('导入文件中的 theme 不合法，已回退到默认值。');
  }

  const updatedAt = toIsoString(input.updatedAt) ?? new Date().toISOString();
  const createdAt = toIsoString(input.createdAt) ?? updatedAt;
  const nickname = parseString(input.nickname) ?? undefined;
  if (nickname && nickname.length > 40) {
    return { errors: ['昵称长度超过 40。'], warnings };
  }

  const schemaVersionRaw = input.schemaVersion;
  let schemaVersion = DATA_MANAGEMENT_SCHEMA_VERSION;
  if (typeof schemaVersionRaw === 'number' && Number.isInteger(schemaVersionRaw) && schemaVersionRaw > 0) {
    schemaVersion = schemaVersionRaw;
  } else {
    warnings.push('导入文件中的 schemaVersion 非法，已使用默认值。');
  }

  const value: UserSettings = {
    id: targetUserId,
    nickname,
    birthdayYear: birthdayYearRaw,
    lifeExpectancy: lifeExpectancyRaw,
    showLifeProgress: normalizeBoolean(input.showLifeProgress, source.showLifeProgress),
    aiConsent: normalizeBoolean(input.aiConsent, source.aiConsent),
    analyticsConsent: normalizeBoolean(input.analyticsConsent, source.analyticsConsent),
    theme,
    onboardingCompleted: normalizeBoolean(input.onboardingCompleted, source.onboardingCompleted),
    schemaVersion,
    createdAt,
    updatedAt,
  };

  return { value, errors, warnings };
};

const parseRecord = (input: unknown, targetUserId: string, seenDates: Set<string>): { value?: LifeRecord; errors: string[]; warnings: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!isObjectRecord(input)) {
    return { errors: ['记录不是对象。'], warnings: [] };
  }

  const localDate = parseString(input.localDate);
  if (!localDate || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return { errors: ['存在记录的 localDate 非法。'], warnings };
  }

  if (seenDates.has(localDate)) {
    return { errors: [`localDate 重复：${localDate}`], warnings };
  }

  const moodRaw = input.mood;
  const energyRaw = input.energy;
  if (!isMoodValue(moodRaw) || !isEnergyValue(energyRaw)) {
    return { errors: [`记录 ${localDate} 的 mood/energy 非法。`], warnings };
  }

  const content = parseString(input.content);
  const reflection = parseString(input.reflection);
  const rawTags = Array.isArray(input.tags) ? input.tags : [];
  const normalizedTagInput = rawTags.map((item) => (typeof item === 'string' ? item : String(item ?? '')));
  const tags = normalizeTags(normalizedTagInput);
  if (rawTags.length !== tags.length) {
    warnings.push(`记录 ${localDate} 的标签已被清洗。`);
  }

  const reflectionSourceRaw = input.reflectionSource;
  const reflectionSource = isReflectionSource(reflectionSourceRaw) ? reflectionSourceRaw : 'rules';
  if (!isReflectionSource(reflectionSourceRaw)) {
    warnings.push(`记录 ${localDate} 的 reflectionSource 非法，已改为 rules。`);
  }

  const reflectionStatusRaw = input.reflectionStatus;
  const reflectionStatus = isReflectionStatus(reflectionStatusRaw) ? reflectionStatusRaw : 'not_requested';
  if (!isReflectionStatus(reflectionStatusRaw)) {
    warnings.push(`记录 ${localDate} 的 reflectionStatus 非法，已改为 not_requested。`);
  }

  const reflectionFeedbackRaw = input.reflectionFeedback;
  const reflectionFeedback = isReflectionFeedback(reflectionFeedbackRaw) ? reflectionFeedbackRaw : undefined;
  if (reflectionFeedbackRaw !== undefined && reflectionFeedback === undefined) {
    warnings.push(`记录 ${localDate} 的 reflectionFeedback 非法，已忽略。`);
  }

  const createdAt = toIsoString(input.createdAt) ?? new Date().toISOString();
  const updatedAt = toIsoString(input.updatedAt) ?? createdAt;
  const id = parseString(input.id) ?? `${targetUserId}-${localDate}`;

  const record: LifeRecord = {
    id,
    userId: targetUserId,
    localDate,
    mood: moodRaw,
    energy: energyRaw,
    content,
    tags,
    reflection,
    reflectionSource,
    reflectionStatus,
    reflectionFeedback,
    createdAt,
    updatedAt,
  };

  seenDates.add(localDate);
  return { value: record, errors, warnings };
};

export const parseDataManagementBackup = (
  inputText: string,
  targetUserId: string
): DataManagementImportParseResult => {
  const warnings: string[] = [];

  let raw: unknown;
  try {
    raw = JSON.parse(inputText);
  } catch {
    return { ok: false, errors: ['JSON 格式解析失败。'] };
  }

  if (!isObjectRecord(raw)) {
    return { ok: false, errors: ['导入内容不是对象。'] };
  }

  if (raw.format !== DATA_MANAGEMENT_BACKUP_FORMAT) {
    return { ok: false, errors: ['不支持的导出格式。'] };
  }

  if (typeof raw.schemaVersion !== 'number' || !Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 1) {
    return { ok: false, errors: ['schemaVersion 不合法。'] };
  }
  if (raw.schemaVersion > DATA_MANAGEMENT_SCHEMA_VERSION) {
    return { ok: false, errors: [`不支持的 schemaVersion ${raw.schemaVersion}。`] };
  }

  const exportedAt = toIsoString(raw.exportedAt);
  if (!exportedAt) {
    return { ok: false, errors: ['导出时间 exportedAt 缺失或非法。'] };
  }

  const sourceUserId = parseString(raw.sourceUserId) ?? targetUserId;

  const settingsResult = parseSettings(raw.settings, targetUserId);
  if (!settingsResult.value) {
    return { ok: false, errors: settingsResult.errors };
  }
  warnings.push(...settingsResult.warnings);

  if (!Array.isArray(raw.records)) {
    return { ok: false, errors: ['records 不是数组。'] };
  }

  const seenDates = new Set<string>();
  const records: LifeRecord[] = [];
  for (let index = 0; index < raw.records.length; index += 1) {
    const parsed = parseRecord(raw.records[index], targetUserId, seenDates);
    if (parsed.errors.length > 0) {
      return { ok: false, errors: [
        `records[${index}] 解析失败：${parsed.errors.join('；')}`,
      ] };
    }

    records.push(parsed.value!);
    warnings.push(...parsed.warnings);
  }

  const sortedDates = [...seenDates].sort();
  const value: DataManagementBackup = {
    format: DATA_MANAGEMENT_BACKUP_FORMAT,
    schemaVersion: raw.schemaVersion,
    sourceUserId,
    exportedAt,
    appVersion: parseString(raw.appVersion),
    settings: settingsResult.value,
    records,
  };

  const preview: DataManagementImportPreview = {
    recordCount: value.records.length,
    dateFrom: sortedDates[0],
    dateTo: sortedDates[sortedDates.length - 1],
    schemaVersion: value.schemaVersion,
    sourceUserId: value.sourceUserId,
  };

  return { ok: true, value, preview, warnings };
};
