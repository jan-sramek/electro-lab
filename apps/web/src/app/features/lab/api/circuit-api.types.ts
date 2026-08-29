export interface SimulateRequest {
  schemaVersion: number;
  analysis: {
    type: string;
    tStop?: number;
    dt?: number;
  };
  circuit: {
    ground: string;
    elements: Array<{
      id: string;
      model: string;
      pins: Record<string, string>;
      params: Record<string, number | boolean>;
    }>;
  };
}

export interface DcOpResult {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
}

export interface TranSeries {
  id: string;
  values: number[];
}

export interface TranResult {
  time: number[];
  nodeVoltages: TranSeries[];
  branchCurrents: TranSeries[];
}

export interface SimulateResponse {
  schemaVersion: number;
  ok: boolean;
  analysisType: string;
  errors: string[];
  warnings: string[];
  dcOp?: DcOpResult;
  tran?: TranResult;
}
