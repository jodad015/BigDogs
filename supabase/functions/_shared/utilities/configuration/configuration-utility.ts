import type { ConfigLoadCriteria, ConfigLoadResult } from './criteria.ts';

export class ConfigurationUtility {
  load(criteria: ConfigLoadCriteria): ConfigLoadResult {
    const value = Deno.env.get(criteria.key);
    return value ? { value } : { errors: [{ code: 'NOT_FOUND', message: `Config key '${criteria.key}' not found` }] };
  }
}
