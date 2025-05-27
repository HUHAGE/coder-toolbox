// 中国行政区划数据
// 中国行政区划数据 (2024年)
// 数据来源：国家统计局 http://www.stats.gov.cn/sj/tjbz/tjyqhdmhcxhfdm/
// 最后更新时间：2024-02-17

// 添加类型定义
export interface RegionOption {
  value: string;
  label: string;
  children?: RegionOption[];
}

export const regionData = [
  // 直辖市
  {
    value: '11',
    label: '北京市',
    children: [
      {
        value: '1101',
        label: '市辖区',
        children: [
          { value: '110101', label: '东城区' },
          { value: '110102', label: '西城区' },
          { value: '110105', label: '朝阳区' },
          { value: '110106', label: '丰台区' },
          { value: '110107', label: '石景山区' },
          { value: '110108', label: '海淀区' },
          { value: '110109', label: '门头沟区' },
          { value: '110111', label: '房山区' },
          { value: '110112', label: '通州区' },
          { value: '110113', label: '顺义区' },
          { value: '110114', label: '昌平区' },
          { value: '110115', label: '大兴区' },
          { value: '110116', label: '怀柔区' },
          { value: '110117', label: '平谷区' },
          { value: '110118', label: '密云区' },
          { value: '110119', label: '延庆区' }
        ]
      }
    ]
  },
  {
    value: '12',
    label: '天津市',
    children: [
      {
        value: '1201',
        label: '市辖区',
        children: [
          { value: '120101', label: '和平区' },
          { value: '120102', label: '河东区' },
          { value: '120103', label: '河西区' },
          { value: '120104', label: '南开区' },
          { value: '120105', label: '河北区' },
          { value: '120106', label: '红桥区' },
          { value: '120110', label: '东丽区' },
          { value: '120111', label: '西青区' },
          { value: '120112', label: '津南区' },
          { value: '120113', label: '北辰区' },
          { value: '120114', label: '武清区' },
          { value: '120115', label: '宝坻区' },
          { value: '120116', label: '滨海新区' },
          { value: '120117', label: '宁河区' },
          { value: '120118', label: '静海区' },
          { value: '120119', label: '蓟州区' }
        ]
      }
    ]
  },
  // 省份
  {
    value: '13',
    label: '河北省',
    children: [
      {
        value: '1301',
        label: '石家庄市',
        children: [
          { value: '130102', label: '长安区' },
          { value: '130104', label: '桥西区' },
          { value: '130105', label: '新华区' },
          { value: '130107', label: '井陉矿区' },
          { value: '130108', label: '裕华区' },
          { value: '130109', label: '藁城区' },
          { value: '130110', label: '鹿泉区' },
          { value: '130111', label: '栾城区' },
          { value: '130121', label: '井陉县' },
          { value: '130123', label: '正定县' },
          { value: '130125', label: '行唐县' },
          { value: '130126', label: '灵寿县' },
          { value: '130127', label: '高邑县' },
          { value: '130128', label: '深泽县' },
          { value: '130129', label: '赞皇县' },
          { value: '130130', label: '无极县' },
          { value: '130131', label: '平山县' },
          { value: '130132', label: '元氏县' },
          { value: '130133', label: '赵县' },
          { value: '130181', label: '辛集市' },
          { value: '130183', label: '晋州市' },
          { value: '130184', label: '新乐市' }
        ]
      }
    ]
  },
  {
    value: '14',
    label: '山西省',
    children: [
      {
        value: '1401',
        label: '太原市',
        children: [
          { value: '140105', label: '小店区' },
          { value: '140106', label: '迎泽区' },
          { value: '140107', label: '杏花岭区' },
          { value: '140108', label: '尖草坪区' },
          { value: '140109', label: '万柏林区' },
          { value: '140110', label: '晋源区' },
          { value: '140121', label: '清徐县' },
          { value: '140122', label: '阳曲县' },
          { value: '140123', label: '娄烦县' },
          { value: '140181', label: '古交市' }
        ]
      }
    ]
  },
  // 自治区
  {
    value: '15',
    label: '内蒙古自治区',
    children: [
      {
        value: '1501',
        label: '呼和浩特市',
        children: [
          { value: '150102', label: '新城区' },
          { value: '150103', label: '回民区' },
          { value: '150104', label: '玉泉区' },
          { value: '150105', label: '赛罕区' },
          { value: '150121', label: '土默特左旗' },
          { value: '150122', label: '托克托县' },
          { value: '150123', label: '和林格尔县' },
          { value: '150124', label: '清水河县' },
          { value: '150125', label: '武川县' }
        ]
      }
    ]
  },
  {
    value: '31',
    label: '上海市',
    children: [
      {
        value: '3101',
        label: '市辖区',
        children: [
          { value: '310101', label: '黄浦区' },
          { value: '310104', label: '徐汇区' },
          { value: '310105', label: '长宁区' },
          { value: '310106', label: '静安区' },
          { value: '310107', label: '普陀区' },
          { value: '310109', label: '虹口区' },
          { value: '310110', label: '杨浦区' },
          { value: '310112', label: '闵行区' },
          { value: '310113', label: '宝山区' },
          { value: '310114', label: '嘉定区' },
          { value: '310115', label: '浦东新区' },
          { value: '310116', label: '金山区' },
          { value: '310117', label: '松江区' },
          { value: '310118', label: '青浦区' },
          { value: '310120', label: '奉贤区' },
          { value: '310151', label: '崇明区' }
        ]
      }
    ]
  },
  {
    value: '23',
    label: '黑龙江省',
    children: [
      {
        value: '2301',
        label: '哈尔滨市',
        children: [
          { value: '230102', label: '道里区' },
          { value: '230103', label: '南岗区' },
          { value: '230104', label: '道外区' },
          { value: '230108', label: '平房区' },
          { value: '230109', label: '松北区' },
          { value: '230110', label: '香坊区' },
          { value: '230111', label: '呼兰区' },
          { value: '230112', label: '阿城区' },
          { value: '230113', label: '双城区' },
          { value: '230123', label: '依兰县' },
          { value: '230124', label: '方正县' },
          { value: '230125', label: '宾县' },
          { value: '230126', label: '巴彦县' },
          { value: '230127', label: '木兰县' },
          { value: '230128', label: '通河县' },
          { value: '230129', label: '延寿县' },
          { value: '230183', label: '尚志市' },
          { value: '230184', label: '五常市' }
        ]
      },
      {
        value: '2302',
        label: '齐齐哈尔市',
        children: [
          { value: '230202', label: '龙沙区' },
          { value: '230203', label: '建华区' },
          { value: '230204', label: '铁锋区' },
          { value: '230205', label: '昂昂溪区' },
          { value: '230206', label: '富拉尔基区' },
          { value: '230207', label: '碾子山区' },
          { value: '230208', label: '梅里斯达斡尔族区' },
          { value: '230221', label: '龙江县' },
          { value: '230223', label: '依安县' },
          { value: '230224', label: '泰来县' },
          { value: '230225', label: '甘南县' },
          { value: '230227', label: '富裕县' },
          { value: '230229', label: '克山县' },
          { value: '230230', label: '克东县' },
          { value: '230231', label: '拜泉县' },
          { value: '230281', label: '讷河市' }
        ]
      }
    ]
  },
  {
    value: '22',
    label: '吉林省',
    children: [
      {
        value: '2201',
        label: '长春市',
        children: [
          { value: '220102', label: '南关区' },
          { value: '220103', label: '宽城区' },
          { value: '220104', label: '朝阳区' },
          { value: '220105', label: '二道区' },
          { value: '220106', label: '绿园区' },
          { value: '220112', label: '双阳区' },
          { value: '220113', label: '九台区' },
          { value: '220122', label: '农安县' },
          { value: '220182', label: '榆树市' },
          { value: '220183', label: '德惠市' }
        ]
      },
      {
        value: '2202',
        label: '吉林市',
        children: [
          { value: '220202', label: '昌邑区' },
          { value: '220203', label: '龙潭区' },
          { value: '220204', label: '船营区' },
          { value: '220211', label: '丰满区' },
          { value: '220221', label: '永吉县' },
          { value: '220281', label: '蛟河市' },
          { value: '220282', label: '桦甸市' },
          { value: '220283', label: '舒兰市' },
          { value: '220284', label: '磐石市' }
        ]
      }
    ]
  },
  {
    value: '21',
    label: '辽宁省',
    children: [
      {
        value: '2101',
        label: '沈阳市',
        children: [
          { value: '210102', label: '和平区' },
          { value: '210103', label: '沈河区' },
          { value: '210104', label: '大东区' },
          { value: '210105', label: '皇姑区' },
          { value: '210106', label: '铁西区' },
          { value: '210111', label: '苏家屯区' },
          { value: '210112', label: '浑南区' },
          { value: '210113', label: '沈北新区' },
          { value: '210114', label: '于洪区' },
          { value: '210115', label: '辽中区' },
          { value: '210123', label: '康平县' },
          { value: '210124', label: '法库县' },
          { value: '210181', label: '新民市' }
        ]
      }
    ]
  },
  {
    value: '51',
    label: '四川省',
    children: [
      {
        value: '5101',
        label: '成都市',
        children: [
          { value: '510104', label: '锦江区' },
          { value: '510105', label: '青羊区' },
          { value: '510106', label: '金牛区' },
          { value: '510107', label: '武侯区' },
          { value: '510108', label: '成华区' },
          { value: '510112', label: '龙泉驿区' },
          { value: '510113', label: '青白江区' },
          { value: '510114', label: '新都区' },
          { value: '510115', label: '温江区' },
          { value: '510116', label: '双流区' },
          { value: '510117', label: '郫都区' },
          { value: '510118', label: '新津区' },
          { value: '510121', label: '金堂县' },
          { value: '510129', label: '大邑县' },
          { value: '510131', label: '蒲江县' },
          { value: '510181', label: '都江堰市' },
          { value: '510182', label: '彭州市' },
          { value: '510183', label: '邛崃市' },
          { value: '510184', label: '崇州市' },
          { value: '510185', label: '简阳市' }
        ]
      },
      {
        value: '5103',
        label: '自贡市',
        children: [
          { value: '510302', label: '自流井区' },
          { value: '510303', label: '贡井区' },
          { value: '510304', label: '大安区' },
          { value: '510311', label: '沿滩区' },
          { value: '510321', label: '荣县' },
          { value: '510322', label: '富顺县' }
        ]
      },
      {
        value: '5104',
        label: '攀枝花市',
        children: [
          { value: '510402', label: '东区' },
          { value: '510403', label: '西区' },
          { value: '510411', label: '仁和区' },
          { value: '510421', label: '米易县' },
          { value: '510422', label: '盐边县' }
        ]
      },
      {
        value: '5105',
        label: '泸州市',
        children: [
          { value: '510502', label: '江阳区' },
          { value: '510503', label: '纳溪区' },
          { value: '510504', label: '龙马潭区' },
          { value: '510521', label: '泸县' },
          { value: '510522', label: '合江县' },
          { value: '510524', label: '叙永县' },
          { value: '510525', label: '古蔺县' }
        ]
      },
      {
        value: '5106',
        label: '德阳市',
        children: [
          { value: '510603', label: '旌阳区' },
          { value: '510604', label: '罗江区' },
          { value: '510623', label: '中江县' },
          { value: '510681', label: '广汉市' },
          { value: '510682', label: '什邡市' },
          { value: '510683', label: '绵竹市' }
        ]
      },
      {
        value: '5107',
        label: '绵阳市',
        children: [
          { value: '510703', label: '涪城区' },
          { value: '510704', label: '游仙区' },
          { value: '510705', label: '安州区' },
          { value: '510722', label: '三台县' },
          { value: '510723', label: '盐亭县' },
          { value: '510725', label: '梓潼县' },
          { value: '510726', label: '北川羌族自治县' },
          { value: '510727', label: '平武县' },
          { value: '510781', label: '江油市' }
        ]
      },
      {
        value: '5108',
        label: '广元市',
        children: [
          { value: '510802', label: '利州区' },
          { value: '510811', label: '昭化区' },
          { value: '510812', label: '朝天区' },
          { value: '510821', label: '旺苍县' },
          { value: '510822', label: '青川县' },
          { value: '510823', label: '剑阁县' },
          { value: '510824', label: '苍溪县' }
        ]
      },
      {
        value: '5109',
        label: '遂宁市',
        children: [
          { value: '510903', label: '船山区' },
          { value: '510904', label: '安居区' },
          { value: '510921', label: '蓬溪县' },
          { value: '510923', label: '大英县' },
          { value: '510981', label: '射洪市' }
        ]
      },
      {
        value: '5110',
        label: '内江市',
        children: [
          { value: '511002', label: '市中区' },
          { value: '511011', label: '东兴区' },
          { value: '511024', label: '威远县' },
          { value: '511025', label: '资中县' },
          { value: '511083', label: '隆昌市' }
        ]
      },
      {
        value: '5111',
        label: '乐山市',
        children: [
          { value: '511102', label: '市中区' },
          { value: '511111', label: '沙湾区' },
          { value: '511112', label: '五通桥区' },
          { value: '511113', label: '金口河区' },
          { value: '511123', label: '犍为县' },
          { value: '511124', label: '井研县' },
          { value: '511126', label: '夹江县' },
          { value: '511129', label: '沐川县' },
          { value: '511132', label: '峨边彝族自治县' },
          { value: '511133', label: '马边彝族自治县' },
          { value: '511181', label: '峨眉山市' }
        ]
      },
      {
        value: '5113',
        label: '南充市',
        children: [
          { value: '511302', label: '顺庆区' },
          { value: '511303', label: '高坪区' },
          { value: '511304', label: '嘉陵区' },
          { value: '511321', label: '南部县' },
          { value: '511322', label: '营山县' },
          { value: '511323', label: '蓬安县' },
          { value: '511324', label: '仪陇县' },
          { value: '511325', label: '西充县' },
          { value: '511381', label: '阆中市' }
        ]
      },
      {
        value: '5114',
        label: '眉山市',
        children: [
          { value: '511402', label: '东坡区' },
          { value: '511403', label: '彭山区' },
          { value: '511421', label: '仁寿县' },
          { value: '511423', label: '洪雅县' },
          { value: '511424', label: '丹棱县' },
          { value: '511425', label: '青神县' }
        ]
      },
      {
        value: '5115',
        label: '宜宾市',
        children: [
          { value: '511502', label: '翠屏区' },
          { value: '511503', label: '南溪区' },
          { value: '511504', label: '叙州区' },
          { value: '511523', label: '江安县' },
          { value: '511524', label: '长宁县' },
          { value: '511525', label: '高县' },
          { value: '511526', label: '珙县' },
          { value: '511527', label: '筠连县' },
          { value: '511528', label: '兴文县' },
          { value: '511529', label: '屏山县' }
        ]
      },
      {
        value: '5116',
        label: '广安市',
        children: [
          { value: '511602', label: '广安区' },
          { value: '511603', label: '前锋区' },
          { value: '511621', label: '岳池县' },
          { value: '511622', label: '武胜县' },
          { value: '511623', label: '邻水县' },
          { value: '511681', label: '华蓥市' }
        ]
      },
      {
        value: '5117',
        label: '达州市',
        children: [
          { value: '511702', label: '通川区' },
          { value: '511703', label: '达川区' },
          { value: '511722', label: '宣汉县' },
          { value: '511723', label: '开江县' },
          { value: '511724', label: '大竹县' },
          { value: '511725', label: '渠县' },
          { value: '511781', label: '万源市' }
        ]
      },
      {
        value: '5118',
        label: '雅安市',
        children: [
          { value: '511802', label: '雨城区' },
          { value: '511803', label: '名山区' },
          { value: '511822', label: '荥经县' },
          { value: '511823', label: '汉源县' },
          { value: '511824', label: '石棉县' },
          { value: '511825', label: '天全县' },
          { value: '511826', label: '芦山县' },
          { value: '511827', label: '宝兴县' }
        ]
      },
      {
        value: '5119',
        label: '巴中市',
        children: [
          { value: '511902', label: '巴州区' },
          { value: '511903', label: '恩阳区' },
          { value: '511921', label: '通江县' },
          { value: '511922', label: '南江县' },
          { value: '511923', label: '平昌县' }
        ]
      },
      {
        value: '5120',
        label: '资阳市',
        children: [
          { value: '512002', label: '雁江区' },
          { value: '512021', label: '安岳县' },
          { value: '512022', label: '乐至县' }
        ]
      },
      {
        value: '5132',
        label: '阿坝藏族羌族自治州',
        children: [
          { value: '513201', label: '马尔康市' },
          { value: '513221', label: '汶川县' },
          { value: '513222', label: '理县' },
          { value: '513223', label: '茂县' },
          { value: '513224', label: '松潘县' },
          { value: '513225', label: '九寨沟县' },
          { value: '513226', label: '金川县' },
          { value: '513227', label: '小金县' },
          { value: '513228', label: '黑水县' },
          { value: '513230', label: '壤塘县' },
          { value: '513231', label: '阿坝县' },
          { value: '513232', label: '若尔盖县' },
          { value: '513233', label: '红原县' }
        ]
      },
      {
        value: '5133',
        label: '甘孜藏族自治州',
        children: [
          { value: '513301', label: '康定市' },
          { value: '513322', label: '泸定县' },
          { value: '513323', label: '丹巴县' },
          { value: '513324', label: '九龙县' },
          { value: '513325', label: '雅江县' },
          { value: '513326', label: '道孚县' },
          { value: '513327', label: '炉霍县' },
          { value: '513328', label: '甘孜县' },
          { value: '513329', label: '新龙县' },
          { value: '513330', label: '德格县' },
          { value: '513331', label: '白玉县' },
          { value: '513332', label: '石渠县' },
          { value: '513333', label: '色达县' },
          { value: '513334', label: '理塘县' },
          { value: '513335', label: '巴塘县' },
          { value: '513336', label: '乡城县' },
          { value: '513337', label: '稻城县' },
          { value: '513338', label: '得荣县' }
        ]
      },
      {
        value: '5134',
        label: '凉山彝族自治州',
        children: [
          { value: '513401', label: '西昌市' },
          { value: '513422', label: '木里藏族自治县' },
          { value: '513423', label: '盐源县' },
          { value: '513424', label: '德昌县' },
          { value: '513425', label: '会理县' },
          { value: '513426', label: '会东县' },
          { value: '513427', label: '宁南县' },
          { value: '513428', label: '普格县' },
          { value: '513429', label: '布拖县' },
          { value: '513430', label: '金阳县' },
          { value: '513431', label: '昭觉县' },
          { value: '513432', label: '喜德县' },
          { value: '513433', label: '冕宁县' },
          { value: '513434', label: '越西县' },
          { value: '513435', label: '甘洛县' },
          { value: '513436', label: '美姑县' },
          { value: '513437', label: '雷波县' }
        ]
      }
    ]
  },
  {
    value: '65',
    label: '新疆维吾尔自治区',
    children: [
      {
        value: '6501',
        label: '乌鲁木齐市',
        children: [
          { value: '650102', label: '天山区' },
          { value: '650103', label: '沙依巴克区' },
          { value: '650104', label: '新市区' },
          { value: '650105', label: '水磨沟区' },
          { value: '650106', label: '头屯河区' },
          { value: '650107', label: '达坂城区' },
          { value: '650109', label: '米东区' },
          { value: '650121', label: '乌鲁木齐县' }
        ]
      },
      {
        value: '6502',
        label: '克拉玛依市',
        children: [
          { value: '650202', label: '独山子区' },
          { value: '650203', label: '克拉玛依区' },
          { value: '650204', label: '白碱滩区' },
          { value: '650205', label: '乌尔禾区' }
        ]
      },
      {
        value: '6504',
        label: '吐鲁番市',
        children: [
          { value: '650402', label: '高昌区' },
          { value: '650421', label: '鄯善县' },
          { value: '650422', label: '托克逊县' }
        ]
      },
      {
        value: '6505',
        label: '哈密市',
        children: [
          { value: '650502', label: '伊州区' },
          { value: '650521', label: '巴里坤哈萨克自治县' },
          { value: '650522', label: '伊吾县' }
        ]
      }
    ]
  }
];

// 辅助函数：获取所有省份的行政区划代码
export function getAllRegionCodes(): string[] {
  const codes: string[] = [];
  regionData.forEach((province: RegionOption) => {
    province.children?.forEach((city: RegionOption) => {
      city.children?.forEach((district: RegionOption) => {
        codes.push(district.value);
      });
    });
  });
  return codes;
}

// 辅助函数：根据区划代码获取完整的地址名称
export function getFullAddressName(code: string): string[] {
  const province = regionData.find((p: RegionOption) => code.startsWith(p.value));
  if (!province) return [];
  
  const city = province.children?.find((c: RegionOption) => code.startsWith(c.value));
  if (!city) return [province.label];
  
  const district = city.children?.find((d: RegionOption) => code === d.value);
  if (!district) return [province.label, city.label];
  
  return [province.label, city.label, district.label];
}

// 优化获取地区名称的函数
export const getAreaName = (code: string): string => {
  const provinceCode = code.substring(0, 2);
  const cityCode = code.substring(0, 4);
  const areaCode = code;

  let result = '';
  
  // 查找省份
  const province = regionData.find((p: RegionOption) => p.value === provinceCode);
  if (!province) return '未知地区';
  result += province.label;

  // 查找城市
  const city = province.children?.find((c: RegionOption) => c.value === cityCode);
  if (!city) return result;
  result += city.label;

  // 查找区县
  const area = city.children?.find((a: RegionOption) => a.value === areaCode);
  if (!area) return result;
  result += area.label;

  return result;
};

// 用于校验地区码是否有效
export const areaCodeMap = new Map<string, boolean>()

// 初始化地区码映射
const initAreaCodeMap = () => {
  const processChildren = (children: any[]) => {
    children.forEach(item => {
      if (item.children) {
        processChildren(item.children)
      } else {
        areaCodeMap.set(item.value, true)
      }
    })
  }

  regionData.forEach(province => {
    if (province.children) {
      processChildren(province.children)
    }
  })
}

// 确保在导出前初始化
initAreaCodeMap()

// 导出校验地区码的函数
export const isValidAreaCode = (code: string): boolean => {
  return areaCodeMap.has(code)
}