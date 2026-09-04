import type { IncidentDetailField } from './accidentRescueMock';

export interface FacilityArchiveFile {
  id: string;
  name: string;
}

export interface FacilityDetailInfo {
  facilityName: string;
  hazardSourceCode: string;
  basicFields: IncidentDetailField[];
  chemicalFields: IncidentDetailField[];
  archives: FacilityArchiveFile[];
}

const defaultBasicFields: IncidentDetailField[] = [
  { label: '重大危险源分类', value: '装置' },
  { label: '重大危险源等级', value: '一级' },
  { label: 'R值', value: '107' },
  { label: '地址', value: '--' },
  { label: '投用日期', value: '2024-10-15 00:00:00' },
  { label: '外边界500米范围人数估算', value: '--' },
  { label: '周边防护目标最近距离(米)', value: '--' },
  { label: '是否涉及重点监管工艺', value: '--' },
  { label: '是否在化工园区内', value: '是' },
  { label: '主要负责人', value: '程仁策 - 13705456799' },
  { label: '技术负责人', value: '程广生 - 13642098552' },
  { label: '操作负责人', value: '熊国辉 - 13936876966' },
];

const defaultChemicalFields: IncidentDetailField[] = [
  { label: '化学品名称', value: '乙烯' },
  { label: 'CAS号', value: '74-85-1' },
  { label: '危险性类别', value: '易燃气体' },
  { label: '最大储量', value: '--' },
  { label: '临界量', value: '--' },
];

const defaultArchives: FacilityArchiveFile[] = [
  { id: '1', name: '顺丁橡胶装置SIL定级报告终版.pdf' },
  { id: '2', name: '【含7个重大危险源】高端重大危险源评估报告.pdf' },
  { id: '3', name: '乙烯装置HAZOP分析报告.pdf' },
  { id: '4', name: '消防设施年度检测报告.pdf' },
  { id: '5', name: '应急预案备案登记表.pdf' },
  { id: '6', name: '特种设备定期检验证书.pdf' },
];

export function resolveFacilityDetail(facilityName?: string): FacilityDetailInfo {
  return {
    facilityName: facilityName ?? '乙烯裂解装置',
    hazardSourceCode: '370680917088',
    basicFields: defaultBasicFields,
    chemicalFields: defaultChemicalFields,
    archives: defaultArchives,
  };
}
