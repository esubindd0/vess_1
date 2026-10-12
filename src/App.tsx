import { useMemo, useState } from "react";

type Screen = "home" | "guide" | "quiz" | "result" | "saved" | "more" | "detail";
type AnswerMap = Record<number, string[]>;

const questions = [
  { kicker: "부담 없는 만큼만", title: "한 달에 어느 정도가\n편안한가요?", subtitle: "정확한 소득은 묻지 않아요", multiple: false, options: [["1만 원 미만", "커피 한두 잔 정도"], ["1–5만 원", "작게, 꾸준하게"], ["5–20만 원", "조금 더 넓은 변화"], ["20만 원 이상", "깊이 있는 나눔"], ["금액보다 시간·재능", "직접 참여하고 싶어요"]] },
  { kicker: "세금 안내에만 활용해요", title: "현재 소득 형태는\n어떤가요?", subtitle: "이 질문은 건너뛰어도 괜찮아요", multiple: false, optional: true, options: [["근로소득", "연말정산을 해요"], ["사업·프리랜서", "종합소득세를 신고해요"], ["소득 없음", "학생·은퇴 등"]] },
  { kicker: "최대 3개까지", title: "어떤 변화를\n응원하고 싶나요?", subtitle: "마음이 향하는 곳을 골라주세요", multiple: true, options: [["아동·청소년", ""], ["환경·동물", ""], ["의료·보건", ""], ["지역사회", ""], ["재난·긴급구호", ""], ["아직 잘 모르겠어요", ""]] },
  { kicker: "나에게 편한 방식으로", title: "어떻게 참여하고\n싶나요?", subtitle: "생활에 자연스러운 방법이면 충분해요", multiple: false, options: [["정기후원", "매월 꾸준히"], ["일시후원", "원할 때 한 번"], ["물품 기부", "물건을 나눔"], ["재능·봉사", "시간과 능력을 나눔"], ["일상에서 가볍게", "포인트·걷기 등"]] },
  { kicker: "마지막 질문", title: "기부할 때 무엇이\n가장 중요한가요?", subtitle: "여러 개를 골라도 좋아요", multiple: true, optional: true, options: [["세제 혜택", ""], ["투명한 사용 내역", ""], ["직접 참여", ""], ["지역 연계", ""]] },
];

const causes = [
  { title: "아이들의\n든든한 내일", label: "아동·청소년", color: "sun", icon: "spark" },
  { title: "지구와 생명을\n오래도록", label: "환경·동물", color: "leaf", icon: "leaf" },
  { title: "누구나 건강할\n권리를 위해", label: "의료·보건", color: "cream", icon: "plus" },
  { title: "우리 동네를\n더 다정하게", label: "지역사회", color: "coral", icon: "home" },
];

const donationMethods = [
  { title: "정기후원", caption: "작게, 오래", icon: "calendar", color: "lime" },
  { title: "일시후원", caption: "필요한 순간", icon: "heart", color: "sun" },
  { title: "물품 기부", caption: "물건의 새 쓰임", icon: "box", color: "cream" },
  { title: "재능·봉사", caption: "시간과 능력", icon: "hands", color: "leaf" },
];

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    guide: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23V5.5Z" /></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
    menu: <><path d="M5 7h14M5 12h14M5 17h14" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <><path d="m12 2 1.4 5.1L18 10l-4.6 2.9L12 18l-1.4-5.1L6 10l4.6-2.9L12 2Z" /><path d="m5 16 .6 2L8 19.5l-2.4 1.3L5 23l-.6-2.2L2 19.5l2.4-1.5L5 16Z" /></>,
    leaf: <><path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 7 0 10-8 10-15Z" /><path d="M4 21c3-6 7-10 13-13" /></>,
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></>,
    heart: <path d="M20.8 5.8a5.3 5.3 0 0 0-7.5 0L12 7.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z" />,
    box: <><path d="m4 8 8-4 8 4-8 4-8-4Z" /><path d="m4 8 8 4 8-4v8l-8 4-8-4V8Z" /></>,
    hands: <><path d="m9 13-4-4a2 2 0 0 0-3 3l6 7c1 1 2 2 4 2" /><path d="m15 13 4-4a2 2 0 0 1 3 3l-6 7c-1 1-2 2-4 2M9 5c1-2 3-2 3 0 0-2 2-2 3 0 1 2-1 4-3 6-2-2-4-4-3-6Z" /></>,
    share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.5-4.5M8.2 13.2l7.5 4.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.spark}</svg>;
}

function Moa({ pose = "welcome", size = "large", label = "" }: { pose?: "welcome" | "think" | "yay" | "hug" | "empty"; size?: "small" | "medium" | "large"; label?: string }) {
  return (
    <div className={`moa moa-${size} moa-${pose}`} role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
      <div className="moa-shadow" />
      <div className="moa-arm arm-left" /><div className="moa-arm arm-right" />
      <div className="moa-body">
        <span className="moa-shine" /><span className="brow brow-left" /><span className="brow brow-right" />
        <span className="eye eye-left" /><span className="eye eye-right" /><span className="cheek cheek-left" /><span className="cheek cheek-right" />
        <span className="mouth" /><span className="belly-heart">♥</span>
      </div>
      <div className="moa-leg leg-left" /><div className="moa-leg leg-right" />
      {pose === "think" && <span className="thought">?</span>}
      {pose === "yay" && <><span className="yay-star one">✦</span><span className="yay-star two">✦</span></>}
      {pose === "hug" && <span className="hug-heart">♥</span>}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled = false, face = true }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; face?: boolean }) {
  return <button type="button" className="primary-button" onClick={onClick} disabled={disabled}><span>{children}</span>{face && <span className="face-button"><i /><i /><b>⌣</b></span>}</button>;
}

function TopBar({ title, onBack, action }: { title?: string; onBack?: () => void; action?: React.ReactNode }) {
  return <header className="app-bar">{onBack ? <button type="button" className="circle-button" onClick={onBack} aria-label="뒤로가기"><Icon name="back" /></button> : <div className="mini-logo"><span>m</span><b>마음모아</b></div>}<strong>{title}</strong>{action ?? <button type="button" className="circle-button light" aria-label="알림"><span className="notification-dot" /><Icon name="heart" size={19} /></button>}</header>;
}

function BottomNav({ screen, go }: { screen: Screen; go: (screen: Screen) => void }) {
  const items: [Screen, string, string][] = [["home", "home", "홈"], ["guide", "guide", "가이드"], ["quiz", "spark", "추천"], ["saved", "bookmark", "저장함"], ["more", "menu", "더보기"]];
  return <nav className="bottom-nav" aria-label="하단 메뉴">{items.map(([target, icon, label], i) => i === 2 ? <button type="button" className="nav-recommend" key={target} onClick={() => go("quiz")} aria-label="추천 시작"><span className="nav-face"><i /><i /><b>⌣</b></span><small>추천</small></button> : <button type="button" key={target} className={screen === target ? "active" : ""} onClick={() => go(target)}><span><Icon name={icon} size={20} /></span>{screen === target && <small>{label}</small>}</button>)}</nav>;
}

function Home({ go }: { go: (screen: Screen) => void }) {
  const [segment, setSegment] = useState<"cause" | "method">("cause");
  return <div className="screen home-screen"><TopBar />
    <section className="home-hero">
      <div className="hero-copy"><span className="hello-pill">안녕, 반가워요!</span><h1>좋은 마음,<br />어디서부터<br />시작할까요?</h1><p>나에게 꼭 맞는 나눔을<br />모아가 함께 찾아드릴게요.</p></div>
      <Moa pose="welcome" size="large" label="손을 흔들며 반기는 모아" />
    </section>
    <section className="home-sheet">
      <PrimaryButton onClick={() => go("quiz")}>내게 맞는 기부 찾기</PrimaryButton>
      <div className="home-trust"><span><Icon name="check" size={14} /> 가입 없이</span><span><Icon name="check" size={14} /> 1분이면 완료</span><span><Icon name="check" size={14} /> 중립적 추천</span></div>
      <div className="segment"><button type="button" className={segment === "cause" ? "active" : ""} onClick={() => setSegment("cause")}>분야로 보기</button><button type="button" className={segment === "method" ? "active" : ""} onClick={() => setSegment("method")}>방법으로 보기</button></div>
      <div className="home-card-grid">
        {segment === "cause" ? causes.map((item) => <button type="button" className={`home-card ${item.color}`} key={item.label} onClick={() => go("detail")}><span className="card-icon"><Icon name={item.icon} /></span><small>{item.label}</small><strong>{item.title}</strong><span className="card-arrow"><Icon name="arrow" size={16} /></span></button>) : donationMethods.map((item) => <button type="button" className={`home-card method-card ${item.color}`} key={item.title} onClick={() => go("detail")}><span className="card-icon"><Icon name={item.icon} /></span><small>{item.caption}</small><strong>{item.title}</strong><span className="card-arrow"><Icon name="arrow" size={16} /></span></button>)}
      </div>
    </section>
  </div>;
}

function Guide({ go }: { go: (screen: Screen) => void }) {
  const [chip, setChip] = useState("전체");
  return <div className="screen light-screen"><TopBar title="기부 가이드" /><main className="guide-content"><div className="guide-heading"><span>어렵지 않게, 하나씩</span><h1>나눔의 모든 것을<br />쉽게 알려드려요</h1></div><div className="chips">{["전체", "분야", "방법", "세제 혜택"].map((item) => <button type="button" className={chip === item ? "active" : ""} onClick={() => setChip(item)} key={item}>{item}</button>)}</div>
    <button type="button" className="featured-guide" onClick={() => go("detail")}><div><small>처음이라면 여기부터</small><h2>좋은 단체를 고르는<br />4가지 기준</h2><span>5분 읽기 <Icon name="arrow" size={15} /></span></div><Moa pose="think" size="medium" /></button>
    <h3 className="list-title">지금 많이 보는 가이드</h3>{["정기후원, 얼마부터 시작할까요?", "기부금 영수증 쉽게 챙기는 법", "돈 없이도 시작하는 다섯 가지 방법"].map((title, i) => <button type="button" className="guide-row" key={title} onClick={() => go("detail")}><span className={`row-number n${i}`}>0{i + 1}</span><div><small>{i === 1 ? "세제 혜택" : "기부 방법"}</small><strong>{title}</strong></div><Icon name="arrow" /></button>)}</main></div>;
}

function Quiz({ step, answers, select, next, back }: { step: number; answers: AnswerMap; select: (value: string) => void; next: () => void; back: () => void }) {
  const q = questions[step]; const selected = answers[step] ?? []; const canNext = q.optional || selected.length > 0;
  return <div className="screen quiz-screen"><TopBar title={`${step + 1} / 5`} onBack={back} action={<button type="button" className="circle-button dark" aria-label="추천 닫기" onClick={() => window.location.reload()}>×</button>} />
    <div className="quiz-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
    <main className="quiz-content"><div className="quiz-character"><Moa pose="think" size="medium" label="답을 함께 고민하는 모아" /><div className="speech">{step === 0 ? "편안한 만큼이면 충분해요!" : step === 4 ? "이제 거의 다 왔어요!" : "천천히 골라도 괜찮아요"}</div></div><span className="quiz-kicker">{q.kicker}</span><h1>{q.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1><p>{q.subtitle}</p>
      <div className={`answer-list ${q.options.length >= 6 ? "answer-grid" : ""}`}>{q.options.map(([label, hint]) => { const active = selected.includes(label); return <button type="button" className={active ? "selected" : ""} key={label} onClick={() => select(label)}><span className="answer-check"><Icon name="check" size={15} /></span><span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>{active && <span className="select-face"><i /><i /></span>}</button>; })}</div>
    </main>
    <div className="quiz-fixed"><PrimaryButton onClick={next} disabled={!canNext}>{step === 4 ? "내 추천 결과 보기" : q.optional && !selected.length ? "건너뛰기" : "다음으로"}</PrimaryButton></div>
  </div>;
}

function Result({ go, answers, save }: { go: (screen: Screen) => void; answers: AnswerMap; save: () => void }) {
  const main = answers[3]?.[0] === "재능·봉사" || answers[0]?.[0] === "금액보다 시간·재능" ? "재능기부·봉사" : answers[3]?.[0] === "일시후원" ? "필요할 때 일시후원" : "소액 정기후원";
  const cards = useMemo(() => [{ title: main, caption: "당신에게 가장 잘 맞아요", icon: main.includes("재능") ? "hands" : main.includes("일시") ? "heart" : "calendar", color: "lime", points: ["부담 없는 범위로 시작", "원할 때 변경·중단", "기부금 영수증 확인"] }, { title: "일상 속 포인트 기부", caption: "가볍게 함께하면 좋아요", icon: "spark", color: "cream", points: ["0원부터 시작", "걷기·포인트 활용"] }, { title: "우리 동네 물품 나눔", caption: "또 다른 좋은 선택", icon: "box", color: "cream", points: ["물건에 새 쓰임", "직접 참여 가능"] }], [main]);
  return <div className="screen result-screen"><TopBar title="추천 결과" onBack={() => go("home")} action={<button type="button" className="circle-button dark" aria-label="공유하기"><Icon name="share" /></button>} /><section className="result-top"><div className="result-copy"><span>딱 맞는 조합을 찾았어요!</span><h1>모아가 추천하는<br />세 가지 나눔이에요</h1></div><Moa pose="yay" size="large" label="추천 결과를 기뻐하는 모아" /></section><main className="result-sheet">{cards.map((card, index) => <article className={`recommend-card ${card.color}`} key={card.title}><div className="rank">{index + 1}</div><span className="recommend-icon"><Icon name={card.icon} size={28} /></span><small>{card.caption}</small><h2>{card.title}</h2><ul>{card.points.map((point) => <li key={point}><span><Icon name="check" size={13} /></span>{point}</li>)}</ul>{index === 0 && <PrimaryButton face={false} onClick={() => go("detail")}>시작 방법 보기 <Icon name="arrow" size={18} /></PrimaryButton>}</article>)}<button type="button" className="secondary-pill" onClick={save}><Icon name="bookmark" size={18} /> 결과 저장하기</button></main></div>;
}

function Detail({ go }: { go: (screen: Screen) => void }) {
  return <div className="screen detail-screen"><section className="detail-dark"><TopBar title="기부 방법" onBack={() => go("guide")} action={<button type="button" className="circle-button dark" aria-label="저장"><Icon name="bookmark" /></button>} /><div className="detail-hero"><div><span>작게, 오래 이어가는</span><h1>소액<br />정기후원</h1><p>매달 편안한 금액으로<br />꾸준한 변화를 만들어요.</p></div><Moa pose="hug" size="large" label="하트를 안고 있는 모아" /></div></section><main className="detail-sheet"><div className="detail-meta"><div><small>권장 시작</small><strong>월 5천 원부터</strong></div><div><small>세제 혜택</small><strong>확인 가능</strong></div></div><span className="section-label">이렇게 시작해요</span><ol className="steps"><li><span>1</span><div><strong>관심 분야 정하기</strong><p>마음이 오래 머무는 분야를 골라요.</p></div></li><li><span>2</span><div><strong>단체 투명성 확인하기</strong><p>공시 자료와 사용 내역을 살펴봐요.</p></div></li><li><span>3</span><div><strong>편안한 금액으로 시작하기</strong><p>언제든 변경하거나 멈출 수 있어요.</p></div></li></ol><div className="tip"><Icon name="info" /><p><strong>기억해 주세요</strong>기부금 영수증 발급과 해지 방법을 시작 전에 확인하면 좋아요.</p></div></main><div className="detail-fixed"><PrimaryButton onClick={() => go("home")}>공식 페이지 살펴보기</PrimaryButton></div></div>;
}

function EmptyScreen({ type, go, saved }: { type: "saved" | "more"; go: (screen: Screen) => void; saved: boolean }) {
  if (type === "more") return <div className="screen light-screen"><TopBar title="더보기" /><main className="more-content"><h1>내 앱 설정</h1>{[["settings", "화면과 알림 설정"], ["info", "마음모아 소개"], ["heart", "문의하기"]].map(([icon, label]) => <button type="button" className="setting-row" key={label}><span><Icon name={icon} /></span><strong>{label}</strong><Icon name="arrow" /></button>)}</main></div>;
  return <div className="screen light-screen"><TopBar title="저장함" /><main className="empty-content"><Moa pose={saved ? "hug" : "empty"} size="large" label={saved ? "저장 완료를 알리는 모아" : "저장된 결과를 찾는 모아"} /><h1>{saved ? "추천 결과를\n저장했어요!" : "아직 저장한\n마음이 없어요"}</h1><p>{saved ? "소액 정기후원 외 2개의 추천을\n이 기기에 안전하게 보관했어요." : "추천을 받고 마음에 드는\n기부 방법을 모아보세요."}</p><PrimaryButton onClick={() => go(saved ? "result" : "quiz")}>{saved ? "결과 다시 보기" : "추천 받아 보기"}</PrimaryButton></main></div>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home"); const [step, setStep] = useState(0); const [answers, setAnswers] = useState<AnswerMap>({}); const [saved, setSaved] = useState(false); const [toast, setToast] = useState("");
  const go = (target: Screen) => { if (target === "quiz") setStep(0); setScreen(target); document.querySelector(".app-shell")?.scrollTo({ top: 0 }); };
  const select = (value: string) => { const q = questions[step]; const current = answers[step] ?? []; const next = q.multiple ? current.includes(value) ? current.filter((v) => v !== value) : current.length < (step === 2 ? 3 : 4) ? [...current, value] : current : [value]; setAnswers({ ...answers, [step]: next }); };
  const next = () => step < 4 ? setStep(step + 1) : setScreen("result");
  const back = () => step > 0 ? setStep(step - 1) : setScreen("home");
  const save = () => { setSaved(true); setToast("추천 결과를 저장했어요"); setTimeout(() => setToast(""), 2200); };
  return <div className="stage"><div className="app-shell">{screen === "home" && <Home go={go} />}{screen === "guide" && <Guide go={go} />}{screen === "quiz" && <Quiz step={step} answers={answers} select={select} next={next} back={back} />}{screen === "result" && <Result go={go} answers={answers} save={save} />}{screen === "detail" && <Detail go={go} />}{screen === "saved" && <EmptyScreen type="saved" go={go} saved={saved} />}{screen === "more" && <EmptyScreen type="more" go={go} saved={saved} />}{!["quiz", "result", "detail"].includes(screen) && <BottomNav screen={screen} go={go} />}{toast && <div className="toast" role="status"><Icon name="check" size={16} /> {toast}</div>}</div></div>;
}
