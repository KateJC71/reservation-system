import React, { useState, useEffect } from 'react';
import { MountainSnow } from 'lucide-react';
import { submitReservation } from '../services/api';

const initialPerson = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  footSize: '',
  level: '',
  skiType: '',
  boardType: '',
  equipType: '',
  clothingType: '',
  helmetOnly: '',
  fastWear: '',
};

const levels = ['初學者', '經驗者', '黑線順滑'];
const skiTypes = ['單板', '雙板'];
const boardTypes = ['一般標準板', '進階板(紅線順滑)', '粉雪板(全山滑行)'];
const equipTypes = ['大全配 (板+靴+雪衣&雪褲+安全帽)', '板+靴', '僅租雪板'];
const clothingTypes = ['單租雪衣', '單租雪褲', '租一整套(雪衣及雪褲)', '否'];
const yesNo = ['是', '否'];
const storeOptions = ['富良野店', '旭川店'];

// 價格表型別定義
interface PriceTable {
  adult: {
    standard: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    advanced: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    powder: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    boots: number[];
    clothingSet: number[];
    clothingSingle: number[];
  };
  child: {
    standard: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    boots: number[];
    clothingSet: number[];
    clothingSingle: number[];
  };
  helmet: number[];
  pole: number[];
  fase: number[];
  crossReturn: number;
}

const priceTable: PriceTable = {
  adult: {
    standard: {
      '大全配':    [12000, 18000, 23000, 28000, 33000, 4000],
      '板靴組':    [8000, 14000, 19000, 24000, 29000, 4000],
      '單租雪板':  [6500, 11500, 16500, 21500, 26500, 4000],
    },
    advanced: {
      '大全配':    [14000, 21500, 28000, 34500, 41000, 5000],
      '板靴組':    [10000, 17500, 24500, 31500, 37000, 5000],
      '單租雪板':  [8500, 15000, 21500, 28000, 34500, 5000],
    },
    powder: {
      '大全配':    [16500, 26000, 34000, 42000, 50000, 6500],
      '板靴組':    [12500, 22000, 30000, 38000, 46000, 6500],
      '單租雪板':  [11000, 19000, 26500, 34000, 42000, 6500],
    },
    boots: [3500, 5500, 7500, 9000, 10500, 1000],
    clothingSet: [5000, 9000, 10500, 12000, 14000, 1500],
    clothingSingle: [3000, 5000, 6500, 8000, 9500, 700],
  },
  child: {
    standard: {
      '大全配':    [9000, 13000, 16000, 19000, 22000, 3000],
      '板靴組':    [6000, 10000, 13000, 16000, 19000, 3000],
      '單租雪板':  [5000, 8500, 11500, 14500, 17500, 3000],
    },
    boots: [2800, 4400, 6000, 7200, 8400, 800],
    clothingSet: [3000, 5000, 6000, 7000, 9500, 700],
    clothingSingle: [2000, 3500, 4000, 4500, 5500, 400],
  },
  helmet: [1500, 2500, 3500, 4000, 4500, 500],
  pole: [500, 1000, 1200, 1400, 1900, 100],
  fase: [2000, 2000, 2000, 2000, 2000, 2000],
  crossReturn: 3000,
};

function getDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 1;
}

function getPriceIndex(days: number) {
  if (days <= 1) return 0;
  if (days === 2) return 1;
  if (days === 3) return 2;
  if (days === 4) return 3;
  if (days === 5) return 4;
  return 4; // 5天以上先用5天價，追加天數另外加
}

// 檢查未填欄位，回傳未填欄位名稱陣列
function getMissingFields(person: any) {
  const requiredFields = [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年齡' },
    { key: 'gender', label: '性別' },
    { key: 'height', label: '身高' },
    { key: 'weight', label: '體重' },
    { key: 'footSize', label: '腳尺寸' },
    { key: 'level', label: '滑雪程度' },
    { key: 'skiType', label: '滑雪種類' },
    { key: 'boardType', label: '雪板類型' },
    { key: 'equipType', label: '裝備類型' },
  ];
  // 若不是大全配，才檢查雪衣/安全帽
  if (!person.equipType || !person.equipType.includes('大全配')) {
    requiredFields.push({ key: 'clothingType', label: '是否需要單租雪衣' });
    requiredFields.push({ key: 'helmetOnly', label: '單租安全帽' });
  }
  requiredFields.push({ key: 'fastWear', label: '是否升級Fase快穿裝備' });

  // 新增 debug 輸出
  requiredFields.forEach(f => {
    console.log(`欄位: ${f.key}, 值:`, person[f.key]);
  });

  return requiredFields.filter(f => !person[f.key]).map(f => f.label);
}

// 幫助函式：取得中文明細名稱
function getItemLabel(p: any, days: number) {
  // 主裝備
  let equipLabel = '';
  if (p.equipType.includes('大全配')) {
    if (p.boardType.includes('進階')) equipLabel = '進階大全配';
    else if (p.boardType.includes('粉雪')) equipLabel = '粉雪大全配';
    else equipLabel = '標準大全配';
  } else if (p.equipType.includes('板+靴') || p.equipType.includes('板靴組')) {
    if (p.boardType.includes('進階')) equipLabel = '進階板靴組';
    else if (p.boardType.includes('粉雪')) equipLabel = '粉雪板靴組';
    else equipLabel = '標準板靴組';
  } else if (p.equipType.includes('僅租雪板')) {
    if (p.boardType.includes('進階')) equipLabel = '進階僅租雪板';
    else if (p.boardType.includes('粉雪')) equipLabel = '粉雪僅租雪板';
    else equipLabel = '標準僅租雪板';
  }
  // 其他
  const clothingLabel = (p.clothingType && p.clothingType !== '否') ? p.clothingType : '';
  const helmetLabel = p.helmetOnly === '是' ? '單租安全帽' : '';
  const faseLabel = p.fastWear === '是' ? 'Fase快穿' : '';
  return { equipLabel, clothingLabel, helmetLabel, faseLabel, days };
}

const Reservation: React.FC = () => {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [people, setPeople] = useState(1);
  const [persons, setPersons] = useState([{ ...initialPerson }]);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(0);
  const [detail, setDetail] = useState<any[]>([]);
  const [rentStore, setRentStore] = useState('');
  const [returnStore, setReturnStore] = useState('');

  // 每次進入頁面時自動重設所有欄位（包含 applicant）
  useEffect(() => {
    setError(''); // 確保每次進入頁面時先清空錯誤訊息
    setStep(1);
    setStartDate('');
    setEndDate('');
    setPeople(1);
    setPersons([{ ...initialPerson }]);
    setRentStore('');
    setReturnStore('');
    setPrice(0);
    setDetail([]);
    setApplicant({
      name: '',
      countryCode: '+81',
      phone: '',
      email: '',
      messenger: '',
      messengerId: '',
      hotel: '',
      shuttle: [],
      shuttleMode: 'none',
    });
  }, []);

  // 自動計算價格與清空錯誤訊息
  useEffect(() => {
    setError('');
    calcPrice();
  }, [persons, startDate, endDate, rentStore, returnStore]);

  // 動態調整人數
  const handlePeopleChange = (val: number) => {
    setPeople(val);
    if (val > persons.length) {
      setPersons([...persons, ...Array(val - persons.length).fill(initialPerson).map(() => ({ ...initialPerson }))]);
    } else {
      setPersons(persons.slice(0, val));
    }
  };

  // 處理每位租借者欄位變動
  const handlePersonChange = (idx: number, key: string, value: string) => {
    setPersons(prev => {
      const updated = [...prev];
      let person = { ...updated[idx], [key]: value };
      // 若選擇大全配，自動設否並禁用雪衣/安全帽
      if (key === 'equipType') {
        if (value.includes('大全配')) {
          person = { ...person, clothingType: '否', helmetOnly: '否' };
        }
      }
      updated[idx] = person;
      return updated;
    });
  };

  // 驗證表單
  const validate = () => {
    if (!startDate || !endDate) return '請選擇日期';
    // 允許同一天，不再檢查 endDate > startDate
    if (!rentStore || !returnStore) return '請選擇租借地點與歸還地點';
    for (let i = 0; i < persons.length; i++) {
      const p = persons[i];
      for (const key in initialPerson) {
        if (!p[key as keyof typeof initialPerson]) return `第${i + 1}位租借者有未填欄位`;
      }
    }
    return '';
  };

  // 價格計算主邏輯
  const calcPrice = () => {
    const days = getDays(startDate, endDate);
    const priceIdx = getPriceIndex(days);
    const extraDays = days > 5 ? days - 5 : 0;
    console.log('天數', days);
    console.log('板靴組價格表', priceTable.adult.standard['板靴組']);
    console.log('取用價格索引', priceIdx);
    let total = 0;
    let detailList: any[] = [];
    const isCrossStore = rentStore && returnStore && rentStore !== returnStore;
    persons.forEach((p, idx) => {
      const age = parseInt(p.age, 10);
      const isChild = age <= 13;
      let group = isChild ? 'child' : 'adult';
      let equipType = '';
      if (p.equipType.includes('大全配')) equipType = '大全配';
      else if (p.equipType.includes('板+靴') || p.equipType.includes('板靴組')) equipType = '板靴組';
      else equipType = '單租雪板';
      // 雪板類型
      let boardCat = 'standard';
      if (p.boardType.includes('進階')) boardCat = 'advanced';
      if (p.boardType.includes('粉雪')) boardCat = 'powder';
      // 主裝備
      let main = 0;
      if (group === 'adult') {
        const boardCatKey = boardCat as 'standard' | 'advanced' | 'powder';
        if (equipType in priceTable.adult[boardCatKey]) {
          main = (priceTable.adult[boardCatKey][equipType as '大全配' | '板靴組' | '單租雪板'][priceIdx] ?? 0)
            + (extraDays > 0 ? (priceTable.adult[boardCatKey][equipType as '大全配' | '板靴組' | '單租雪板'][5] ?? 0) * extraDays : 0);
        }
      } else {
        if (equipType in priceTable.child.standard) {
          main = (priceTable.child.standard[equipType as '大全配' | '板靴組' | '單租雪板'][priceIdx] ?? 0)
            + (extraDays > 0 ? (priceTable.child.standard[equipType as '大全配' | '板靴組' | '單租雪板'][5] ?? 0) * extraDays : 0);
        }
      }
      // 雪靴
      let boots = 0;
      // 只有未來有單租雪靴需求時才加 boots，板靴組已含雪靴
      // if (equipType === '板靴組') {
      //   boots = isChild ? priceTable.child.boots[priceIdx] + (extraDays > 0 ? priceTable.child.boots[5] * extraDays : 0)
      //                   : priceTable.adult.boots[priceIdx] + (extraDays > 0 ? priceTable.adult.boots[5] * extraDays : 0);
      // }
      // 雪衣褲
      let clothing = 0;
      if (p.clothingType === '租一整套(雪衣及雪褲)') {
        clothing = isChild ? priceTable.child.clothingSet[priceIdx] + (extraDays > 0 ? priceTable.child.clothingSet[5] * extraDays : 0)
                           : priceTable.adult.clothingSet[priceIdx] + (extraDays > 0 ? priceTable.adult.clothingSet[5] * extraDays : 0);
      } else if (p.clothingType === '單租雪衣' || p.clothingType === '單租雪褲') {
        clothing = isChild ? priceTable.child.clothingSingle[priceIdx] + (extraDays > 0 ? priceTable.child.clothingSingle[5] * extraDays : 0)
                           : priceTable.adult.clothingSingle[priceIdx] + (extraDays > 0 ? priceTable.adult.clothingSingle[5] * extraDays : 0);
      }
      // 安全帽
      let helmet = 0;
      if (p.helmetOnly === '是') {
        helmet = priceTable.helmet[priceIdx] + (extraDays > 0 ? priceTable.helmet[5] * extraDays : 0);
      }
      // 雪杖（如需）
      // let pole = 0; // 可依需求加上
      // Fase快穿
      let fase = 0;
      if (p.fastWear === '是') {
        fase = priceTable.fase[priceIdx] + (extraDays > 0 ? priceTable.fase[5] * extraDays : 0);
      }
      // 甲地租乙地還
      let cross = 0;
      if (isCrossStore) cross = 3000;
      const subtotal = main + boots + clothing + helmet + fase + cross;
      total += subtotal;
      detailList.push({
        idx: idx + 1,
        group: isChild ? '兒童' : '成人',
        main, boots, clothing, helmet, fase, cross, subtotal,
        ...p,
      });
    });
    setPrice(total);
    setDetail(detailList);
  };

  // 調整 step 流程：step 1 日期地點 → step 2 申請人 → step 3 人數與租借者 → step 4 預覽
  // 驗證 applicant 必填欄位
  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      // 第一步只檢查日期
      if (!startDate || !endDate) {
        setError('請選擇完整日期');
        return;
      }
      // 允許同一天，不再檢查 endDate > startDate
      if (!rentStore || !returnStore) {
        setError('請選擇租借地點與歸還地點');
        return;
      }
      setStep(step + 1);
      return;
    }
    if (step === 2) {
      // debug: 輸出每個欄位的 key 與值
      console.log('申請人資料驗證：');
      Object.entries(applicant).forEach(([k, v]) => {
        console.log(`${k}:`, v);
      });
      if (!applicant.name || !applicant.phone || !applicant.email || !applicant.messenger || !applicant.messengerId || !applicant.hotel) {
        setError('請完整填寫申請人資料');
        return;
      }
      // shuttleMode 不需驗證 shuttle 細項
      setStep(step + 1);
      return;
    }
    // 第三步才檢查租借者欄位
    for (let i = 0; i < persons.length; i++) {
      const missing = getMissingFields(persons[i]);
      console.log(`第${i + 1}位租借者`, persons[i]);
      console.log(`缺漏欄位`, missing);
      if (missing.length > 0) {
        setError(`第${i + 1}位租借者「${missing.join('、')}」未填`);
        return;
      }
    }
    setStep(step + 1);
  };

  // 上一步
  const handlePrev = () => setStep(step - 1);

  // 送出預約（這裡僅顯示總價，實際可串接API）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        applicant,
        persons,
        startDate,
        endDate,
        rentStore,
        returnStore,
        price,
        detail,
      };
      await submitReservation(payload);
      setStep(5);
    } catch (err) {
      setError('送出失敗，請稍後再試');
    }
  };

  // 國碼選項改為 emoji 國旗+國碼
  const countryCodes = [
    { code: '+886', label: '🇹🇼 +886' },
    { code: '+81', label: '🇯🇵 +81' },
    { code: '+852', label: '🇭🇰 +852' },
    { code: '+86', label: '🇨🇳 +86' },
    { code: '+1', label: '🇺🇸 +1' },
    { code: '+44', label: '🇬🇧 +44' },
    { code: '+61', label: '🇦🇺 +61' },
    { code: '+64', label: '🇳🇿 +64' },
    { code: '+65', label: '🇸🇬 +65' },
    { code: '+60', label: '🇲🇾 +60' },
  ];
  const messengerTypes = ['Whatsapp', 'Wechat', 'Line'];
  // shuttleOptions 分組
  const shuttlePickOptions = [
    '租借日:飯店到雪具店',
    '租借日:雪具店到雪場',
  ];
  const shuttleDropOptions = [
    '歸還日:雪場到雪具店',
    '雪具店到飯店',
  ];

  // 申請人接送需求分兩層：第一排單選『不須接送』『需要接送』，選『需要接送』時才顯示下方複選
  const [applicant, setApplicant] = useState<{
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    messenger: string;
    messengerId: string;
    hotel: string;
    shuttle: string[];
    shuttleMode: 'none' | 'need';
  }>(
    {
      name: '',
      countryCode: '+81',
      phone: '',
      email: '',
      messenger: '',
      messengerId: '',
      hotel: '',
      shuttle: [],
      shuttleMode: 'none',
    }
  );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-snow-900 mb-8 text-center">雪具預約</h1>
      <div className="card">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-snow-700 mb-2">開始日期</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-snow-700 mb-2">結束日期</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" min={startDate || new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1">租借地點</label>
                <select className="input" value={rentStore} onChange={e => setRentStore(e.target.value)} required>
                  <option value="" disabled style={{ color: '#aaa' }}>請選擇租借地點</option>
                  {storeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">歸還地點</label>
                <select className="input" value={returnStore} onChange={e => setReturnStore(e.target.value)} required>
                  <option value="" disabled style={{ color: '#aaa' }}>請選擇歸還地點</option>
                  {storeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <input className="input" placeholder="申請人姓名" value={applicant.name} onChange={e => setApplicant({ ...applicant, name: e.target.value })} required />
              <div className="flex gap-2">
                <select className="input w-28" value={applicant.countryCode} onChange={e => setApplicant({ ...applicant, countryCode: e.target.value })}>
                  {countryCodes.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                </select>
                <input className="input flex-1" placeholder="電話" value={applicant.phone} onChange={e => setApplicant({ ...applicant, phone: e.target.value })} required />
              </div>
              <input className="input" placeholder="Email" type="email" value={applicant.email} onChange={e => setApplicant({ ...applicant, email: e.target.value })} required />
              <div className="flex gap-2">
                <select className="input w-32" value={applicant.messenger} onChange={e => setApplicant({ ...applicant, messenger: e.target.value })} required>
                  <option value="">通訊軟體</option>
                  {messengerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className="input flex-1" placeholder="通訊軟體ID" value={applicant.messengerId} onChange={e => setApplicant({ ...applicant, messengerId: e.target.value })} required />
              </div>
              <input className="input" placeholder="住宿飯店名稱或地址" value={applicant.hotel} onChange={e => setApplicant({ ...applicant, hotel: e.target.value })} required />
              <div>
                <label className="block mb-1">是否需要接送</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={applicant.shuttleMode === 'none'}
                      onChange={() => setApplicant({ ...applicant, shuttleMode: 'none', shuttle: [] })}
                    />
                    不須接送
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={applicant.shuttleMode === 'need'}
                      onChange={() => setApplicant({ ...applicant, shuttleMode: 'need', shuttle: [] })}
                    />
                    需要接送
                  </label>
                </div>
                {applicant.shuttleMode === 'need' && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="font-semibold">接：</span>
                      {shuttlePickOptions.map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={applicant.shuttle.includes(opt)}
                            onChange={e => {
                              let newShuttle = applicant.shuttle.filter(s => s !== '不須接送');
                              if (e.target.checked) newShuttle = [...newShuttle, opt];
                              else newShuttle = newShuttle.filter(s => s !== opt);
                              setApplicant({ ...applicant, shuttle: newShuttle });
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="font-semibold">送：</span>
                      {shuttleDropOptions.map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={applicant.shuttle.includes(opt)}
                            onChange={e => {
                              let newShuttle = applicant.shuttle.filter(s => s !== '不須接送');
                              if (e.target.checked) newShuttle = [...newShuttle, opt];
                              else newShuttle = newShuttle.filter(s => s !== opt);
                              setApplicant({ ...applicant, shuttle: newShuttle });
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-8">
              {persons.map((p, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-2 bg-snow-50">
                  <div className="font-semibold mb-2">第 {idx + 1} 位租借者</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input className="input" placeholder="姓名" value={p.name} onChange={e => handlePersonChange(idx, 'name', e.target.value)} required />
                    <input className="input" placeholder="年齡" type="number" min={1} max={100} value={p.age} onChange={e => handlePersonChange(idx, 'age', e.target.value)} required />
                    <select className="input" value={p.gender} onChange={e => handlePersonChange(idx, 'gender', e.target.value)} required>
                      <option value="">性別</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                    <input className="input" placeholder="身高 (cm)" type="number" min={50} max={250} value={p.height} onChange={e => handlePersonChange(idx, 'height', e.target.value)} required />
                    <input className="input" placeholder="體重 (kg)" type="number" min={10} max={200} value={p.weight} onChange={e => handlePersonChange(idx, 'weight', e.target.value)} required />
                    <input className="input" placeholder="腳的尺寸 (cm)" type="number" min={15} max={35} value={p.footSize} onChange={e => handlePersonChange(idx, 'footSize', e.target.value)} required />
                    <select className="input" value={p.level} onChange={e => handlePersonChange(idx, 'level', e.target.value)} required>
                      <option value="">滑雪程度</option>
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select className="input" value={p.skiType} onChange={e => handlePersonChange(idx, 'skiType', e.target.value)} required>
                      <option value="">滑雪種類</option>
                      {skiTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.boardType} onChange={e => handlePersonChange(idx, 'boardType', e.target.value)} required>
                      <option value="">欲租用雪板類型</option>
                      {boardTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.equipType} onChange={e => handlePersonChange(idx, 'equipType', e.target.value)} required>
                      <option value="">租用裝備類型</option>
                      {equipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.clothingType} onChange={e => handlePersonChange(idx, 'clothingType', e.target.value)} required disabled={p.equipType.includes('大全配')}>
                      <option value="">是否要另外租借雪衣褲</option>
                      {clothingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.helmetOnly} onChange={e => handlePersonChange(idx, 'helmetOnly', e.target.value)} required disabled={p.equipType.includes('大全配')}>
                      <option value="">單租安全帽</option>
                      {yesNo.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.fastWear} onChange={e => handlePersonChange(idx, 'fastWear', e.target.value)} required>
                      <option value="">是否升級Fase快穿裝備</option>
                      {yesNo.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-snow-900">預約資料確認</h2>
              <div>
                <div className="mb-2">租借日期：{startDate} ~ {endDate}</div>
                <div className="mb-2">人數：{people}</div>
                <div className="mb-2">總價：<span className="text-primary-600 font-bold">¥ {price}</span></div>
              </div>
              {/* 預覽頁面顯示申請人資料 */}
              <div className="mb-6">
                <div className="font-bold text-lg mb-2">申請人資料</div>
                <div>姓名：{applicant.name}</div>
                <div>電話：{applicant.countryCode} {applicant.phone}</div>
                <div>Email：{applicant.email}</div>
                <div>通訊軟體：{applicant.messenger}（ID：{applicant.messengerId}）</div>
                <div>住宿飯店：{applicant.hotel}</div>
                <div>接送需求：{applicant.shuttleMode === 'none' ? '不須接送' : (applicant.shuttle.length ? applicant.shuttle.join('、') : '未選擇')}</div>
              </div>
              <div className="space-y-4">
                {detail.map((p, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-snow-50">
                    <div className="font-semibold mb-2">第 {p.idx} 位租借者</div>
                    <div className="grid md:grid-cols-2 gap-2 text-snow-700 text-sm">
                      <div>姓名：{p.name}</div>
                      <div>年齡：{p.age}</div>
                      <div>性別：{p.gender}</div>
                      <div>身高：{p.height} cm</div>
                      <div>體重：{p.weight} kg</div>
                      <div>腳的尺寸：{p.footSize} cm</div>
                      <div>滑雪程度：{p.level}</div>
                      <div>滑雪種類：{p.skiType}</div>
                      <div>欲租用雪板類型：{p.boardType}</div>
                      <div>租用裝備類型：{p.equipType}</div>
                      <div>是否要另外租借雪衣褲：{p.clothingType}</div>
                      <div>單租安全帽：{p.helmetOnly}</div>
                      <div>是否升級Fase快穿裝備：{p.fastWear}</div>
                      {/* 價格內訳 */}
                      <div className="col-span-2 mt-2">
                        <div className="font-semibold">費用明細：</div>
                        <ul className="ml-4 list-disc">
                          {(() => {
                            const days = getDays(startDate, endDate);
                            const { equipLabel, clothingLabel, helmetLabel, faseLabel } = getItemLabel(p, days);
                            // 若主裝備已經是板靴組，不再顯示雪靴細項
                            const isBootsIncluded = equipLabel.includes('板靴組');
                            return <>
                              {equipLabel && <li>{equipLabel} {days}天：¥ {p.main}</li>}
                              {!isBootsIncluded && p.boots > 0 && <li>雪靴 {days}天：¥ {p.boots}</li>}
                              {clothingLabel && <li>{clothingLabel} {days}天：¥ {p.clothing}</li>}
                              {helmetLabel && <li>{helmetLabel} {days}天：¥ {p.helmet}</li>}
                              {faseLabel && <li>{faseLabel} {days}天：¥ {p.fase}</li>}
                              {p.cross > 0 && <li>甲地租乙地還：¥ {p.cross}</li>}
                            </>;
                          })()}
                        </ul>
                        <div className="mt-1">總價：<span className="text-primary-600 font-bold">¥ {p.subtotal}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="text-center space-y-6 py-12">
              <MountainSnow className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-primary-600">預約成功！</div>
              <div className="text-snow-700">感謝您的預約，我們會盡快與您聯繫。</div>
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex justify-between">
            {step > 1 && step < 5 && (
              <button type="button" className="btn-secondary" onClick={handlePrev}>上一步</button>
            )}
            {step < 3 && (
              <button type="button" className="btn-primary ml-auto" onClick={handleNextStep}>下一步</button>
            )}
            {step === 3 && (
              <button
                type="button"
                className="btn-primary ml-auto"
                onClick={() => {
                  console.log('persons', persons);
                  const err = validate();
                  if (err) { setError(err); return; }
                  calcPrice();
                  setStep(4);
                }}
              >
                預覽資料
              </button>
            )}
            {step === 4 && (
              <button type="submit" className="btn-primary ml-auto">確認送出</button>
            )}
          </div>
        </form>
      </div>
      {step === 4 && detail.length > 0 && (
        <div className="mt-6 text-right text-lg font-bold">
          合計總金額：¥ {detail.reduce((sum, p) => sum + (p.subtotal || 0), 0)}
        </div>
      )}
    </div>
  );
};

export default Reservation; 