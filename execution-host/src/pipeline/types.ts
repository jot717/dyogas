/**
 * SPRINT-EXECUTION-HOST-001 — Group C pipeline types.
 * Topology is loaded from /pipelines — never invented here.
 */

export type PipelineStageDef = {
  readonly index: number;
  readonly name: string;
  readonly producer: string;
  readonly consumer: string;
  readonly inputArtifact: string;
  readonly outputArtifact: string;
  readonly exitCriteria: string;
  /** True when stage requires Human Approval Gate (e.g. Stage 4). */
  readonly humanGate: boolean;
  readonly reviewGate: boolean;
};

export type PipelineDefinition = {
  readonly pipeline_id: string;
  readonly pipeline_version: string;
  readonly sourcePath: string;
  readonly stages: readonly PipelineStageDef[];
};

/** Immutable pin recorded at CREATE (T-C2). */
export type ImmutablePipelinePin = {
  readonly pipeline_id: string;
  readonly pipeline_version: string;
};
