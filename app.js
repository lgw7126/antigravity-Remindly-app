/* app.js - Remindly MVP Core Business Logic */

// ================= CONSTANTS & PRESETS =================
const INDUSTRY_PRESETS = {
  RESTAURANT: {
    shopName: "라 스텔라 파인다이닝",
    shopIndustry: "RESTAURANT",
    naverLink: "https://booking.naver.com/booking/6/bizes/998877",
    policyDeposit: 30000,
    policyBank: "국민은행 110-555-666777 (라 스텔라)",
    policyGrace: 15,
    policyRules: "• 예약 시간 기준 24시간 전 취소 시 전액 환불\n• 당일 취소 또는 노쇼 시 예약금(30,000원) 위약금으로 귀속되어 반환 불가\n• 예약 시간 15분 경과 시 대기 고객을 위해 예약이 자동 취소됩니다."
  },
  HAIR: {
    shopName: "살롱 드 뷰티 헤어",
    shopIndustry: "HAIR",
    naverLink: "https://booking.naver.com/booking/6/bizes/112233",
    policyDeposit: 10000,
    policyBank: "신한은행 100-222-333444 (뷰티헤어)",
    policyGrace: 10,
    policyRules: "• 예약 시간 기준 12시간 전 취소 시 전액 환불\n• 당일 직전 취소 시 50% 위약금 발생\n• 무단 불참(노쇼) 시 예약금 전액 위약금으로 귀속\n• 10분 이상 지각 시 시술 시간이 단축되거나 예약이 취소될 수 있습니다."
  },
  NAIL: {
    shopName: "멜로우 네일스튜디오",
    shopIndustry: "NAIL",
    naverLink: "https://booking.naver.com/booking/6/bizes/445566",
    policyDeposit: 20000,
    policyBank: "우리은행 1002-333-444555 (이네일)",
    policyGrace: 10,
    policyRules: "• 예약 시간 24시간 전 취소 시 예약금 100% 반환\n• 당일 취소 시 위약금 100% 적용 (예약금 반환 불가)\n• 1인샵 특성상 지각 10분 경과 시 예약은 노쇼 처리되어 자동 취소됩니다."
  },
  STUDIO: {
    shopName: "온새미로 사진스튜디오",
    shopIndustry: "STUDIO",
    naverLink: "https://booking.naver.com/booking/6/bizes/778899",
    policyDeposit: 50000,
    policyBank: "하나은행 123-456-789012 (온새미로스튜디오)",
    policyGrace: 15,
    policyRules: "• 촬영일 3일 전 취소 시 100% 환불\n• 1~2일 전 취소 시 50% 환불\n• 촬영 당일 취소 또는 노쇼 시 예약금(50,000원) 반환 절대 불가\n• 작가 준비 및 세팅을 위해 촬영 시간 10분 전 방문을 권장합니다."
  },
  CLINIC: {
    shopName: "바른정형외과의원 도수치료실",
    shopIndustry: "CLINIC",
    naverLink: "https://booking.naver.com/booking/6/bizes/554433",
    policyDeposit: 0,
    policyBank: "",
    policyGrace: 10,
    policyRules: "• 진료 예약 시간 기준 1시간 전 취소 가능\n• 잦은 당일 취소 및 노쇼(3회 이상 누적) 시 네이버 시스템을 통한 사전 예약이 제한될 수 있습니다.\n• 예약 10분 초과 시 치료사 배정이 취소되어 일반 접수로 변경됩니다."
  }
};

const SEED_RESERVATIONS = [
  {
    id: "res-1",
    name: "김철수",
    phone: "010-8888-9999",
    dateTime: "2026-06-24T13:00",
    status: "PENDING",
    depositStatus: "UNPAID",
    pastNoShow: "NO"
  },
  {
    id: "res-2",
    name: "이영희",
    phone: "010-7777-6666",
    dateTime: "2026-06-24T15:30",
    status: "CONFIRMED",
    depositStatus: "PAID",
    pastNoShow: "NO"
  },
  {
    id: "res-3",
    name: "박민수",
    phone: "010-2222-3333",
    dateTime: "2026-06-24T11:30",
    status: "PENDING",
    depositStatus: "UNPAID",
    pastNoShow: "YES"
  },
  {
    id: "res-4",
    name: "최수진",
    phone: "010-4444-5555",
    dateTime: "2026-06-25T14:00",
    status: "CONFIRMED",
    depositStatus: "PAID",
    pastNoShow: "NO"
  },
  {
    id: "res-5",
    name: "정재훈",
    phone: "010-1111-2222",
    dateTime: "2026-06-25T16:00",
    status: "CANCELLED",
    depositStatus: "UNPAID",
    pastNoShow: "NO"
  }
];

// ================= STATE MANAGEMENT =================
class AppState {
  constructor() {
    this.init();
  }

  init() {
    // Check if store info exists, otherwise seed initial data
    if (!localStorage.getItem("remindly_store")) {
      this.resetToDefaultPreset("STUDIO");
    } else {
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    this.store = JSON.parse(localStorage.getItem("remindly_store"));
    this.policies = JSON.parse(localStorage.getItem("remindly_policies"));
    this.reservations = JSON.parse(localStorage.getItem("remindly_reservations"));
    this.noShowHistory = JSON.parse(localStorage.getItem("remindly_noshow_history")) || {};
  }

  saveToStorage() {
    localStorage.setItem("remindly_store", JSON.stringify(this.store));
    localStorage.setItem("remindly_policies", JSON.stringify(this.policies));
    localStorage.setItem("remindly_reservations", JSON.stringify(this.reservations));
    localStorage.setItem("remindly_noshow_history", JSON.stringify(this.noShowHistory));
  }

  resetToDefaultPreset(presetKey) {
    const preset = INDUSTRY_PRESETS[presetKey];
    
    this.store = {
      name: preset.shopName,
      industry: preset.shopIndustry,
      naverLink: preset.naverLink
    };
    
    this.policies = {
      depositAmount: preset.policyDeposit,
      bankInfo: preset.policyBank,
      gracePeriod: preset.policyGrace,
      cancellationRules: preset.policyRules
    };

    this.noShowHistory = {};

    // Calculate dates based on current system time to make seed data look fresh
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    this.reservations = SEED_RESERVATIONS.map((res, index) => {
      let time = res.dateTime.split("T")[1];
      let isTomorrow = index >= 3;
      return {
        ...res,
        dateTime: `${isTomorrow ? tomorrowStr : todayStr}T${time}`
      };
    });

    this.saveToStorage();
  }

  addNoShowRecord(phone) {
    if (!phone) return;
    // Clean phone number (remove hyphens, spaces, etc., to make match robust)
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) return;
    this.noShowHistory[cleanPhone] = (this.noShowHistory[cleanPhone] || 0) + 1;
    this.saveToStorage();
  }

  removeNoShowRecord(phone) {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || !this.noShowHistory[cleanPhone]) return;
    this.noShowHistory[cleanPhone]--;
    if (this.noShowHistory[cleanPhone] <= 0) {
      delete this.noShowHistory[cleanPhone];
    }
    this.saveToStorage();
  }

  addReservation(res) {
    this.reservations.unshift(res);
    // If we add a reservation that has past no-show checked, we make sure it's updated correctly
    const cleanPhone = res.phone.replace(/[^0-9]/g, "");
    if (this.noShowHistory[cleanPhone] > 0) {
      res.pastNoShow = "YES";
    }
    this.saveToStorage();
  }

  updateReservationStatus(id, status) {
    const res = this.reservations.find(r => r.id === id);
    if (res) {
      const oldStatus = res.status;
      res.status = status;
      
      if (status === "CONFIRMED" && res.depositStatus === "UNPAID" && this.policies.depositAmount > 0) {
        res.depositStatus = "PAID"; // Assume paid if confirmed by customer
      }
      
      // Blacklist counting based on status change
      if (status === "NOSHOW" && oldStatus !== "NOSHOW") {
        this.addNoShowRecord(res.phone);
        res.pastNoShow = "YES";
      } else if (oldStatus === "NOSHOW" && status !== "NOSHOW") {
        this.removeNoShowRecord(res.phone);
        // Recalculate pastNoShow flag if no active history
        const cleanPhone = res.phone.replace(/[^0-9]/g, "");
        if (!this.noShowHistory[cleanPhone]) {
          res.pastNoShow = "NO";
        }
      }
      
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteReservation(id) {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      const res = this.reservations[index];
      if (res.status === "NOSHOW") {
        this.removeNoShowRecord(res.phone);
      }
      this.reservations.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  updateReservationDetails(id, details) {
    const res = this.reservations.find(r => r.id === id);
    if (res) {
      const oldPhone = res.phone;
      const newPhone = details.phone;
      
      // Adjust no-show history count if phone number changes for a NOSHOW booking
      if (res.status === "NOSHOW" && oldPhone !== newPhone) {
        this.removeNoShowRecord(oldPhone);
        this.addNoShowRecord(newPhone);
      }
      
      res.name = details.name;
      res.phone = newPhone;
      res.dateTime = details.dateTime;
      res.depositStatus = details.depositStatus;
      
      // Update pastNoShow status based on blacklist record
      const cleanPhone = newPhone.replace(/[^0-9]/g, "");
      if (this.noShowHistory[cleanPhone] > 0 || details.pastNoShow === "YES") {
        res.pastNoShow = "YES";
      } else {
        res.pastNoShow = "NO";
      }
      
      this.saveToStorage();
      return true;
    }
    return false;
  }
}

const appState = new AppState();

// ================= NO-SHOW RISK ENGINE =================
function calculateNoShowRisk(res, policies) {
  let score = 0;
  let reasons = [];

  if (res.status === "CANCELLED") {
    return { level: "SAFE", label: "취소됨", color: "muted", reasons: ["이미 취소된 예약입니다."] };
  }
  if (res.status === "CONFIRMED") {
    return { level: "SAFE", label: "방문확정", color: "success", reasons: ["고객이 방문을 직접 확정하였습니다."] };
  }
  if (res.status === "CHANGEREQUESTED") {
    return { level: "MEDIUM", label: "변경 요청 ⚠️", color: "change-requested", reasons: ["고객이 일정 조율을 요청했습니다. 조치 필요!"] };
  }
  if (res.status === "NOSHOW") {
    return { level: "HIGH", label: "노쇼 처리됨 ❌", color: "noshow", reasons: ["무단 불참으로 노쇼 등록되었습니다."] };
  }
  if (res.status === "LATE") {
    return { level: "MEDIUM", label: "지각 처리됨 ⏳", color: "late", reasons: ["지각으로 예약 지연 처리되었습니다."] };
  }

  // 1. Unpaid Deposit Risk
  if (policies.depositAmount > 0 && res.depositStatus === "UNPAID") {
    score += 40;
    reasons.push("예약금 미입금");
  }

  // 2. Past No-show record
  if (res.pastNoShow === "YES") {
    score += 50;
    reasons.push("과거 노쇼 이력");
  }

  // 3. Time proximity (Less than 24 hours to booking, and still PENDING)
  const bookingTime = new Date(res.dateTime);
  const now = new Date();
  const diffHours = (bookingTime - now) / (1000 * 60 * 60);

  if (diffHours > 0 && diffHours < 24) {
    score += 25;
    reasons.push("방문 24시간 이내 미확인");
  } else if (diffHours <= 0) {
    score += 60;
    reasons.push("예약 시간 도과 (노쇼 의심)");
  }

  if (score >= 60) {
    return { level: "HIGH", label: "노쇼 위험 높음 ⚠️", color: "danger", reasons };
  } else if (score >= 25) {
    return { level: "MEDIUM", label: "확인 대기 중 ⏳", color: "warning", reasons };
  } else {
    return { level: "LOW", label: "안전", color: "success", reasons: ["정책 기준 충족"] };
  }
}

// ================= MESSAGE COMPILER =================
function compileMessage(res, store, policies, msgType, tone) {
  const depositText = policies.depositAmount > 0 
    ? `${Number(policies.depositAmount).toLocaleString()}원` 
    : "없음";
  
  const formattedTime = formatKoreanDateTime(res.dateTime);
  const confirmLink = `${window.location.origin}${window.location.pathname}#customer?id=${res.id}`;
  
  // Auto-generate Naver Review link from booking link
  let reviewLink = "https://m.place.naver.com";
  try {
    const bizesMatch = store.naverLink.match(/bizes\/(\d+)/);
    if (bizesMatch && bizesMatch[1]) {
      reviewLink = `https://m.place.naver.com/place/${bizesMatch[1]}/review/visitor`;
    }
  } catch (e) {}

  const variables = {
    "{매장명}": store.name,
    "{예약자}": res.name,
    "{시간}": formattedTime,
    "{예약금}": depositText,
    "{계좌}": policies.bankInfo,
    "{지각시간}": `${policies.gracePeriod}분`,
    "{취소규정}": policies.cancellationRules,
    "{확인링크}": confirmLink,
    "{리뷰링크}": reviewLink,
    "{네이버예약링크}": store.naverLink
  };

  const templates = {
    CONFIRM: {
      FRIENDLY: `[${store.name}] 예약이 확정되었습니다! 😊

안녕하세요, {예약자}님!
고객님께서 예약하신 내역을 안내해 드립니다.

• 예약 일시: {시간}
• 예약금 안내: {예약금}
${policies.depositAmount > 0 ? `• 입금 계좌: {계좌}\n* 원활한 예약을 위해 1시간 이내 입금해 주시면 감사하겠습니다!` : ''}

{매장명}은 {예약자}님을 맞이하기 위해 예약 시간 동안 정성을 다해 스케줄을 비워두고 있습니다. 방문 가능 여부를 확인해 주시면 준비하는 데 큰 도움이 됩니다.

👇 아래 링크를 눌러 꼭 '방문 확정'을 진행해 주세요!
{확인링크}

• 안내 사항 및 환불 규정:
{취소규정}

항상 친절하고 아름다운 서비스로 보답하겠습니다. 예약 시간에 뵙겠습니다. 감사합니다!`,
      
      FIRM: `[${store.name}] 예약 확정 고지 및 예약금/취소 규정 안내 ⚠️

{예약자}님, 예약 신청이 접수 및 확정되었습니다.
매장 노쇼 및 지각에 따른 운영 손실 예방을 위해 다음 정책을 꼭 확인하시기 바랍니다.

• 예약 일시: {시간}
• 예약금: {예약금}
${policies.depositAmount > 0 ? `• 입금 계좌: {계좌}\n* 1시간 이내 미입금 시 예약이 통보 없이 취소될 수 있습니다.` : ''}

저희는 예약제로 운영되며, 예약 당일 부참 시 대기 고객과 매장에 손해가 발생합니다. 

👇 방문 여부를 아래 링크에서 최종 확인해 주세요. (미선택 시 개별 유선 연락이 갈 수 있습니다)
{확인링크}

• 지각 시 규정:
예약 시간 기준 {지각시간} 지각 시, 당일 시술/이용이 제한되며 위약금 규정이 적용됩니다.

• 취소 및 환불 기준:
{취소규정}`,
      
      PREMIUM: `[${store.name}] VIP 예약 확정 안내 ✨

반갑습니다, {예약자}님.
오직 한 분만을 위한 특별한 경험을 디자인하는 {매장명}입니다.
요청하신 예약 일정이 확정되었음을 기쁜 마음으로 안내해 드립니다.

• 예약 일시: {시간}
• 예약금 안내: {예약금}
${policies.depositAmount > 0 ? `• 가상계좌: {계좌}` : ''}

예약하신 시간은 오롯이 {예약자}님만을 위한 맞춤 프라이빗 세션으로 운영됩니다. 최적의 서비스를 위해 방문 확정을 사전에 체크해 주시면 감사하겠습니다.

👇 아래 링크를 터치하여 예약을 확정해 주십시오.
{확인링크}

• 노쇼 및 캔슬 규정:
{취소규정}

최고의 서비스와 힐링 타임을 제공하기 위해 온 정성을 쏟아 대기하겠습니다. 기대하시는 발걸음이 아깝지 않도록 준비하겠습니다. 감사합니다.`
    },
    REMIND_1DAY: {
      FRIENDLY: `[${store.name}] 내일 예약이 있습니다! 설레는 마음으로 기다립니다 😊

안녕하세요, {예약자}님!
내일은 {예약자}님과 만나는 날입니다. 다시 한 번 안내해 드릴게요.

• 예약 시간: 내일 {시간}
• 오시는 길: {네이버예약링크}

원활한 매장 운영을 위해 방문이 가능하신지 최종 확인이 필요합니다. 아래 확인 페이지에서 간편하게 '방문 확인'을 클릭해 주세요!

👇 방문 여부 확정하기:
{확인링크}

※ 혹시 변동 사항이 있으시면 예약 24시간 전까지 미리 조율 부탁드립니다. 건강하고 즐거운 하루 보내세요!`,
      
      FIRM: `[${store.name}] 예약 D-1 리마인드 고지 (방문 여부 미확인 안내) ⏳

{예약자}님, 내일 {시간} 예약이 있습니다.
현재까지 방문 여부가 최종 확인되지 않아 다시 한 번 고지 드립니다.

• 예약 일시: 내일 {시간}

노쇼 방지를 위해 오늘 중으로 하단 링크를 통해 반드시 방문 여부를 확정해 주시기 바랍니다. 미확인 시 자동으로 취소 대기 처리될 수 있습니다.

👇 최종 방문 의사 결정하기:
{확인링크}

• 취소 및 지각 안내:
예약 {지각시간} 경과 시 자동 노쇼 처리되며 위약금 규정에 따라 불이익이 생길 수 있습니다.`,
      
      PREMIUM: `[${store.name}] D-1 VIP 세션 리마인드 ✨

반갑습니다, {예약자}님.
내일 {시간}에 예정된 {예약자}님만의 맞춤 방문 일정을 재안내 드립니다.

• 예약 시간: 내일 {시간}

격조 높은 서비스 준비와 컨디션 관리를 위해 방문 여부를 확인해 주시면 더욱 감사하겠습니다.

👇 아래 링크를 터치하여 내일 방문 여부를 확정해 주시기 바랍니다.
{확인링크}

오시는 길 편안하도록 만반의 준비를 마치고 기다리겠습니다. 품격 있는 하루 되십시오. 감사합니다.`
    },
    REMIND_DAY: {
      FRIENDLY: `[${store.name}] 오늘 방문 안내 드립니다! ☀️

안녕하세요, {예약자}님!
오늘 드디어 뵙는 날이네요. 방문 시간 확인 부탁드립니다.

• 방문 시간: 오늘 {시간}
• 매장 오시는 길: {네이버예약링크}

조심히 방문해 주시고, 늦으실 경우 미리 연락 주시면 감사하겠습니다. 이따 뵙겠습니다!`,
      
      FIRM: `[${store.name}] 금일 예약 당일 고지 (늦지 않게 도착 부탁드립니다) 🚨

{예약자}님, 오늘 {시간} 예약이 잡혀 있습니다.

• 예약 시간: 오늘 {시간}
• 지각 규정: {지각시간} 이상 지각 시 뒷 예약 진행을 위해 당일 취소 처리되며 예약금 반환이 불가합니다.

매장 혼잡과 원활한 타임 매칭을 위해 예약 시간 5분 전까지 입실을 당부드립니다. 감사합니다.`,
      
      PREMIUM: `[${store.name}] 금일 프라이빗 예약 안내 ✨

안녕하십니까, {예약자}님.
오늘 예정된 VIP 방문 일정을 알려드립니다.

• 예약 시간: 오늘 {시간}

최고의 만족감을 선사할 프라이빗 룸 세팅과 스태프 배치가 이미 완료되었습니다. 편안한 마음으로 방문해 주시기 바랍니다. 감사합니다.`
    },
    POST_VISIT: {
      FRIENDLY: `[${store.name}] 오늘 방문해 주셔서 진심으로 감사드립니다! 💌

안녕하세요, {예약자}님! {매장명}입니다.
오늘 만족스러운 시간 보내셨나요? 
바쁘신 와중에 저희 매장을 찾아주셔서 정말 기쁩니다.

오늘 세션이 마음에 드셨다면 소중한 리뷰 한 줄 남겨주시면 저희 스태프들에게 큰 힘이 됩니다! 

👇 네이버 예약 리뷰 작성하기:
{리뷰링크}

다음 방문에도 더 좋은 퀄리티와 정성을 담아 모시겠습니다. 늘 행복 가득하시길 바랍니다!`,
      
      FIRM: `[${store.name}] 방문 고객 만족도 및 네이버 리뷰 등록 안내 📋

{예약자}님, 오늘 예약을 이행해 주셔서 감사합니다.
보다 나은 매장 운영과 서비스 강화를 위해 고객 피드백을 모으고 있습니다.

하단 링크를 통해 솔직한 한 줄 평(별점/리뷰)을 작성해 주시면 시스템 개선과 품질 관리에 즉시 반영하도록 하겠습니다.

👇 고객 리뷰 및 별점 작성:
{리뷰링크}

앞으로도 정확한 예약 준수와 정직한 퀄리티로 관리하겠습니다. 감사합니다.`,
      
      PREMIUM: `[${store.name}] 스페셜 서비스 이용 감사 서신 ✨

{예약자}님께,
오늘 {매장명}의 익스클루시브 서비스를 함께해 주셔서 머리 숙여 깊은 감사의 말씀을 전합니다.
제공해 드린 세션이 {예약자}님께 편안한 안식과 만족이 되었기를 진심으로 기원합니다.

오늘 경험하신 고품격 여정에 대한 흔적을 아래 작성 페이지에 담아 주신다면 저희 예술가들과 크루들이 영감을 받아 더 위대한 작업을 준비하는 밑거름이 될 것입니다.

👇 네이버 방문객 평가 작성:
{리뷰링크}

보다 깊이 있는 서비스와 맞춤형 디테일로 조만간 다음 여정에서 뵙기를 손꼽아 기다리겠습니다. 고맙습니다.`
    }
  };

  let compiled = templates[msgType][tone];
  for (const [key, value] of Object.entries(variables)) {
    compiled = compiled.replaceAll(key, value);
  }
  return compiled;
}

function formatKoreanDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  
  return `${month}월 ${day}일(${weekday}) ${hours}:${minutes}`;
}

// ================= DOM UTILITIES =================
function showToast(message, isSuccess = true) {
  const toast = document.getElementById("copy-toast");
  const toastMsg = document.getElementById("toast-message");
  
  toastMsg.textContent = message;
  
  if (isSuccess) {
    toast.style.backgroundColor = "rgba(16, 185, 129, 0.95)";
  } else {
    toast.style.backgroundColor = "rgba(239, 68, 68, 0.95)";
  }

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("클립보드에 문구가 복사되었습니다! 카카오톡이나 문자에 붙여넣어 전송하세요. ✅");
  }).catch(err => {
    console.error("복사 실패:", err);
    showToast("복사 실패. 수동으로 복사해주세요.", false);
  });
}

// ================= ADMIN CONTROLLER =================
function renderDashboard() {
  const reservations = appState.reservations;
  const policies = appState.policies;
  
  // Update sidebar shop info
  document.getElementById("sidebar-shop-name").textContent = appState.store.name;
  let shopTypeLabel = "스튜디오";
  if (appState.store.industry === "RESTAURANT") shopTypeLabel = "파인다이닝";
  else if (appState.store.industry === "HAIR") shopTypeLabel = "미용실";
  else if (appState.store.industry === "NAIL") shopTypeLabel = "네일숍";
  else if (appState.store.industry === "CLINIC") shopTypeLabel = "병원/클리닉";
  document.getElementById("sidebar-shop-type").textContent = shopTypeLabel;
  document.getElementById("dashboard-welcome").textContent = `안녕하세요, ${appState.store.name} 사장님!`;

  // Calculate statistics (Today's only)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReservations = reservations.filter(r => r.dateTime.startsWith(todayStr));
  
  const total = todayReservations.length;
  const confirmed = todayReservations.filter(r => r.status === "CONFIRMED").length;
  const pending = todayReservations.filter(r => r.status === "PENDING").length;
  
  // Calculate warning/risk
  let riskCount = 0;
  todayReservations.forEach(r => {
    const riskAnalysis = calculateNoShowRisk(r, policies);
    if (riskAnalysis.level === "HIGH") {
      riskCount++;
    }
  });

  document.getElementById("stats-total").textContent = total;
  document.getElementById("stats-confirmed").textContent = confirmed;
  document.getElementById("stats-pending").textContent = pending;
  document.getElementById("stats-risk").textContent = riskCount;

  // Render priority focus list (unconfirmed pending and change requested lists)
  const focusList = document.getElementById("dashboard-focus-list");
  focusList.innerHTML = "";

  const unconfirmedReservations = todayReservations.filter(r => r.status === "PENDING" || r.status === "CHANGEREQUESTED");
  document.getElementById("unconfirmed-focus-count").textContent = `대기/요청 ${unconfirmedReservations.length}명`;

  if (unconfirmedReservations.length === 0) {
    focusList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">오늘 남은 미확인 예약 고객이 없습니다. 완벽하네요! ✨</td></tr>`;
    return;
  }

  unconfirmedReservations.forEach(res => {
    const time = res.dateTime.split("T")[1];
    const riskAnalysis = calculateNoShowRisk(res, policies);
    
    // Pick active tone from preview tab or default to FRIENDLY
    const activeTone = document.querySelector("#msg-tone-tabs .tone-tab.active")?.dataset.tone || "FRIENDLY";
    const confirmMsg = compileMessage(res, appState.store, appState.policies, "CONFIRM", activeTone);

    let statusBadge = `<span class="badge badge-pending">대기 (Pending)</span>`;
    let actionButtons = `
      <button class="btn btn-secondary btn-sm btn-copy-focus" data-id="${res.id}">
        <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
        알림 복사
      </button>
    `;

    if (res.status === "CHANGEREQUESTED") {
      statusBadge = `<span class="badge badge-change-requested">변경 요청 ⚠️</span>`;
      actionButtons = `
        <button class="btn btn-secondary btn-sm btn-edit-focus" data-id="${res.id}">
          <i data-lucide="calendar-range" style="width: 12px; height: 12px;"></i>
          변경 조율
        </button>
      `;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600;">${time}</td>
      <td><strong>${res.name}</strong></td>
      <td>${res.phone}</td>
      <td>${statusBadge}</td>
      <td>
        <span class="tag badge-${riskAnalysis.color}">${riskAnalysis.label}</span>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          ${riskAnalysis.reasons.join(", ")}
        </div>
      </td>
      <td>
        <div style="display: flex; gap: 8px;">
          ${actionButtons}
          <button class="btn btn-primary btn-sm btn-open-sim" data-id="${res.id}">
            시뮬레이터 🔗
          </button>
        </div>
      </td>
    `;
    focusList.appendChild(tr);
  });

  lucide.createIcons();

  // Attach copy event to focus list buttons
  document.querySelectorAll(".btn-copy-focus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      const res = appState.reservations.find(r => r.id === resId);
      const tone = document.querySelector("#msg-tone-tabs .tone-tab.active")?.dataset.tone || "FRIENDLY";
      const compiled = compileMessage(res, appState.store, appState.policies, "CONFIRM", tone);
      copyToClipboard(compiled);
    });
  });

  // Attach edit event to focus list buttons
  document.querySelectorAll(".btn-edit-focus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      openEditBookingModal(resId);
    });
  });

  // Attach open simulator event
  document.querySelectorAll("#dashboard-focus-list .btn-open-sim").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      openDualSimulator(resId);
    });
  });
}

function renderReservationsList() {
  const listBody = document.getElementById("full-reservations-list");
  listBody.innerHTML = "";

  const searchQuery = document.getElementById("booking-search").value.toLowerCase();
  const statusFilter = document.getElementById("booking-filter-status").value;
  const policies = appState.policies;

  let filtered = appState.reservations;

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(searchQuery) || r.phone.includes(searchQuery));
  }

  // Status Filter
  if (statusFilter !== "ALL") {
    if (statusFilter === "RISK") {
      filtered = filtered.filter(r => calculateNoShowRisk(r, policies).level === "HIGH");
    } else {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
  }

  // Sort by DateTime ascending
  filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  if (filtered.length === 0) {
    listBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">검색 조건에 맞는 예약 내역이 없습니다.</td></tr>`;
    return;
  }

  filtered.forEach(res => {
    const formattedDate = formatKoreanDateTime(res.dateTime);
    const riskAnalysis = calculateNoShowRisk(res, policies);
    
    const statusVal = res.status;
    const valClass = `val-${statusVal.toLowerCase()}`;
    const statusSelectHTML = `
      <select class="status-select ${valClass}" data-id="${res.id}">
        <option value="PENDING" ${statusVal === 'PENDING' ? 'selected' : ''}>대기</option>
        <option value="CONFIRMED" ${statusVal === 'CONFIRMED' ? 'selected' : ''}>방문확정</option>
        <option value="CANCELLED" ${statusVal === 'CANCELLED' ? 'selected' : ''}>취소됨</option>
        <option value="CHANGEREQUESTED" ${statusVal === 'CHANGEREQUESTED' ? 'selected' : ''}>변경 요청</option>
        <option value="NOSHOW" ${statusVal === 'NOSHOW' ? 'selected' : ''}>노쇼</option>
        <option value="LATE" ${statusVal === 'LATE' ? 'selected' : ''}>지각</option>
      </select>
    `;

    let estimateBtn = '';
    if (res.status === 'CANCELLED' || res.status === 'NOSHOW') {
      estimateBtn = `
        <button class="btn-icon btn-icon-purple btn-estimate-row" data-id="${res.id}" title="위약금 정산서 작성">
          <i data-lucide="calculator"></i>
        </button>
      `;
    }

    const actionButtonsHTML = `
      <div class="action-btn-group">
        <button class="btn btn-primary btn-sm btn-open-sim" data-id="${res.id}">
          시뮬레이터 🔗
        </button>
        <button class="btn-icon btn-icon-primary btn-edit-row" data-id="${res.id}" title="예약 수정">
          <i data-lucide="edit-3"></i>
        </button>
        ${estimateBtn}
        <button class="btn-icon btn-icon-danger btn-delete-row" data-id="${res.id}" title="예약 삭제">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td><strong>${res.name}</strong></td>
      <td>${res.phone}</td>
      <td>${statusSelectHTML}</td>
      <td>
        <span class="tag badge-${riskAnalysis.color}">${riskAnalysis.label}</span>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
          ${riskAnalysis.reasons.join(", ")}
        </div>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm btn-copy-row" data-id="${res.id}">
          <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
          카톡 문구 복사
        </button>
      </td>
      <td>
        ${actionButtonsHTML}
      </td>
    `;
    listBody.appendChild(tr);
  });

  lucide.createIcons();

  // Attach status dropdown change events
  document.querySelectorAll("#full-reservations-list .status-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const resId = e.target.dataset.id;
      const newStatus = e.target.value;
      appState.updateReservationStatus(resId, newStatus);
      showToast("예약 상태가 업데이트되었습니다. 🔄");
      refreshAdminViews();
    });
  });

  // Attach copy events
  document.querySelectorAll(".btn-copy-row").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      const res = appState.reservations.find(r => r.id === resId);
      const tone = document.querySelector("#msg-tone-tabs .tone-tab.active")?.dataset.tone || "FRIENDLY";
      const compiled = compileMessage(res, appState.store, appState.policies, "CONFIRM", tone);
      copyToClipboard(compiled);
    });
  });

  // Attach edit row event
  document.querySelectorAll("#full-reservations-list .btn-edit-row").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      openEditBookingModal(resId);
    });
  });

  // Attach delete row event
  document.querySelectorAll("#full-reservations-list .btn-delete-row").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      const res = appState.reservations.find(r => r.id === resId);
      if (confirm(`정말로 ${res.name} 고객님의 예약을 삭제하시겠습니까?`)) {
        appState.deleteReservation(resId);
        showToast("예약이 정상적으로 삭제되었습니다.");
        refreshAdminViews();
      }
    });
  });

  // Attach estimate row event
  document.querySelectorAll("#full-reservations-list .btn-estimate-row").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      const res = appState.reservations.find(r => r.id === resId);
      if (res) {
        // Prepopulate Estimator Inputs
        document.getElementById("est-customer").value = res.name;
        document.getElementById("est-deposit").value = appState.policies.depositAmount;
        
        const cancelTimeSelect = document.getElementById("est-cancel-time");
        const rateInput = document.getElementById("est-penalty-rate");
        
        if (res.status === "NOSHOW") {
          cancelTimeSelect.value = "NOSHOW";
          rateInput.value = 100;
        } else {
          // Cancelled default
          cancelTimeSelect.value = "12";
          rateInput.value = 50;
        }
        
        renderRefundEstimator();
        showToast(`${res.name} 고객님의 정보가 위약금 정산서에 연동되었습니다. ⚡`);
        window.location.hash = "#estimator";
      }
    });
  });

  // Attach open simulator event
  document.querySelectorAll("#full-reservations-list .btn-open-sim").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.id;
      openDualSimulator(resId);
    });
  });
}

function initPoliciesForm() {
  const store = appState.store;
  const policies = appState.policies;

  document.getElementById("shop-name").value = store.name;
  document.getElementById("naver-link").value = store.naverLink;
  document.getElementById("shop-industry").value = store.industry;
  document.getElementById("policy-deposit").value = policies.depositAmount;
  document.getElementById("policy-bank").value = policies.bankInfo;
  document.getElementById("policy-grace").value = policies.gracePeriod;
  document.getElementById("policy-rules").value = policies.cancellationRules;

  updateMessagePreview();
}

function updateMessagePreview() {
  const activeMsgType = document.querySelector("#msg-type-tabs .tone-tab.active").dataset.msgType;
  const activeTone = document.querySelector("#msg-tone-tabs .tone-tab.active").dataset.tone;

  // Compile mockup with variables representing a sample customer
  const sampleRes = {
    id: "sample-id",
    name: "김민수",
    phone: "010-1234-5678",
    dateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow
    status: "PENDING",
    depositStatus: "UNPAID",
    pastNoShow: "NO"
  };

  const compiled = compileMessage(sampleRes, appState.store, appState.policies, activeMsgType, activeTone);
  
  // Render inside mockup phone
  const previewBody = document.getElementById("preview-msg-text");
  previewBody.textContent = compiled;

  // Render Button inside phone preview
  const previewBtnConfirm = document.getElementById("preview-msg-button");
  const previewBtnNaver = document.getElementById("preview-msg-button-naver");

  if (activeMsgType === "POST_VISIT") {
    previewBtnConfirm.textContent = "네이버 리뷰 쓰기";
    previewBtnConfirm.className = "kakao-btn kakao-btn-primary";
    previewBtnNaver.style.display = "none";
  } else {
    previewBtnConfirm.textContent = "방문 여부 확인하기 (원클릭)";
    previewBtnConfirm.className = "kakao-btn kakao-btn-primary";
    previewBtnNaver.style.display = "flex";
    previewBtnNaver.textContent = "네이버 예약 내역 보기";
  }
}

function savePoliciesFromForm() {
  const name = document.getElementById("shop-name").value;
  const naverLink = document.getElementById("naver-link").value;
  const industry = document.getElementById("shop-industry").value;
  
  const deposit = Number(document.getElementById("policy-deposit").value);
  const bank = document.getElementById("policy-bank").value;
  const grace = Number(document.getElementById("policy-grace").value);
  const rules = document.getElementById("policy-rules").value;

  if (!name.trim()) {
    showToast("매장 이름을 입력해주세요.", false);
    return;
  }

  appState.store = { name, naverLink, industry };
  appState.policies = { depositAmount: deposit, bankInfo: bank, gracePeriod: grace, cancellationRules: rules };
  appState.saveToStorage();

  showToast("매장 정책 및 기본 정보가 성공적으로 저장되었습니다! 💾");
  renderDashboard();
  updateMessagePreview();
}

// ================= REFUND ESTIMATOR =================
function renderRefundEstimator() {
  const customer = document.getElementById("est-customer").value;
  const deposit = Number(document.getElementById("est-deposit").value);
  const cancelTimeKey = document.getElementById("est-cancel-time").value;
  const penaltyRate = Number(document.getElementById("est-penalty-rate").value);

  // Set default penalty rate based on cancelTime selection for smoother UX
  let calculatedRate = penaltyRate;
  
  // Calculate refund
  const penaltyAmount = Math.round((deposit * calculatedRate) / 100);
  const refundAmount = deposit - penaltyAmount;

  const todayStr = formatKoreanDateTime(new Date().toISOString());

  const documentText = `[Remindly 공식 환불 정산 안내]

• 수신: ${customer} 고객님
• 매장: ${appState.store.name}
• 정산 일시: ${todayStr}

----------------------------------------
본 매장은 예약 우선제로 운영되며, 동의하신 네이버 플레이스 취소/노쇼 정책에 근거하여 위약정산을 진행합니다.

1. 기입금 예약금: ${deposit.toLocaleString()}원
2. 위약 기준: ${getCancelTimeLabel(cancelTimeKey)}
3. 위약금 공제 비율: ${calculatedRate}%
4. 공제 위약금 금액: -${penaltyAmount.toLocaleString()}원
----------------------------------------
★ 최종 환불액: ${refundAmount.toLocaleString()}원

${refundAmount > 0 
  ? `환불금액은 영업일 기준 1~2일 이내에 원천 계좌 또는 네이버 페이를 통해 반환됩니다.`
  : `취소 수수료 100%가 적용되어 환불이 불가함을 정중히 안내해 드립니다.`
}

원활한 매장 운영과 질 높은 서비스를 제공하기 위해 부득이하게 위약 규정을 적용하오니 너른 양해 부탁드립니다. 감사합니다.`;

  document.getElementById("est-result-text").textContent = documentText;
}

function getCancelTimeLabel(key) {
  switch (key) {
    case "2": return "예약 시간 기준 2시간 이내 취소";
    case "12": return "예약 시간 기준 24시간 이내 취소";
    case "48": return "예약 시간 기준 48시간 이내 취소";
    case "NOSHOW": return "연락 없는 무단 불참 (노쇼)";
    default: return "규정 시간 경과 취소";
  }
}

// ================= CUSTOMER VIEW CONTROLLER =================
function renderCustomerPortal(resId) {
  const res = appState.reservations.find(r => r.id === resId);
  const policies = appState.policies;
  const store = appState.store;

  if (!res) {
    document.getElementById("customer-view").innerHTML = `
      <div class="customer-mobile-card" style="padding: 32px; text-align: center;">
        <h1 style="color: var(--color-danger); margin-bottom: 16px;">예약을 찾을 수 없습니다</h1>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">잘못되었거나 이미 삭제된 예약 확인 링크입니다.</p>
        <a href="#dashboard" class="btn btn-secondary">관리자 홈으로</a>
      </div>
    `;
    return;
  }

  // Update header & info
  document.getElementById("cust-shop-name").textContent = store.name;
  
  let shopTypeLabel = "스튜디오";
  if (store.industry === "RESTAURANT") shopTypeLabel = "식당";
  else if (store.industry === "HAIR") shopTypeLabel = "미용실";
  else if (store.industry === "NAIL") shopTypeLabel = "네일숍";
  else if (store.industry === "CLINIC") shopTypeLabel = "병원";
  document.getElementById("cust-shop-industry").textContent = shopTypeLabel;

  document.getElementById("cust-name").textContent = `${res.name} 고객님`;
  document.getElementById("cust-time").textContent = formatKoreanDateTime(res.dateTime);
  
  // Deposit label
  const depositTextEl = document.getElementById("cust-deposit-status");
  if (policies.depositAmount === 0) {
    depositTextEl.textContent = "대상 아님 (0원)";
    depositTextEl.className = "summary-val text-muted";
  } else if (res.depositStatus === "PAID") {
    depositTextEl.textContent = `확인 완료 (${policies.depositAmount.toLocaleString()}원)`;
    depositTextEl.className = "summary-val text-success";
  } else {
    depositTextEl.textContent = `미입금 (${policies.depositAmount.toLocaleString()}원)`;
    depositTextEl.className = "summary-val text-warning";
  }

  // Policy text
  document.getElementById("cust-policy-text").innerText = `지각 허용 시간: 예약 기준 ${policies.gracePeriod}분 초과 시 자동 취소될 수 있습니다.\n\n취소 규정:\n${policies.cancellationRules}`;

  // Interactive state banners
  const bannerContainer = document.getElementById("cust-status-banner-container");
  const actionContainer = document.getElementById("customer-action-buttons");
  
  bannerContainer.innerHTML = "";
  actionContainer.style.display = "flex";

  if (res.status === "CONFIRMED") {
    bannerContainer.innerHTML = `
      <div class="customer-status-banner customer-status-confirmed">
        <i data-lucide="check-circle-2"></i>
        <span>방문 확인이 정상적으로 접수되었습니다.</span>
      </div>
    `;
    actionContainer.style.display = "none";
  } else if (res.status === "CANCELLED") {
    bannerContainer.innerHTML = `
      <div class="customer-status-banner customer-status-cancelled">
        <i data-lucide="x-circle"></i>
        <span>이 예약은 정상적으로 취소 처리되었습니다.</span>
      </div>
    `;
    actionContainer.style.display = "none";
  } else if (res.status === "CHANGEREQUESTED") {
    bannerContainer.innerHTML = `
      <div class="customer-status-banner" style="background-color: var(--color-warning-glow); color: var(--color-warning); border: 1px solid rgba(245, 158, 11, 0.2)">
        <i data-lucide="help-circle"></i>
        <span>일정 변경 요청이 접수되었습니다. 매장에서 검토 중입니다.</span>
      </div>
    `;
    actionContainer.style.display = "none";
  }

  lucide.createIcons();

  // Attach button triggers
  document.getElementById("btn-cust-confirm").onclick = () => {
    appState.updateReservationStatus(res.id, "CONFIRMED");
    showToast("방문 예약 확정이 완료되었습니다! 매장에서 뵙겠습니다. 🌸");
    renderCustomerPortal(res.id);
  };

  document.getElementById("btn-cust-cancel").onclick = () => {
    if (confirm("정말로 예약을 취소하시겠습니까? (약관에 의거하여 취소 수수료가 적용될 수 있습니다)")) {
      appState.updateReservationStatus(res.id, "CANCELLED");
      showToast("예약 취소 신청이 완료되었습니다.");
      renderCustomerPortal(res.id);
    }
  };

  document.getElementById("btn-cust-change").onclick = () => {
    appState.updateReservationStatus(res.id, "CHANGEREQUESTED");
    showToast("일정 변경 요청이 완료되었습니다. 영업시간 내에 유선 혹은 네이버 톡톡으로 개별 안내를 드립니다.");
    renderCustomerPortal(res.id);
  };
}

// ================= E2E DUAL SIMULATOR CONTROLLER =================
function openDualSimulator(resId) {
  const res = appState.reservations.find(r => r.id === resId);
  const store = appState.store;
  const policies = appState.policies;

  if (!res) return;

  // Retrieve selected preview tone & type from Policies settings, or fallback to default
  const activeTone = document.querySelector("#msg-tone-tabs .tone-tab.active")?.dataset.tone || "FRIENDLY";
  const activeMsgType = document.querySelector("#msg-type-tabs .tone-tab.active")?.dataset.msgType || "CONFIRM";
  
  // 1. Compile message text and set inside simulator
  const compiled = compileMessage(res, store, policies, activeMsgType, activeTone);
  document.getElementById("sim-kakao-body").textContent = compiled;

  // 2. Set simulator copy button click
  document.getElementById("btn-copy-sim-msg").onclick = () => {
    copyToClipboard(compiled);
  };

  // 3. Set Customer Portal info inside simulator
  document.getElementById("sim-cust-shop-name").textContent = store.name;
  
  let shopTypeLabel = "스튜디오";
  if (store.industry === "RESTAURANT") shopTypeLabel = "식당";
  else if (store.industry === "HAIR") shopTypeLabel = "미용실";
  else if (store.industry === "NAIL") shopTypeLabel = "네일숍";
  else if (store.industry === "CLINIC") shopTypeLabel = "병원";
  document.getElementById("sim-cust-shop-industry").textContent = shopTypeLabel;

  document.getElementById("sim-cust-name").textContent = `${res.name} 고객님`;
  document.getElementById("sim-cust-time").textContent = formatKoreanDateTime(res.dateTime);

  const depositTextEl = document.getElementById("sim-cust-deposit");
  if (policies.depositAmount === 0) {
    depositTextEl.textContent = "대상 없음 (0원)";
    depositTextEl.className = "summary-val text-muted";
  } else if (res.depositStatus === "PAID") {
    depositTextEl.textContent = `확인 완료 (${policies.depositAmount.toLocaleString()}원)`;
    depositTextEl.className = "summary-val text-success";
  } else {
    depositTextEl.textContent = `미입금 (${policies.depositAmount.toLocaleString()}원)`;
    depositTextEl.className = "summary-val text-warning";
  }

  document.getElementById("sim-cust-policy").innerText = `지각 허용 시간: 예약 기준 ${policies.gracePeriod}분 초과 시 자동 취소될 수 있습니다.\n\n취소 규정:\n${policies.cancellationRules}`;

  // 4. Render correct buttons or banner state
  renderSimulatorPortalView(res);

  // 5. Open the modal
  document.getElementById("dual-simulator-modal").style.display = "flex";
  lucide.createIcons();

  // Button clicks on customer screen
  document.getElementById("sim-btn-confirm").onclick = () => {
    appState.updateReservationStatus(res.id, "CONFIRMED");
    showToast("방문 예약 확정이 접수되었습니다! 대시보드 상태가 업데이트됩니다. 🌸");
    renderSimulatorPortalView(res);
    refreshAdminViews();
  };

  document.getElementById("sim-btn-cancel").onclick = () => {
    if (confirm("정말로 예약을 취소하시겠습니까? (취소 위약금이 발생할 수 있습니다)")) {
      appState.updateReservationStatus(res.id, "CANCELLED");
      showToast("예약 취소 신청이 성공적으로 전달되었습니다.");
      renderSimulatorPortalView(res);
      refreshAdminViews();
    }
  };

  document.getElementById("sim-btn-change").onclick = () => {
    appState.updateReservationStatus(res.id, "CHANGEREQUESTED");
    showToast("일정 변경 요청이 정상 등록되었습니다. 매장 영업시간 내 조율해 드립니다.");
    renderSimulatorPortalView(res);
    refreshAdminViews();
  };
}

function renderSimulatorPortalView(res) {
  const bannerContainer = document.getElementById("sim-cust-status-banner-container");
  const actionContainer = document.getElementById("sim-cust-action-buttons");

  bannerContainer.innerHTML = "";
  actionContainer.style.display = "flex";

  if (res.status === "CONFIRMED") {
    bannerContainer.innerHTML = `
      <div class="customer-status-banner customer-status-confirmed" style="font-size:12px; padding: 10px; margin-bottom: 12px; width: 100%;">
        <i data-lucide="check-circle-2" style="width: 14px; height: 14px;"></i>
        <span>방문 확인이 완료된 예약입니다.</span>
      </div>
    `;
    actionContainer.style.display = "none";
  } else if (res.status === "CANCELLED") {
    bannerContainer.innerHTML = `
      <div class="customer-status-banner customer-status-cancelled" style="font-size:12px; padding: 10px; margin-bottom: 12px; width: 100%;">
        <i data-lucide="x-circle" style="width: 14px; height: 14px;"></i>
        <span>취소 완료된 예약입니다.</span>
      </div>
    `;
    actionContainer.style.display = "none";
  } else if (res.status === "CHANGEREQUESTED") {
    bannerContainer.innerHTML = `
      <div class="customer-status-banner" style="font-size:12px; padding: 10px; margin-bottom: 12px; width: 100%; background-color: var(--color-warning-glow); color: var(--color-warning); border: 1px solid rgba(245, 158, 11, 0.2)">
        <i data-lucide="help-circle" style="width: 14px; height: 14px;"></i>
        <span>일정 변경이 요청되었습니다.</span>
      </div>
    `;
    actionContainer.style.display = "none";
  }

  // Sync deposit status text
  const depositTextEl = document.getElementById("sim-cust-deposit");
  if (appState.policies.depositAmount === 0) {
    depositTextEl.textContent = "대상 없음 (0원)";
    depositTextEl.className = "summary-val text-muted";
  } else if (res.depositStatus === "PAID") {
    depositTextEl.textContent = `확인 완료 (${appState.policies.depositAmount.toLocaleString()}원)`;
    depositTextEl.className = "summary-val text-success";
  } else {
    depositTextEl.textContent = `미입금 (${appState.policies.depositAmount.toLocaleString()}원)`;
    depositTextEl.className = "summary-val text-warning";
  }

  lucide.createIcons();
}

function refreshAdminViews() {
  const hash = window.location.hash || "#dashboard";
  if (hash === "#reservations") {
    renderReservationsList();
  } else {
    renderDashboard();
  }
}

// ================= SPA URL ROUTER =================
function handleHashRouting() {
  const hash = window.location.hash || "#dashboard";
  
  const adminView = document.getElementById("admin-view");
  const customerView = document.getElementById("customer-view");

  // Deactivate all panels
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));

  if (hash.startsWith("#customer")) {
    // CUSTOMER PORTAL MODE
    adminView.style.display = "none";
    customerView.style.display = "flex";
    
    // Parse query id
    const match = hash.match(/id=([^&]+)/);
    const resId = match ? match[1] : null;
    renderCustomerPortal(resId);
  } else {
    // ADMIN DASHBOARD MODE
    adminView.style.display = "flex";
    customerView.style.display = "none";

    let activePanelId = "dashboard-panel";
    let activeNavId = "nav-dashboard";

    if (hash === "#reservations") {
      activePanelId = "reservations-panel";
      activeNavId = "nav-reservations";
      renderReservationsList();
    } else if (hash === "#policies") {
      activePanelId = "policies-panel";
      activeNavId = "nav-policies";
      initPoliciesForm();
    } else if (hash === "#estimator") {
      activePanelId = "estimator-panel";
      activeNavId = "nav-estimator";
      renderRefundEstimator();
    } else {
      renderDashboard();
    }

    document.getElementById(activePanelId).classList.add("active");
    document.getElementById(activeNavId).classList.add("active");
  }
}

// ================= EVENT BINDINGS =================
window.addEventListener("hashchange", handleHashRouting);
window.addEventListener("load", () => {
  handleHashRouting();
  lucide.createIcons();
});

// React to storage updates (for simulated customer page running in another tab)
window.addEventListener("storage", () => {
  appState.loadFromStorage();
  handleHashRouting();
});

// Admin Dashboard - Reset Button
const resetBtn = document.getElementById("btn-reset-data");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    try {
      if (confirm("모든 데이터를 초기 상태로 리셋하고 가상 샘플 예약 데이터 5건을 채워넣으시겠습니까?")) {
        const industry = (appState.store && appState.store.industry) ? appState.store.industry : "STUDIO";
        appState.resetToDefaultPreset(industry);
        showToast("가상 예약 및 정책 데이터가 리셋되었습니다! ⚡");
        handleHashRouting();
      }
    } catch (err) {
      console.error("Reset error:", err);
      showToast("데이터 초기화 중 오류가 발생했습니다. 콘솔을 확인해주세요.", false);
    }
  });
}

// Admin Reservations - Add Modal
const modal = document.getElementById("add-booking-modal");
function checkBlacklistForPhone(phoneVal, warningDiv, noshowSelect) {
  const cleanPhone = phoneVal.replace(/[^0-9]/g, "");
  if (!cleanPhone) {
    warningDiv.style.display = "none";
    return;
  }
  const count = appState.noShowHistory[cleanPhone] || 0;
  if (count > 0) {
    warningDiv.style.display = "block";
    warningDiv.innerHTML = `⚠️ 노쇼 경고: 이 연락처는 과거 노쇼 이력이 ${count}회 존재합니다!`;
    noshowSelect.value = "YES";
  } else {
    warningDiv.style.display = "none";
    noshowSelect.value = "NO";
  }
}

document.getElementById("new-booking-phone").addEventListener("input", (e) => {
  const warningDiv = document.getElementById("new-booking-phone-warning");
  const noshowSelect = document.getElementById("new-booking-noshow");
  checkBlacklistForPhone(e.target.value, warningDiv, noshowSelect);
});

document.getElementById("btn-add-booking-modal-trigger").addEventListener("click", () => {
  modal.style.display = "flex";
  document.getElementById("add-booking-form").reset();
  document.getElementById("new-booking-phone-warning").style.display = "none";
  // Set default datetime to tomorrow at 14:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  document.getElementById("new-booking-datetime").value = tomorrow.toISOString().slice(0, 16);
});

document.getElementById("btn-quick-add-booking").addEventListener("click", () => {
  modal.style.display = "flex";
  document.getElementById("add-booking-form").reset();
  document.getElementById("new-booking-phone-warning").style.display = "none";
  // Set default datetime to today + 2 hours
  const today = new Date();
  today.setHours(today.getHours() + 2, 0, 0, 0);
  document.getElementById("new-booking-datetime").value = today.toISOString().slice(0, 16);
});

document.getElementById("btn-close-booking-modal").addEventListener("click", () => {
  modal.style.display = "none";
});

// Admin Reservations - Save
document.getElementById("btn-save-new-booking").addEventListener("click", () => {
  const name = document.getElementById("new-booking-name").value;
  const phone = document.getElementById("new-booking-phone").value;
  const dateTime = document.getElementById("new-booking-datetime").value;
  const depositStatus = document.getElementById("new-booking-deposit").value;
  const pastNoShow = document.getElementById("new-booking-noshow").value;

  if (!name || !phone || !dateTime) {
    showToast("필수 값을 모두 채워주세요.", false);
    return;
  }

  const newRes = {
    id: "res-" + Date.now(),
    name,
    phone,
    dateTime,
    status: "PENDING",
    depositStatus,
    pastNoShow
  };

  appState.addReservation(newRes);
  modal.style.display = "none";
  document.getElementById("add-booking-form").reset();
  showToast(`${name} 고객님의 예약이 추가되었습니다! 📅`);
  
  handleHashRouting();
});

// Admin Reservations - Edit Modal
const editModal = document.getElementById("edit-booking-modal");
document.getElementById("btn-close-edit-modal").addEventListener("click", () => {
  editModal.style.display = "none";
});

document.getElementById("edit-booking-phone").addEventListener("input", (e) => {
  const warningDiv = document.getElementById("edit-booking-phone-warning");
  const noshowSelect = document.getElementById("edit-booking-noshow");
  checkBlacklistForPhone(e.target.value, warningDiv, noshowSelect);
});

function openEditBookingModal(resId) {
  const res = appState.reservations.find(r => r.id === resId);
  if (!res) return;

  document.getElementById("edit-booking-id").value = res.id;
  document.getElementById("edit-booking-name").value = res.name;
  document.getElementById("edit-booking-phone").value = res.phone;
  document.getElementById("edit-booking-datetime").value = res.dateTime;
  document.getElementById("edit-booking-deposit").value = res.depositStatus;
  document.getElementById("edit-booking-noshow").value = res.pastNoShow;

  const warningDiv = document.getElementById("edit-booking-phone-warning");
  const noshowSelect = document.getElementById("edit-booking-noshow");
  checkBlacklistForPhone(res.phone, warningDiv, noshowSelect);

  editModal.style.display = "flex";
}

document.getElementById("btn-save-edit-booking").addEventListener("click", () => {
  const id = document.getElementById("edit-booking-id").value;
  const name = document.getElementById("edit-booking-name").value;
  const phone = document.getElementById("edit-booking-phone").value;
  const dateTime = document.getElementById("edit-booking-datetime").value;
  const depositStatus = document.getElementById("edit-booking-deposit").value;
  const pastNoShow = document.getElementById("edit-booking-noshow").value;

  if (!name || !phone || !dateTime) {
    showToast("필수 값을 모두 채워주세요.", false);
    return;
  }

  const success = appState.updateReservationDetails(id, {
    name,
    phone,
    dateTime,
    depositStatus,
    pastNoShow
  });

  if (success) {
    editModal.style.display = "none";
    showToast(`${name} 고객님의 예약이 수정되었습니다! ✏️`);
    handleHashRouting();
  } else {
    showToast("예약 수정에 실패했습니다.", false);
  }
});

// Admin Policies - Presets Selection
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const presetKey = e.currentTarget.dataset.preset;
    if (confirm(`'${e.currentTarget.textContent}' 업종 추천값으로 정책 폼을 덮어씌우시겠습니까?`)) {
      appState.resetToDefaultPreset(presetKey);
      initPoliciesForm();
      showToast(`${e.currentTarget.textContent} 기본 프리셋이 적용되었습니다! ⚙️`);
    }
  });
});

// Save Policies form
document.getElementById("btn-save-policies").addEventListener("click", savePoliciesFromForm);

// Tab Controls for message preview (Type & Tone)
document.querySelectorAll("#msg-type-tabs .tone-tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    document.querySelectorAll("#msg-type-tabs .tone-tab").forEach(t => t.classList.remove("active"));
    e.currentTarget.classList.add("active");
    updateMessagePreview();
  });
});

document.querySelectorAll("#msg-tone-tabs .tone-tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    document.querySelectorAll("#msg-tone-tabs .tone-tab").forEach(t => t.classList.remove("active"));
    e.currentTarget.classList.add("active");
    updateMessagePreview();
    renderDashboard(); // Re-render focus list copy targets with updated tone
  });
});

// Copy Template Button
document.getElementById("btn-copy-template-text").addEventListener("click", () => {
  const text = document.getElementById("preview-msg-text").textContent;
  copyToClipboard(text);
});

// Refund Estimator input change triggers
["est-customer", "est-deposit", "est-cancel-time", "est-penalty-rate"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderRefundEstimator);
  document.getElementById(id).addEventListener("change", renderRefundEstimator);
});

// Handle specific auto-update of rate based on cancel selection for ease of use
document.getElementById("est-cancel-time").addEventListener("change", (e) => {
  const rateInput = document.getElementById("est-penalty-rate");
  switch (e.currentTarget.value) {
    case "2": rateInput.value = 100; break;
    case "12": rateInput.value = 50; break;
    case "48": rateInput.value = 30; break;
    case "NOSHOW": rateInput.value = 100; break;
  }
  renderRefundEstimator();
});

  document.getElementById("btn-calculate-refund").addEventListener("click", renderRefundEstimator);
  document.getElementById("btn-copy-est-text").addEventListener("click", () => {
    const text = document.getElementById("est-result-text").textContent;
    copyToClipboard(text);
  });

  // Close E2E Dual Simulator Modal
  document.getElementById("btn-close-dual-simulator").addEventListener("click", () => {
    document.getElementById("dual-simulator-modal").style.display = "none";
  });

  // Admin Reservations - Search/Filters
  document.getElementById("booking-search").addEventListener("input", renderReservationsList);
  document.getElementById("booking-filter-status").addEventListener("change", renderReservationsList);
