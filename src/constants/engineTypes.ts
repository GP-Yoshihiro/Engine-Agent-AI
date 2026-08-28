export const ENGINE_TYPES = ['unreal-engine', 'unity'] as const;
export type EngineType = (typeof ENGINE_TYPES)[number];

export const ENGINE_TYPE_LABELS: Record<EngineType, string> = {
  'unreal-engine': 'Unreal Engine',
  unity: 'Unity',
};
