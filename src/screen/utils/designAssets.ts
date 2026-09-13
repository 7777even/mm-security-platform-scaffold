export type DesignModule =
  'fire' | 'fireEmergency' | 'accidentRescue' | 'production' | 'preliminary' | 'security' | 'tv';

const MODULE_PREFIX: Record<DesignModule, string> = {
  fire: '消防监测一张图_',
  fireEmergency: '消防应急一张图_',
  accidentRescue: '事故应急救援_',
  production: '生产应急监测_',
  preliminary: '前序应急一张图_',
  security: '安全防恐_',
  tv: '工业电视一张图_',
};

export function designImg(suffix: string, module: DesignModule = 'fire'): string {
  return `/design/${encodeURIComponent(`${MODULE_PREFIX[module]}${suffix}`)}`;
}

export type FirePanelVariant = 'rescue' | 'equipment' | 'monitoring' | 'alarm' | 'duty';
export type ProductionPanelVariant = 'facilities' | 'devices' | 'alarm' | 'risk';
export type PreliminaryPanelVariant = 'eventList' | 'duty' | 'rescue' | 'knowledge';
export type AccidentRescuePanelVariant =
  'incidentDetail' | 'guidance' | 'duty' | 'auxiliary' | 'dynamics' | 'facilityDetail';
export type SecurityPanelVariant = 'entryStats' | 'patrolLeft' | 'alarmTrend' | 'patrolAlarm';
export type TvPanelVariant =
  | 'videoOverview'
  | 'videoAnalysis'
  | 'maintenance'
  | 'eventAnalysis'
  | 'importantVideo'
  | 'plantInspection';
export type PanelVariant =
  | FirePanelVariant
  | ProductionPanelVariant
  | PreliminaryPanelVariant
  | AccidentRescuePanelVariant
  | SecurityPanelVariant
  | TvPanelVariant;

const firePanelBodyMap: Record<FirePanelVariant, string> = {
  rescue: '矩形_4_0001.webp',
  equipment: '矩形_4_0002.webp',
  monitoring: '矩形_4_0003.webp',
  alarm: '矩形_4_0005.webp',
  duty: '矩形_4_0004.webp',
};

const firePanelHeaderMap: Record<FirePanelVariant, string> = {
  rescue: '矩形_5.webp',
  equipment: '矩形_5_0001.webp',
  monitoring: '矩形_5_0002.webp',
  alarm: '矩形_5_0004.webp',
  duty: '矩形_5_0003.webp',
};

const firePanelBottomMap: Record<FirePanelVariant, string> = {
  rescue: '路径_3722.webp',
  equipment: '路径_3722_0001.webp',
  monitoring: '路径_3722_0002.webp',
  alarm: '路径_3722_0004.webp',
  duty: '路径_3722_0003.webp',
};

const firePanelIconMap: Record<FirePanelVariant, string> = {
  rescue: '路径_0012.webp',
  equipment: '路径_0013.webp',
  monitoring: '路径_0014.webp',
  alarm: '路径_0016.webp',
  duty: '路径_0015.webp',
};

const productionPanelBodyMap: Record<ProductionPanelVariant, string> = {
  facilities: '矩形_4_0001.webp',
  devices: '矩形_4_0004.webp',
  alarm: '矩形_4_0003.webp',
  risk: '矩形_4_0002.webp',
};

const productionPanelHeaderMap: Record<ProductionPanelVariant, string> = {
  facilities: '矩形_5.webp',
  devices: '矩形_5_0003.webp',
  alarm: '矩形_5_0002.webp',
  risk: '矩形_5_0001.webp',
};

const productionPanelBottomMap: Record<ProductionPanelVariant, string> = {
  facilities: '路径_3722.webp',
  devices: '路径_3722_0003.webp',
  alarm: '路径_3722_0002.webp',
  risk: '路径_3722_0001.webp',
};

const productionPanelIconMap: Record<ProductionPanelVariant, string> = {
  facilities: '路径_0011.webp',
  devices: '路径_0014.webp',
  alarm: '路径_0013.webp',
  risk: '路径_0012.webp',
};

const preliminaryPanelBodyMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '矩形_4_0004.webp',
  duty: '矩形_4_0001.webp',
  rescue: '矩形_4_0002.webp',
  knowledge: '矩形_4_0003.webp',
};

const preliminaryPanelHeaderMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '矩形_5.webp',
  duty: '矩形_4_0001.webp',
  rescue: '矩形_4_0002.webp',
  knowledge: '矩形_4_0003.webp',
};

const preliminaryPanelBottomMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_3722_0003.webp',
  duty: '路径_3722.webp',
  rescue: '路径_3722_0001.webp',
  knowledge: '路径_3722_0002.webp',
};

const preliminaryPanelIconMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_0015.webp',
  duty: '路径_0011.webp',
  rescue: '路径_0012.webp',
  knowledge: '路径_0013.webp',
};

const fireEmergencyPanelBodyMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '矩形_4_0001.webp',
  duty: '矩形_4_0002.webp',
  rescue: '矩形_4_0003.webp',
  knowledge: '矩形_4_0004.webp',
};

const fireEmergencyPanelHeaderMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '/images/title.webp',
  duty: '矩形_4_0002.webp',
  rescue: '矩形_4_0003.webp',
  knowledge: '矩形_4_0004.webp',
};

const fireEmergencyPanelBottomMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_3722.webp',
  duty: '路径_3722_0001.webp',
  rescue: '路径_3722_0002.webp',
  knowledge: '路径_3722_0003.webp',
};

const fireEmergencyPanelIconMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_0011.webp',
  duty: '路径_0013.webp',
  rescue: '路径_0014.webp',
  knowledge: '路径_0015.webp',
};

const accidentRescuePanelBodyMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '矩形_4_0005.webp',
  guidance: '矩形_4_0002.webp',
  duty: '矩形_4_0001.webp',
  auxiliary: '矩形_4_0003.webp',
  dynamics: '矩形_4_0004.webp',
  facilityDetail: '矩形_4_0004.webp',
};

const accidentRescuePanelHeaderMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '矩形_5.webp',
  guidance: '矩形_4_0002.webp',
  duty: '矩形_4_0001.webp',
  auxiliary: '矩形_4_0003.webp',
  dynamics: '矩形_4_0004.webp',
  facilityDetail: '矩形_5.webp',
};

const accidentRescuePanelBottomMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '路径_3722_0004.webp',
  guidance: '路径_3722_0001.webp',
  duty: '路径_3722.webp',
  auxiliary: '路径_3722_0002.webp',
  dynamics: '路径_3722_0003.webp',
  facilityDetail: '路径_3722_0003.webp',
};

const accidentRescuePanelIconMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '路径_0010.webp',
  guidance: '路径_0006.webp',
  duty: '路径_0005.webp',
  auxiliary: '路径_0007.webp',
  dynamics: '路径_0008.webp',
  facilityDetail: '路径_0015.webp',
};

const securityPanelBodyMap: Record<SecurityPanelVariant, string> = {
  entryStats: '矩形_4_0001.webp',
  patrolLeft: '矩形_4_0003.webp',
  alarmTrend: '矩形_4_0002.webp',
  patrolAlarm: '矩形_4_0004.webp',
};

const securityPanelHeaderMap: Record<SecurityPanelVariant, string> = {
  entryStats: '矩形_5.webp',
  patrolLeft: '矩形_5.webp',
  alarmTrend: '矩形_5_0001.webp',
  patrolAlarm: '矩形_5_0001.webp',
};

const securityPanelBottomMap: Record<SecurityPanelVariant, string> = {
  entryStats: '路径_3722.webp',
  patrolLeft: '路径_3722_0002.webp',
  alarmTrend: '路径_3722_0001.webp',
  patrolAlarm: '路径_3722_0003.webp',
};

const securityPanelIconMap: Record<SecurityPanelVariant, string> = {
  entryStats: '路径_0011.webp',
  patrolLeft: '路径_0094.webp',
  alarmTrend: '路径_0012.webp',
  patrolAlarm: '路径_0095.webp',
};

const tvPanelBodyMap: Record<TvPanelVariant, string> = {
  videoOverview: '矩形_4_0001.webp',
  videoAnalysis: '矩形_4_0002.webp',
  eventAnalysis: '矩形_4_0003.webp',
  maintenance: '矩形_4_0004.webp',
  importantVideo: '矩形_4_0005.webp',
  plantInspection: '矩形_4_0006.webp',
};

const tvPanelHeaderMap: Record<TvPanelVariant, string> = {
  videoOverview: '矩形_5.webp',
  videoAnalysis: '矩形_5_0001.webp',
  eventAnalysis: '矩形_5_0002.webp',
  maintenance: '矩形_5_0003.webp',
  importantVideo: '矩形_5.webp',
  plantInspection: '矩形_5_0001.webp',
};

const tvPanelBottomMap: Record<TvPanelVariant, string> = {
  videoOverview: '路径_3722.webp',
  videoAnalysis: '路径_3722_0001.webp',
  eventAnalysis: '路径_3722_0002.webp',
  maintenance: '路径_3722_0003.webp',
  importantVideo: '路径_3722_0004.webp',
  plantInspection: '路径_3722_0005.webp',
};

const tvPanelIconMap: Record<TvPanelVariant, string> = {
  videoOverview: '路径_0011.webp',
  videoAnalysis: '路径_0012.webp',
  eventAnalysis: '路径_0013.webp',
  maintenance: '路径_0014.webp',
  importantVideo: '路径_0015.webp',
  plantInspection: '路径_0016.webp',
};

function createAssets(module: DesignModule) {
  const img = (suffix: string) => designImg(suffix, module);
  // 消防设计稿无地图切换按钮切图，复用生产应急监测同款 108×38 按钮
  const mapToggleModule: DesignModule =
    module === 'fire' || module === 'fireEmergency' || module === 'accidentRescue'
      ? 'production'
      : module;

  // 生产/前序用 _0001 变体；消防/安全防恐仅有基础文件名
  const footerBg =
    module === 'production' || module === 'preliminary' ? '矩形_6_0001.webp' : '矩形_6.webp';
  const footerDeco =
    module === 'production' || module === 'preliminary' ? '路径_3723_0001.webp' : '路径_3723.webp';
  const systemMessageStrip =
    module === 'production'
      ? 'image_0027.webp'
      : module === 'preliminary'
        ? 'image_0016.webp'
        : module === 'fireEmergency'
          ? 'image_0001.webp'
          : module === 'security'
            ? 'image_0009.webp'
            : module === 'tv'
              ? 'image_0008.webp'
              : 'image_0001.webp';
  const footerTickerBg =
    module === 'production'
      ? 'image_0028.webp'
      : module === 'preliminary'
        ? 'image_0017.webp'
        : module === 'fireEmergency'
          ? 'image_0002.webp'
          : module === 'security'
            ? 'image_0010.webp'
            : module === 'tv'
              ? 'image_0009.webp'
              : 'image_0002.webp';
  const footerMoreButton =
    module === 'production'
      ? 'image_0029.webp'
      : module === 'preliminary'
        ? 'image_0018.webp'
        : module === 'fireEmergency'
          ? 'image_0003.webp'
          : module === 'security'
            ? 'image_0011.webp'
            : module === 'tv'
              ? 'image_0010.webp'
              : 'image_0003.webp';
  const moreArrow = 'Color_Overlay-3.webp';

  return {
    mapBg: img('image.webp'),
    headerBg: img('路径_1.webp'),
    headerTitleDeco: img('路径_3720.webp'),
    headerTitleAccent: img('路径_3721.webp'),
    headerTitleLine: img('矩形_4.webp'),
    navActiveBg: img('矩形_1.webp'),
    navActiveLine: img('矩形_2.webp'),
    navIcons: [
      img('路径_0004.webp'),
      img('路径_0005.webp'),
      img('路径_0006.webp'),
      img('路径_0007.webp'),
      img('路径_0008.webp'),
      img('路径_0009.webp'),
    ],
    weatherIcon: img('路径_0010.webp'),
    userAvatar: img('图层121.webp'),
    userArrow: img('路径_4.webp'),
    footerBg: img(footerBg),
    footerDeco: img(footerDeco),
    systemMessageStrip: img(systemMessageStrip),
    footerTickerBg: img(footerTickerBg),
    footerMoreButton: img(footerMoreButton),
    zoneOverlays: [img('路径_3724.webp'), img('路径_3727.webp'), img('路径_3726.webp')],
    zoneLabelBg: img('矩形_52.webp'),
    alarmPopupBg: img('矩形_31.webp'),
    alarmStatusDot: img('圆形_30.webp'),
    fireMarkerOuter: img('圆形_41.webp'),
    fireMarkerInner: img('圆形_42.webp'),
    fireMarkerIcon: img(
      module === 'production'
        ? '路径_0015.webp'
        : module === 'preliminary'
          ? '路径_0014.webp'
          : module === 'fireEmergency'
            ? '路径_0012.webp'
            : module === 'accidentRescue'
              ? '路径_0009.webp'
              : module === 'tv'
                ? '路径_0025.webp'
                : '路径_0011.webp',
    ),
    fireMarkerShadow1: img('圆形_45.webp'),
    fireMarkerShadow2: img('圆形_46.webp'),
    fireMarkerBase: img('圆形_44.webp'),
    fireMarkerLine: img('矩形_60.webp'),
    fireMarkerDot: img('圆形_43.webp'),
    moreArrow: img(moreArrow),
    mapToggleActive: designImg('矩形_58.webp', mapToggleModule),
    mapToggleInactive: designImg('矩形_59.webp', mapToggleModule),
    statsBarBg: module === 'production' ? img('image_0017.webp') : undefined,
    riskSummaryBg: module === 'production' ? img('image_0013.webp') : undefined,
    riskWarningBg: module === 'production' ? img('image_0025.webp') : undefined,
  } as const;
}

export const assets = createAssets('fire');
export const productionAssets = createAssets('production');
export const preliminaryAssets = createAssets('preliminary');
export const fireEmergencyAssets = createAssets('fireEmergency');
export const accidentRescueAssets = {
  ...createAssets('accidentRescue'),
  routeOverlayMain: designImg('路径_3729.webp', 'accidentRescue'),
  routeOverlayBranch: designImg('路径_3730.webp', 'accidentRescue'),
  gateLabelBg: designImg('矩形_52.webp', 'accidentRescue'),
  gateMarkerOuter: designImg('圆形_28.webp', 'accidentRescue'),
  gateMarkerInner: designImg('圆形_29.webp', 'accidentRescue'),
  gateFlowIcon: designImg('圆形_27.webp', 'accidentRescue'),
  /** 合并后的车辆标点（圆环 + 箭头），默认朝右 */
  vehicleMarkerCar: '/design/car.webp',
  fireMarkerGroundGlow: designImg('圆形_45_0001.webp', 'accidentRescue'),
  replayButtonBg: designImg('矩形_58.webp', 'accidentRescue'),
  vehiclePopupBg: designImg('矩形_31.webp', 'accidentRescue'),
  firePopupBg: designImg('矩形_31_0001.webp', 'accidentRescue'),
  backButtonOuter: designImg('圆形_42_0001.webp', 'accidentRescue'),
  backButtonIcon: designImg('路径_0010.webp', 'accidentRescue'),
} as const;
export const securityAssets = {
  ...createAssets('security'),
  zoneHighlight: designImg('路径_3728.webp', 'security'),
  gateLabelBg: designImg('矩形_52.webp', 'security'),
  gateMarkerOuter: designImg('圆形_28.webp', 'security'),
  gateMarkerInner: designImg('圆形_29.webp', 'security'),
  gateFlowIcon: designImg('圆形_27.webp', 'security'),
  mapToolbar: designImg('image_0014.webp', 'security'),
  linkageStatusGreen: designImg('矩形_59.webp', 'security'),
  linkageStatusOrange: designImg('矩形_59_0003.webp', 'security'),
  linkageIcons: [
    designImg('图层_2.webp', 'security'),
    designImg('图层_3.webp', 'security'),
    designImg('图层_4.webp', 'security'),
    designImg('图层_5.webp', 'security'),
  ],
} as const;

export const tvAssets = {
  ...createAssets('tv'),
  inspectionCircleOverlays: [
    {
      inner: designImg('圆形_48.webp', 'tv'),
      line: designImg('直线_14.webp', 'tv'),
    },
    {
      inner: designImg('圆形_48_0001.webp', 'tv'),
      line: designImg('直线_14_0001.webp', 'tv'),
    },
  ],
  zoneLabelBgs: [
    designImg('矩形_31.webp', 'tv'),
    designImg('矩形_31_0001.webp', 'tv'),
    designImg('矩形_31_0002.webp', 'tv'),
    designImg('矩形_31_0003.webp', 'tv'),
  ],
  cameraMarkers: [
    {
      outer: designImg('圆形_45.webp', 'tv'),
      icon: designImg('路径_0021.webp', 'tv'),
      line: designImg('矩形_60.webp', 'tv'),
      dot: designImg('圆形_43.webp', 'tv'),
    },
    {
      outer: designImg('圆形_45_0001.webp', 'tv'),
      icon: designImg('路径_0022.webp', 'tv'),
      line: designImg('矩形_60_0001.webp', 'tv'),
      dot: designImg('圆形_43_0001.webp', 'tv'),
    },
    {
      outer: designImg('圆形_45_0002.webp', 'tv'),
      icon: designImg('路径_0023.webp', 'tv'),
      line: designImg('矩形_60_0002.webp', 'tv'),
      dot: designImg('圆形_43_0002.webp', 'tv'),
    },
    {
      outer: designImg('圆形_45_0003.webp', 'tv'),
      icon: designImg('路径_0024.webp', 'tv'),
      line: designImg('矩形_60_0003.webp', 'tv'),
      dot: designImg('圆形_43_0003.webp', 'tv'),
    },
  ],
  alarmPopupBg: designImg('矩形_31_0004.webp', 'tv'),
  alarmMarker: {
    shadow1: designImg('圆形_45_0004.webp', 'tv'),
    shadow2: designImg('圆形_46.webp', 'tv'),
    base: designImg('圆形_44.webp', 'tv'),
    outer: designImg('圆形_41.webp', 'tv'),
    inner: designImg('圆形_42.webp', 'tv'),
    icon: designImg('路径_0025.webp', 'tv'),
    line: designImg('矩形_60_0004.webp', 'tv'),
    dot: designImg('圆形_43_0004.webp', 'tv'),
  },
  videoMonitorDetail: {
    icon: designImg('路径_0015.webp', 'tv'),
  },
} as const;

export function getAssets(module: DesignModule) {
  if (module === 'production') return productionAssets;
  if (module === 'preliminary') return preliminaryAssets;
  if (module === 'fireEmergency') return fireEmergencyAssets;
  if (module === 'accidentRescue') return accidentRescueAssets;
  if (module === 'security') return securityAssets;
  if (module === 'tv') return tvAssets;
  return assets;
}

export function panelAssets(variant: PanelVariant, module: DesignModule = 'fire') {
  const more = getAssets(module).moreArrow;

  if (module === 'accidentRescue') {
    const v = variant as AccidentRescuePanelVariant;
    const assetModule: DesignModule = v === 'facilityDetail' ? 'preliminary' : module;
    return {
      body: designImg(accidentRescuePanelBodyMap[v], assetModule),
      header: designImg(accidentRescuePanelHeaderMap[v], assetModule),
      bottom: designImg(accidentRescuePanelBottomMap[v], assetModule),
      icon: designImg(accidentRescuePanelIconMap[v], assetModule),
      more,
    };
  }

  if (module === 'preliminary' || module === 'fireEmergency') {
    const v = variant as PreliminaryPanelVariant;
    const bodyMap =
      module === 'fireEmergency' ? fireEmergencyPanelBodyMap : preliminaryPanelBodyMap;
    const headerMap =
      module === 'fireEmergency' ? fireEmergencyPanelHeaderMap : preliminaryPanelHeaderMap;
    const bottomMap =
      module === 'fireEmergency' ? fireEmergencyPanelBottomMap : preliminaryPanelBottomMap;
    const iconMap =
      module === 'fireEmergency' ? fireEmergencyPanelIconMap : preliminaryPanelIconMap;
    const headerSrc = headerMap[v];
    return {
      body: designImg(bodyMap[v], module),
      header: headerSrc.startsWith('/') ? headerSrc : designImg(headerSrc, module),
      bottom: designImg(bottomMap[v], module),
      icon: designImg(iconMap[v], module),
      more,
    };
  }

  if (module === 'security') {
    const v = variant as SecurityPanelVariant;
    return {
      body: designImg(securityPanelBodyMap[v], module),
      header: designImg(securityPanelHeaderMap[v], module),
      bottom: designImg(securityPanelBottomMap[v], module),
      icon: designImg(securityPanelIconMap[v], module),
      more,
    };
  }

  if (module === 'tv') {
    const v = variant as TvPanelVariant;
    return {
      body: designImg(tvPanelBodyMap[v], module),
      header: designImg(tvPanelHeaderMap[v], module),
      bottom: designImg(tvPanelBottomMap[v], module),
      icon: designImg(tvPanelIconMap[v], module),
      more,
    };
  }

  if (module === 'production') {
    const v = variant as ProductionPanelVariant;
    return {
      body: designImg(productionPanelBodyMap[v], module),
      header: designImg(productionPanelHeaderMap[v], module),
      bottom: designImg(productionPanelBottomMap[v], module),
      icon: designImg(productionPanelIconMap[v], module),
      more,
    };
  }

  const v = variant as FirePanelVariant;
  return {
    body: designImg(firePanelBodyMap[v], module),
    header: designImg(firePanelHeaderMap[v], module),
    bottom: designImg(firePanelBottomMap[v], module),
    icon: designImg(firePanelIconMap[v], module),
    more,
  };
}
